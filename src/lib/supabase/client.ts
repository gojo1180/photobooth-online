import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project')) {
    // Provide a safe client instance or warn in console without throwing
    return createBrowserClient(
      supabaseUrl || 'https://mock.supabase.co',
      supabaseKey || 'mock-anon-key'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
