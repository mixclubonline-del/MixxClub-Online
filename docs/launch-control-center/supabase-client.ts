// src/integrations/supabase/client.ts for Launch Control Center
// This connects to the SAME Supabase backend as the main MixClub app

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// These are the SAME credentials as the main MixClub app
// Both apps share the same Supabase backend
const SUPABASE_URL = "https://kbbrehnyqpulbxyesril.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiYnJlaG55cXB1bGJ4eWVzcmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzOTI3NDIsImV4cCI6MjA3ODk2ODc0Mn0.vnPyNMOg1HiHh2QzKH059F4GOrjiR6P2OeW8qjOFKkQ";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
