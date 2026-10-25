import { createClient } from '@supabase/supabase-js';

// Read from Vite environment variables or localStorage override (for easy testing without restarting server)
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const localUrl = typeof window !== 'undefined' ? localStorage.getItem('stocksense_supabase_url') : null;
const localKey = typeof window !== 'undefined' ? localStorage.getItem('stocksense_supabase_key') : null;

export const SUPABASE_URL = localUrl || envUrl || '';
export const SUPABASE_ANON_KEY = localKey || envKey || '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  SUPABASE_URL.startsWith('https://') &&
  !SUPABASE_URL.includes('your-project-ref')
);

// Instantiate Supabase client safely
export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Helper to check live Supabase connectivity
export async function testConnection(url = SUPABASE_URL, key = SUPABASE_ANON_KEY) {
  if (!url || !key) {
    return { success: false, message: 'URL and Anon Key must be provided.' };
  }
  try {
    const testClient = createClient(url, key);
    const { error } = await testClient.from('categories').select('id').limit(1);
    // Even if table doesn't exist yet, a 404/400 from PostgREST confirms valid project URL and key
    if (error && error.code === 'PGRST301') {
      return { success: false, message: 'Invalid API Key or unauthorized.' };
    }
    return { success: true, message: 'Successfully connected to Supabase PostgreSQL instance!' };
  } catch (err) {
    return { success: false, message: err.message || 'Failed to connect.' };
  }
}

// Helper to save connection settings dynamically
export function saveCustomSupabaseConfig(url, key) {
  if (url && key) {
    localStorage.setItem('stocksense_supabase_url', url.trim());
    localStorage.setItem('stocksense_supabase_key', key.trim());
    window.location.reload();
  }
}

// Helper to reset back to environment variables
export function resetSupabaseConfig() {
  localStorage.removeItem('stocksense_supabase_url');
  localStorage.removeItem('stocksense_supabase_key');
  window.location.reload();
}
