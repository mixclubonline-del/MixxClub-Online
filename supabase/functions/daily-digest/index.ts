import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { createLogger } from '../_shared/logger.ts';

const logger = createLogger('daily-digest');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UnreadNotification {
  id: string;
  title: string;
  message: string;
  type: string | null;
  action_url: string | null;
  created_at: string;
}

interface UserDigest {
  user_id: string;
  email: string;
  full_name: string | null;
  notifications: UnreadNotification[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      logger.warn('RESEND_API_KEY not configured — skipping digest');
      return new Response(
        JSON.stringify({ success: true, message: 'Email not configured', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Get users who opted in to weekly_digest_email (our daily digest toggle)
    const { data: optedInUsers, error: prefsError } = await supabase
      .from('notification_preferences')
      .select('user_id')
      .eq('weekly_digest_email', true);

    if (prefsError) {
      logger.error('Failed to query notification_preferences', prefsError);
      throw prefsError;
    }

    if (!optedInUsers || optedInUsers.length === 0) {
      logger.info('No users opted in for digest');
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No opted-in users' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userIds = optedInUsers.map((u: { user_id: string }) => u.user_id);

    // 2. Fetch unread notifications from the last 24 hours for these users
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: unreadNotifs, error: notifsError } = await supabase
      .from('notifications')
      .select('id, user_id, title, message, type, action_url, created_at')
      .in('user_id', userIds)
      .eq('is_read', false)
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false });

    if (notifsError) {
      logger.error('Failed to query notifications', notifsError);
      throw notifsError;
    }

    if (!unreadNotifs || unreadNotifs.length === 0) {
      logger.info('No unread notifications to digest');
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No unread notifications' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Group notifications by user
    const userMap = new Map<string, UnreadNotification[]>();
    for (const n of unreadNotifs) {
      const list = userMap.get(n.user_id) || [];
      list.push(n);
      userMap.set(n.user_id, list);
    }

    // 4. Fetch profile info for users with unread notifications
    const activeUserIds = Array.from(userMap.keys());
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', activeUserIds);

    if (profilesError) {
      logger.error('Failed to query profiles', profilesError);
      throw profilesError;
    }

    // 5. Build digests and send emails
    let sentCount = 0;
    let errorCount = 0;

    for (const profile of (profiles || [])) {
      const notifications = userMap.get(profile.id);
      if (!notifications || notifications.length === 0 || !profile.email) continue;

      const digest: UserDigest = {
        user_id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        notifications,
      };

      try {
        const html = generateDigestEmail(digest);
        const subject = notifications.length === 1
          ? `You have 1 unread notification on Mixxclub`
          : `You have ${notifications.length} unread notifications on Mixxclub`;

        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
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
          errorCount++;
        } else {
          logger.info(`Digest sent to ${profile.email}`, { messageId: emailData.id, count: notifications.length });
          sentCount++;
        }
      } catch (emailErr) {
        logger.error(`Error sending digest to ${profile.email}`, emailErr);
        errorCount++;
      }
    }

    logger.info('Daily digest run complete', { sentCount, errorCount, totalUsers: activeUserIds.length });

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        errors: errorCount,
        totalUsersProcessed: activeUserIds.length,
      }),
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

// ─── Email template ───────────────────────────────────────────────

function getTypeIcon(type: string | null): string {
  switch (type) {
    case 'payment_received': return '💰';
    case 'milestone_reached': return '🎯';
    case 'collaboration_invite': return '🤝';
    case 'health_warning': return '⚠️';
    case 'health_critical': return '🔴';
    case 'follow': return '👤';
    case 'milestone': return '🏆';
    case 'admin_action': return '🔧';
    default: return '🔔';
  }
}

function getTypeColor(type: string | null): string {
  switch (type) {
    case 'payment_received': return '#10b981';
    case 'health_warning': return '#f59e0b';
    case 'health_critical': return '#ef4444';
    case 'milestone_reached':
    case 'milestone': return '#8b5cf6';
    case 'collaboration_invite': return '#3b82f6';
    default: return '#5B3CFF';
  }
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const hours = d.getUTCHours();
  const minutes = d.getUTCMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${h}:${minutes} ${ampm} UTC`;
}

function generateDigestEmail(digest: UserDigest): string {
  const userName = digest.full_name || digest.email.split('@')[0];
  const count = digest.notifications.length;

  const notifRows = digest.notifications.slice(0, 20).map((n) => {
    const icon = getTypeIcon(n.type);
    const color = getTypeColor(n.type);
    const time = formatTime(n.created_at);
    const actionLink = n.action_url
      ? `<a href="https://mixxclub.lovable.app${n.action_url}" style="color: ${color}; text-decoration: none; font-size: 13px; font-weight: 600;">View &rarr;</a>`
      : '';

    return `
      <tr>
        <td style="padding: 16px 20px; border-bottom: 1px solid #f0f0f0;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td width="40" valign="top">
                <div style="width: 36px; height: 36px; border-radius: 8px; background: ${color}15; text-align: center; line-height: 36px; font-size: 18px;">${icon}</div>
              </td>
              <td style="padding-left: 12px;" valign="top">
                <div style="font-weight: 600; color: #1a1a2e; font-size: 14px; margin-bottom: 4px;">${escapeHtml(n.title)}</div>
                <div style="color: #64748b; font-size: 13px; line-height: 1.5; margin-bottom: 6px;">${escapeHtml(n.message)}</div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #94a3b8; font-size: 12px;">${time}</span>
                  ${actionLink}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
  }).join('');

  const moreText = count > 20
    ? `<tr><td style="padding: 16px 20px; text-align: center; color: #64748b; font-size: 14px;">...and ${count - 20} more notifications</td></tr>`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Daily Digest — Mixxclub</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff;">

  <!-- Header -->
  <div style="background: linear-gradient(135deg, #5B3CFF 0%, #7C3AED 50%, #a855f7 100%); padding: 36px 24px; text-align: center;">
    <div style="font-size: 28px; margin-bottom: 8px;">📬</div>
    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Your Daily Digest</h1>
    <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0 0; font-size: 15px;">
      ${count} unread notification${count !== 1 ? 's' : ''} since yesterday
    </p>
  </div>

  <!-- Greeting -->
  <div style="padding: 28px 24px 12px 24px;">
    <p style="margin: 0; font-size: 16px; color: #1a1a2e;">
      Hey <strong>${escapeHtml(userName)}</strong>, here's what you missed:
    </p>
  </div>

  <!-- Notifications Table -->
  <div style="padding: 0 24px 24px 24px;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #fafafa; border-radius: 12px; overflow: hidden;">
      ${notifRows}
      ${moreText}
    </table>
  </div>

  <!-- CTA -->
  <div style="text-align: center; padding: 0 24px 32px 24px;">
    <a href="https://mixxclub.lovable.app/notifications" style="display: inline-block; background: linear-gradient(135deg, #5B3CFF 0%, #7C3AED 100%); color: white; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(91,60,255,0.3);">
      View All Notifications
    </a>
  </div>

  <!-- Footer -->
  <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
    <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 12px;">
      You're receiving this because you have daily digest enabled.
    </p>
    <p style="margin: 0; color: #94a3b8; font-size: 12px;">
      <a href="https://mixxclub.lovable.app/notification-preferences" style="color: #5B3CFF; text-decoration: none;">Manage preferences</a> · 
      © ${new Date().getFullYear()} Mixxclub
    </p>
  </div>

</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
