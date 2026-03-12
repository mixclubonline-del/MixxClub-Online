import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { getCorsHeaders } from '../_shared/cors.ts';
import { safeErrorResponse } from '../_shared/error-handler.ts';

const ipBlockSchema = z.object({
  ipAddress: z.string()
    .refine((val) => {
      const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
      const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
      return ipv4Regex.test(val) || ipv6Regex.test(val);
    }, 'Invalid IP address format'),
  reason: z.string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must not exceed 500 characters')
    .trim()
});

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

    const body = await req.json();
    const { ipAddress, reason } = ipBlockSchema.parse(body);

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
    console.error('Error in block-ip-address function:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const isAuthError = error.message?.includes('Unauthorized') || error.message?.includes('Admin');
    return new Response(
      JSON.stringify({ error: isAuthError ? 'Access denied' : 'Operation failed' }),
      { 
        status: isAuthError ? 403 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
