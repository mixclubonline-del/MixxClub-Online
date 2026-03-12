import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { getCorsHeaders } from '../_shared/cors.ts';
import { safeErrorResponse } from '../_shared/error-handler.ts';

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('Unauthorized');
    }

    console.log('Deleting account for user:', user.id);

    // Log the deletion request
    await supabaseClient.from('audit_logs').insert({
      user_id: user.id,
      action: 'ACCOUNT_DELETION_REQUESTED',
      table_name: 'auth.users',
      record_id: user.id,
      new_data: { email: user.email, deleted_at: new Date().toISOString() },
    });

    // Delete user data (cascade will handle related records)
    // Note: Most tables should have ON DELETE CASCADE foreign keys
    await supabaseClient.from('profiles').delete().eq('id', user.id);

    // Delete auth user (this will cascade to all related tables)
    const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      throw deleteError;
    }

    console.log('Account deleted successfully');

    return new Response(JSON.stringify({ success: true, message: 'Account deleted successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return safeErrorResponse(error, corsHeaders);
  }
});
