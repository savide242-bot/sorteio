-- ==============================================================================
-- BABYBITES EARLY ACCESS GIVEAWAY — SUPABASE DATABASE SCHEMA & MIGRATION
-- ==============================================================================

-- 1. Create sequential sequence for atomic lucky numbers (BB0001, BB0002, ...)
CREATE SEQUENCE IF NOT EXISTS lucky_number_seq START 1;

-- 2. Helper function to generate formatted sequential code
CREATE OR REPLACE FUNCTION generate_lucky_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_val BIGINT;
BEGIN
  next_val := nextval('lucky_number_seq');
  RETURN 'BB' || lpad(next_val::TEXT, 4, '0');
END;
$$;

-- 3. Create participants table
CREATE TABLE IF NOT EXISTS public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  normalized_email TEXT NOT NULL UNIQUE,
  baby_age TEXT NOT NULL,
  country TEXT,
  feeding_challenge TEXT,
  lucky_number TEXT NOT NULL UNIQUE,
  registration_status TEXT NOT NULL DEFAULT 'valid' CHECK (registration_status IN ('valid', 'disqualified', 'pending')),
  email_verified BOOLEAN NOT NULL DEFAULT true,
  consent_given BOOLEAN NOT NULL DEFAULT true,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  disqualification_reason TEXT
);

-- Indexes for performance and uniqueness
CREATE INDEX IF NOT EXISTS idx_participants_normalized_email ON public.participants(normalized_email);
CREATE INDEX IF NOT EXISTS idx_participants_lucky_number ON public.participants(lucky_number);
CREATE INDEX IF NOT EXISTS idx_participants_registration_status ON public.participants(registration_status);
CREATE INDEX IF NOT EXISTS idx_participants_registered_at ON public.participants(registered_at DESC);

-- 4. Create email logs table for auditing delivery attempts
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES public.participants(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  email_type TEXT NOT NULL CHECK (email_type IN ('admin_notification', 'participant_confirmation')),
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'pending')),
  resend_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  attempts INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_email_logs_participant_id ON public.email_logs(participant_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs(created_at DESC);

-- 5. Secure Backend Atomic Registration RPC function
-- Ensures normalization, duplicate rejection, and sequential lucky number generation
CREATE OR REPLACE FUNCTION public.register_giveaway_participant(
  p_full_name TEXT,
  p_email TEXT,
  p_baby_age TEXT,
  p_country TEXT DEFAULT NULL,
  p_feeding_challenge TEXT DEFAULT NULL,
  p_consent_given BOOLEAN DEFAULT TRUE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_normalized_email TEXT;
  v_lucky_number TEXT;
  v_new_participant public.participants%ROWTYPE;
BEGIN
  -- Normalize email: trim and lowercase
  v_normalized_email := lower(trim(p_email));

  -- Validate inputs
  IF length(trim(p_full_name)) < 2 THEN
    RAISE EXCEPTION 'Full name is required and must be at least 2 characters.';
  END IF;

  IF position('@' in v_normalized_email) = 0 OR position('.' in v_normalized_email) = 0 THEN
    RAISE EXCEPTION 'Please provide a valid email address.';
  END IF;

  IF NOT p_consent_given THEN
    RAISE EXCEPTION 'Consent to giveaway rules and privacy policy is required.';
  END IF;

  -- Check for existing registration
  IF EXISTS (SELECT 1 FROM public.participants WHERE normalized_email = v_normalized_email) THEN
    RAISE EXCEPTION 'This email address is already registered for the BabyBites Giveaway. Each participant may register once.';
  END IF;

  -- Generate atomic sequential lucky number (BB0001, etc.)
  v_lucky_number := generate_lucky_number();

  -- Insert record
  INSERT INTO public.participants (
    full_name,
    email,
    normalized_email,
    baby_age,
    country,
    feeding_challenge,
    lucky_number,
    registration_status,
    email_verified,
    consent_given,
    registered_at,
    updated_at
  ) VALUES (
    trim(p_full_name),
    trim(p_email),
    v_normalized_email,
    p_baby_age,
    trim(p_country),
    trim(p_feeding_challenge),
    v_lucky_number,
    'valid',
    true,
    p_consent_given,
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  RETURNING * INTO v_new_participant;

  -- Return created participant data
  RETURN to_jsonb(v_new_participant);
END;
$$;

-- 6. Row Level Security (RLS) Configuration
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Allow public (anon) users ONLY to call the register RPC (cannot directly read the table)
-- Prevent public visitors from querying or dumping participant data
CREATE POLICY "Public cannot select participants directly"
  ON public.participants
  FOR SELECT
  TO anon
  USING (false);

-- Authenticated admins can view all participants
CREATE POLICY "Admins have full read access to participants"
  ON public.participants
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated admins can update participant status (e.g. mark disqualified with reason)
-- But lucky_number cannot be modified (enforced by trigger below)
CREATE POLICY "Admins can update participant status"
  ON public.participants
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Email logs policy
CREATE POLICY "Admins have access to email logs"
  ON public.email_logs
  FOR ALL
  TO authenticated
  USING (true);

-- 7. Trigger to permanently protect lucky numbers from modification
CREATE OR REPLACE FUNCTION protect_lucky_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.lucky_number <> OLD.lucky_number THEN
    RAISE EXCEPTION 'Lucky numbers are permanent and cannot be modified once assigned.';
  END IF;
  NEW.updated_at := timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_lucky_number ON public.participants;
CREATE TRIGGER trg_protect_lucky_number
  BEFORE UPDATE ON public.participants
  FOR EACH ROW
  EXECUTE FUNCTION protect_lucky_number();
