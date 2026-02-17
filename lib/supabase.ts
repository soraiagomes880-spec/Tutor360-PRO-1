
import { createClient } from '@supabase/supabase-js';

// Safe environment variable access for Vite
const getEnv = (key: string) => {
  try {
    // Prefer import.meta.env for Vite
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key] || null;
    }
    // Fallback to process.env if polyfilled
    if (typeof process !== 'undefined' && process.env) {
      return (process.env as any)[key] || null;
    }
    return null;
  } catch (e) {
    console.warn("Error accessing env vars:", e);
    return null;
  }
};

let supabaseInstance = null;

try {
  const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL') || (typeof window !== 'undefined' ? localStorage.getItem('supabase_url') : null);
  const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY') || (typeof window !== 'undefined' ? localStorage.getItem('supabase_key') : null);

  if (supabaseUrl && supabaseAnonKey &&
    supabaseUrl !== "undefined" && supabaseAnonKey !== "undefined" &&
    supabaseUrl !== "" && supabaseAnonKey !== "") {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (error) {
  console.error("Supabase initialization failed:", error);
  // Fail gracefully, app acts as if not connected
  supabaseInstance = null;
}

export const supabase = supabaseInstance;

export const saveSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem('supabase_url', url);
  localStorage.setItem('supabase_key', key);
  window.location.reload();
};
