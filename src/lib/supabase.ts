import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vfqxzqhitumrxshrcqwr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmcXh6cWhpdHVtcnhzaHJjcXdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNjQ5MjQsImV4cCI6MjA1NTY0MDkyNH0.nmS9wBO364zKGHSRIsq_rUAkbYNhutWlU_zXAqfUd6U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});