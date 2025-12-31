import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  sendEmail?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, title, body, data, sendEmail = true }: PushPayload = await req.json();
    
    console.log('Sending notification to user:', userId, { title, body });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's push tokens
    const { data: tokens, error: tokensError } = await supabase
      .from('push_tokens')
      .select('token, platform')
      .eq('user_id', userId);

    if (tokensError) {
      console.error('Error fetching push tokens:', tokensError);
    }

    // Store notification in database
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: data?.type || 'general',
        title,
        message: body,
        action_url: data?.action_url || null,
        metadata: data,
      });

    if (notifError) {
      console.error('Error storing notification:', notifError);
    }

    const results: { push?: string; email?: string } = {};

    // Send push notifications to all registered devices
    if (tokens && tokens.length > 0) {
      console.log(`Found ${tokens.length} push tokens for user`);
      
      // Note: In production, you'd integrate with FCM/APNS here
      // For now, we rely on the Supabase realtime for in-app notifications
      results.push = `${tokens.length} devices targeted`;
    }

    // Send email notification if enabled
    if (sendEmail) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name, notification_preferences')
        .eq('id', userId)
        .single();

      if (profile?.email) {
        // Check notification preferences
        const prefs = profile.notification_preferences as Record<string, boolean> || {};
        const emailsEnabled = prefs.email_notifications !== false;

        if (emailsEnabled) {
          const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
          
          if (RESEND_API_KEY) {
            const emailHtml = generateNotificationEmail(
              profile.full_name || profile.email.split('@')[0],
              title,
              body,
              data?.action_url
            );

            const emailResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
              },
              body: JSON.stringify({
                from: 'MixClub <notifications@resend.dev>',
                to: [profile.email],
                subject: title,
                html: emailHtml,
              }),
            });

            const emailData = await emailResponse.json();
            results.email = emailResponse.ok ? 'sent' : `failed: ${emailData.message}`;
            console.log('Email result:', results.email);
          } else {
            results.email = 'skipped - no API key';
          }
        } else {
          results.email = 'disabled by user';
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateNotificationEmail(
  userName: string,
  title: string,
  body: string,
  actionUrl?: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
  
  <div style="background: linear-gradient(135deg, #5B3CFF 0%, #7C3AED 100%); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🎵 MixClub</h1>
  </div>
  
  <div style="background: white; padding: 30px;">
    <p style="margin: 0 0 15px 0; font-size: 16px;">Hi ${userName},</p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #5B3CFF; margin: 20px 0;">
      <h2 style="color: #5B3CFF; margin: 0 0 10px 0; font-size: 18px;">${title}</h2>
      <p style="margin: 0; color: #333; font-size: 16px;">${body}</p>
    </div>
    
    ${actionUrl ? `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${actionUrl}" style="display: inline-block; background: #5B3CFF; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold;">View Details</a>
    </div>
    ` : ''}
    
    <p style="margin: 20px 0 0 0; color: #666; font-size: 14px;">
      — The MixClub Team
    </p>
  </div>
  
  <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
    <p style="margin: 0;">
      <a href="https://mixclubonline.com/settings" style="color: #5B3CFF;">Manage notification preferences</a>
    </p>
  </div>
  
</body>
</html>
  `;
}
