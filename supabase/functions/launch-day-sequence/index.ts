import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify admin
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: adminRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!adminRole) {
      return new Response(JSON.stringify({ error: 'Admin required' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const now = new Date().toISOString();

    // 1. Flip platform to live
    await supabaseAdmin
      .from('platform_config')
      .upsert({
        key: 'launch_mode',
        value: JSON.stringify('live'),
        updated_at: now,
        updated_by: user.id,
      }, { onConflict: 'key' });

    // 2. Record launch timestamp
    await supabaseAdmin
      .from('platform_config')
      .upsert({
        key: 'launched_at',
        value: JSON.stringify(now),
        updated_at: now,
        updated_by: user.id,
      }, { onConflict: 'key' });

    // 3. Post broadcast notification
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: user.id,
        type: 'broadcast',
        title: '🚀 Mixx Club is LIVE!',
        message: 'The platform is officially open. Welcome to the future of music collaboration.',
        metadata: { broadcast: true, launch: true },
      });

    // 4. Log activity
    await supabaseAdmin
      .from('activity_feed')
      .insert({
        user_id: user.id,
        activity_type: 'launch',
        title: '🚀 Mixx Club is officially LIVE!',
        description: 'The platform has been launched and is now open to the public.',
        is_public: true,
        metadata: { launched_at: now, launched_by: user.id },
      });

    // 5. Send "We're Live" blast to all invited/converted waitlist users
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    let emailsSent = 0;

    if (resendApiKey) {
      const { data: recipients } = await supabaseAdmin
        .from('waitlist_signups')
        .select('email, full_name')
        .in('status', ['invited', 'converted']);

      if (recipients && recipients.length > 0) {
        // Send in batches of 10
        for (let i = 0; i < recipients.length; i += 10) {
          const batch = recipients.slice(i, i + 10);
          await Promise.all(batch.map(async (r: any) => {
            try {
              await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${resendApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from: 'Mixx Club <noreply@mixxclub.com>',
                  to: [r.email],
                  subject: '🚀 Mixx Club is LIVE — Welcome!',
                  html: `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff;">
                      <div style="text-align: center; margin-bottom: 32px;">
                        <h1 style="font-size: 32px; font-weight: 900; color: #111; margin: 0;">We're Live! 🚀</h1>
                        <p style="color: #666; margin-top: 8px; font-size: 16px;">Mixx Club is officially open.</p>
                      </div>
                      <div style="background: #f9f9f9; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                        <p style="margin: 0 0 16px; color: #333; font-size: 15px;">
                          Hey${r.full_name ? ' ' + r.full_name : ''},
                        </p>
                        <p style="margin: 0 0 16px; color: #333; font-size: 15px;">
                          The wait is over. Mixx Club — the future of music collaboration — is now live and open for business.
                        </p>
                        <p style="margin: 0; color: #333; font-size: 15px;">
                          As one of our earliest supporters, you're part of something special. Come see what we've built.
                        </p>
                      </div>
                      <div style="text-align: center;">
                        <a href="https://mixxclub.lovable.app" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #06b6d4); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px;">
                          Enter Mixx Club →
                        </a>
                      </div>
                      <p style="text-align: center; color: #999; font-size: 12px; margin-top: 32px;">
                        Mixx Club · The Future of Music Collaboration
                      </p>
                    </div>
                  `,
                }),
              });
              emailsSent++;
            } catch (e) {
              console.error(`Failed to email ${r.email}:`, e);
            }
          }));
        }
      }
    }

    // 6. Log admin action
    await supabaseAdmin
      .from('admin_quick_actions')
      .insert({
        action_type: 'launch_platform',
        description: `Platform launched. ${emailsSent} launch emails sent.`,
        performed_by: user.id,
        metadata: { emails_sent: emailsSent, launched_at: now },
      });

    return new Response(
      JSON.stringify({ success: true, launched_at: now, emails_sent: emailsSent }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Launch day sequence error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
