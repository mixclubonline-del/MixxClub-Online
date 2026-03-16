import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { createLogger } from '../_shared/logger.ts';
import { renderDigestEmail, logEmailSend } from '../_shared/email-templates.ts';

const logger = createLogger('daily-digest');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      logger.warn('RESEND_API_KEY not configured — skipping digest');
      await logEmailSend(supabase, 'all', 'daily_digest', 'skipped', 'RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: true, message: 'Email not configured', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: optedInUsers, error: prefsError } = await supabase
      .from('notification_preferences')
      .select('user_id')
      .eq('weekly_digest_email', true);

    if (prefsError) { logger.error('Failed to query preferences', prefsError); throw prefsError; }
    if (!optedInUsers || optedInUsers.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No opted-in users' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userIds = optedInUsers.map((u: { user_id: string }) => u.user_id);
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: unreadNotifs, error: notifsError } = await supabase
      .from('notifications')
      .select('id, user_id, title, message, type, action_url, created_at')
      .in('user_id', userIds)
      .eq('is_read', false)
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false });

    if (notifsError) { logger.error('Failed to query notifications', notifsError); throw notifsError; }
    if (!unreadNotifs || unreadNotifs.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No unread notifications' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userMap = new Map<string, typeof unreadNotifs>();
    for (const n of unreadNotifs) {
      const list = userMap.get(n.user_id) || [];
      list.push(n);
      userMap.set(n.user_id, list);
    }

    const activeUserIds = Array.from(userMap.keys());
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', activeUserIds);

    let sentCount = 0;
    let errorCount = 0;

    for (const profile of (profiles || [])) {
      const notifications = userMap.get(profile.id);
      if (!notifications || notifications.length === 0 || !profile.email) continue;

      try {
        const html = renderDigestEmail(profile.full_name || profile.email.split('@')[0], notifications);
        const subject = notifications.length === 1
          ? `You have 1 unread notification on Mixxclub`
          : `You have ${notifications.length} unread notifications on Mixxclub`;

        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
          body: JSON.stringify({
            from: 'Mixxclub <onboarding@resend.dev>',
            to: [profile.email],
            subject,
            html,
          }),
        });

        const emailData = await emailRes.json();

        if (!emailRes.ok) {
          logger.error(`Failed to send digest to ${profile.email}`, emailData);
          await logEmailSend(supabase, profile.email, 'daily_digest', 'failed', emailData.message);
          errorCount++;
        } else {
          await logEmailSend(supabase, profile.email, 'daily_digest', 'sent', undefined, { messageId: emailData.id, count: notifications.length });
          sentCount++;
        }
      } catch (emailErr) {
        logger.error(`Error sending digest to ${profile.email}`, emailErr);
        await logEmailSend(supabase, profile.email, 'daily_digest', 'failed', (emailErr as Error).message);
        errorCount++;
      }
    }

    logger.info('Daily digest run complete', { sentCount, errorCount, totalUsers: activeUserIds.length });

    return new Response(
      JSON.stringify({ success: true, sent: sentCount, errors: errorCount, totalUsersProcessed: activeUserIds.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    logger.error('Daily digest failed', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
