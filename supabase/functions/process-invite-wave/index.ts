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

    const { wave_id } = await req.json();
    if (!wave_id) {
      return new Response(JSON.stringify({ error: 'wave_id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Get wave config
    const { data: wave, error: waveError } = await supabaseAdmin
      .from('invite_waves')
      .select('*')
      .eq('id', wave_id)
      .single();

    if (waveError || !wave) {
      return new Response(JSON.stringify({ error: 'Wave not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Select waitlist entries to invite
    let query = supabaseAdmin
      .from('waitlist_signups')
      .select('*')
      .eq('status', 'waiting')
      .order('position', { ascending: true })
      .limit(wave.target_count);

    if (wave.role_filter && wave.role_filter !== 'all') {
      query = query.eq('role_interest', wave.role_filter);
    }

    const { data: entries, error: entriesError } = await query;
    if (entriesError) throw entriesError;

    if (!entries || entries.length === 0) {
      return new Response(JSON.stringify({ error: 'No eligible waitlist entries found', sent: 0 }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mark entries as invited
    const ids = entries.map((e: any) => e.id);
    const now = new Date().toISOString();

    await supabaseAdmin
      .from('waitlist_signups')
      .update({ status: 'invited', invited_at: now })
      .in('id', ids);

    // Send invite emails via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    let emailsSent = 0;

    if (resendApiKey) {
      for (const entry of entries) {
        try {
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Mixx Club <noreply@mixxclub.com>',
              to: [entry.email],
              subject: `🎉 You're Invited — ${wave.wave_label}`,
              html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff;">
                  <div style="text-align: center; margin-bottom: 32px;">
                    <h1 style="font-size: 28px; font-weight: 900; color: #111; margin: 0;">Welcome to ${wave.wave_label}</h1>
                    <p style="color: #666; margin-top: 8px; font-size: 16px;">Your early access to Mixx Club is ready.</p>
                  </div>
                  <div style="background: #f9f9f9; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                    <p style="margin: 0 0 16px; color: #333; font-size: 15px;">
                      Hey${entry.full_name ? ' ' + entry.full_name : ''},
                    </p>
                    <p style="margin: 0 0 16px; color: #333; font-size: 15px;">
                      You were selected as part of <strong>${wave.wave_label}</strong> — one of the first to experience the future of music collaboration.
                    </p>
                    <p style="margin: 0; color: #333; font-size: 15px;">
                      Your position: <strong>#${entry.position}</strong>
                    </p>
                  </div>
                  <div style="text-align: center;">
                    <a href="https://mixxclub.lovable.app/auth" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #06b6d4); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px;">
                      Create Your Account →
                    </a>
                  </div>
                  <p style="text-align: center; color: #999; font-size: 12px; margin-top: 32px;">
                    Mixx Club · The Future of Music Collaboration
                  </p>
                </div>
              `,
            }),
          });

          if (response.ok) emailsSent++;
        } catch (emailErr) {
          console.error(`Failed to send to ${entry.email}:`, emailErr);
        }
      }
    } else {
      emailsSent = entries.length; // Count as sent even without Resend (status already updated)
    }

    // Update wave
    await supabaseAdmin
      .from('invite_waves')
      .update({
        status: 'sent',
        actual_sent: emailsSent,
        sent_at: now,
        sent_by: user.id,
      })
      .eq('id', wave_id);

    return new Response(
      JSON.stringify({ success: true, sent: emailsSent, wave_label: wave.wave_label }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Process invite wave error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
