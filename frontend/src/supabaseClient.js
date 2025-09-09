import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zfhgbazbuxednpjrxcbg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmaGdiYXpidXhlZG5wanJ4Y2JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NTAwMzYsImV4cCI6MjA2OTUyNjAzNn0.PPNgPHjab_62sSPFa3S2dZFvjZ0G0eMZTFA6xi9nGks';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
