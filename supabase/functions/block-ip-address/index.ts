import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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

    // Verify admin access
    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roles) {
      throw new Error('Admin access required');
    }

    const { ipAddress, reason } = await req.json();

    if (!ipAddress) {
      throw new Error('IP address is required');
    }

    console.log('Blocking IP:', ipAddress, 'Reason:', reason);

    // Log the security event
    const { error: logError } = await supabaseClient
      .from('admin_security_events')
      .insert({
        event_type: 'ip_blocked',
        severity: 'high',
        description: `IP address ${ipAddress} has been blocked`,
        admin_id: user.id,
        ip_address: ipAddress,
        details: { reason, blocked_by: user.email },
        auto_action_taken: 'ip_blocked'
      });

    if (logError) {
      console.error('Failed to log security event:', logError);
    }

    // In a production environment, you would implement actual IP blocking
    // through your firewall, load balancer, or CDN (e.g., Cloudflare)
    // For now, we just log the event

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'IP address blocked successfully',
        note: 'IP blocking is logged. Implement actual blocking via your infrastructure provider.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
