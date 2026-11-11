export interface Participant {
  id: string;
  full_name: string;
  email: string;
  normalized_email: string;
  baby_age: string;
  country?: string;
  feeding_challenge?: string;
  lucky_number: string;
  registration_status: 'valid' | 'disqualified' | 'pending';
  email_verified: boolean;
  consent_given: boolean;
  registered_at: string;
  updated_at: string;
  disqualification_reason?: string;
}

export interface RegistrationFormData {
  fullName: string;
  email: string;
  babyAge: string;
  country?: string;
  feedingChallenge?: string;
  consentGiven: boolean;
  honeypot?: string; // anti-spam
}

export interface EmailLog {
  id: string;
  participant_id: string;
  recipient_email: string;
  email_type: 'admin_notification' | 'participant_confirmation';
  status: 'sent' | 'failed' | 'pending';
  resend_id?: string;
  error_message?: string;
  created_at: string;
  attempts: number;
}

export interface DashboardStats {
  totalRegistrations: number;
  verifiedEmails: number;
  pendingEmailVerification: number;
  validRegistrations: number;
  disqualifiedRegistrations: number;
  registrationsByCountry: Record<string, number>;
  registrationsByBabyAge: Record<string, number>;
  latestRegistrations: Participant[];
}

export interface CampaignConfig {
  adminEmail: string;
  resendApiKey: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  closingDate: string; // ISO string: 2026-11-20T23:59:59Z
  launchDate: string; // ISO string: 2026-11-30T00:00:00Z
  maxWinners: number;
  isRegistrationOpen: boolean;
}
