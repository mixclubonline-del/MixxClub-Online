import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { requireAdmin, authErrorResponse } from '../_shared/auth.ts';
import { safeErrorResponse } from '../_shared/error-handler.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authResult = await requireAdmin(req);
    if ('error' in authResult) return authErrorResponse(authResult, corsHeaders);

    const { title, message, actionUrl, audience } = await req.json();

    if (!title || !message) {
      return new Response(
        JSON.stringify({ error: 'Title and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get target user IDs based on audience
    let userIds: string[] = [];

    if (audience === 'all') {
      const { data } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .limit(1000);
      userIds = (data || []).map((u: any) => u.id);
    } else {
      // Filter by role
      const { data } = await supabaseAdmin
        .from('user_roles')
        .select('user_id')
        .eq('role', audience)
        .limit(1000);
      userIds = (data || []).map((u: any) => u.user_id);
    }

    if (userIds.length === 0) {
      return new Response(
        JSON.stringify({ success: true, count: 0, message: 'No matching users found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Bulk insert notifications (batches of 100)
    const notifications = userIds.map((userId: string) => ({
      user_id: userId,
      type: 'broadcast',
      title,
      message,
      action_url: actionUrl || null,
      is_read: false,
    }));

    let insertedCount = 0;
    const batchSize = 100;
    for (let i = 0; i < notifications.length; i += batchSize) {
      const batch = notifications.slice(i, i + batchSize);
      const { error } = await supabaseAdmin
        .from('notifications')
        .insert(batch);
      if (error) {
        console.error('Batch insert error:', error);
      } else {
        insertedCount += batch.length;
      }
    }

    // Log the broadcast as a quick action for history
    await supabaseAdmin
      .from('admin_quick_actions')
      .insert({
        action_type: 'broadcast',
        description: title,
        performed_by: authResult.user.id,
        metadata: { title, message, audience, count: insertedCount, actionUrl },
      });

    return new Response(
      JSON.stringify({ success: true, count: insertedCount }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return safeErrorResponse(error, corsHeaders);
  }
});
