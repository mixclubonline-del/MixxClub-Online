// src/integrations/supabase/client.ts for Launch Control Center
// This connects to the SAME Supabase backend as the main MixClub app
// 
// NOTE: This is documentation only. The actual client uses environment variables.
// See: src/integrations/supabase/client.ts for the real implementation.

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use environment variables - these are set automatically by Lovable Cloud
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
