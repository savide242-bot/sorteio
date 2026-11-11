import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables or localStorage config
const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

function getEffectiveConfig() {
  try {
    const raw = localStorage.getItem('babybites_giveaway_config_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.supabaseUrl && parsed.supabaseAnonKey) {
        return {
          url: parsed.supabaseUrl.trim(),
          key: parsed.supabaseAnonKey.trim(),
        };
      }
    }
  } catch (e) {
    // Ignore error
  }
  return {
    url: envUrl.trim(),
    key: envKey.trim(),
  };
}

const config = getEffectiveConfig();

export const isSupabaseConfigured = (): boolean => {
  const current = getEffectiveConfig();
  return Boolean(current.url && current.key && current.url.startsWith('https://'));
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(config.url, config.key)
  : null;

export function reinitializeSupabaseClient(url: string, key: string): SupabaseClient | null {
  if (url && key && url.startsWith('https://')) {
    return createClient(url, key);
  }
  return null;
}
