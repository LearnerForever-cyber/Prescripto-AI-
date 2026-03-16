import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Database features will be disabled.');
}

// Standard client for public data
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

/**
 * Helper to create a Supabase client with a Clerk JWT.
 * This allows Supabase to identify the user via RLS.
 */
export const createClerkSupabaseClient = (clerkToken: string | null) => {
  return createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder',
    {
      global: {
        headers: {
          Authorization: clerkToken ? `Bearer ${clerkToken}` : '',
        },
      },
    }
  );
};
