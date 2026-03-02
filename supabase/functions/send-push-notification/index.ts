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
  badge?: number;
  sound?: string;
}

interface FCMResponse {
  success: boolean;
  message_id?: string;
  error?: { code: string; message: string };
}

// Initialize Firebase Admin SDK for FCM/APNS
async function sendFCMNotification(
  tokens: string[],
  notification: { title: string; body: string },
  data?: Record<string, string>
): Promise<{ successCount: number; failureCount: number; failedTokens: string[] }> {
  const serviceAccountJson = Deno.env.get('FCM_SERVICE_ACCOUNT');
  
  if (!serviceAccountJson) {
    console.log('[push] FCM_SERVICE_ACCOUNT not configured, using legacy FCM');
    return sendLegacyFCM(tokens, notification, data);
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    const accessToken = await getFirebaseAccessToken(serviceAccount);
    
    let successCount = 0;
    let failureCount = 0;
    const failedTokens: string[] = [];

    // Send to each token individually with Firebase HTTP v1 API
    for (const token of tokens) {
      try {
        const response = await fetch(
          `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: {
                token,
                notification: {
                  title: notification.title,
                  body: notification.body,
                },
                data: data || {},
                android: {
                  priority: 'high',
                  notification: {
                    sound: 'default',
                    channel_id: 'default',
                  },
                },
                apns: {
                  payload: {
                    aps: {
                      sound: 'default',
                      badge: 1,
                    },
                  },
                },
              },
            }),
          }
        );

        if (response.ok) {
          successCount++;
        } else {
          const error = await response.json();
          console.error('[push] FCM error for token:', error);
          failureCount++;
          
          // Check if token is invalid
          if (error.error?.details?.some((d: any) => 
            d.errorCode === 'UNREGISTERED' || d.errorCode === 'INVALID_ARGUMENT'
          )) {
            failedTokens.push(token);
          }
        }
      } catch (e) {
        console.error('[push] FCM request error:', e);
        failureCount++;
      }
    }

    return { successCount, failureCount, failedTokens };
  } catch (e) {
    console.error('[push] FCM initialization error:', e);
    return { successCount: 0, failureCount: tokens.length, failedTokens: [] };
  }
}

// Get Firebase access token using service account JWT
async function getFirebaseAccessToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600; // 1 hour expiry

  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: exp,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const signInput = `${headerB64}.${payloadB64}`;

  // Import private key and sign
  const privateKey = serviceAccount.private_key;
  const pemHeader = '-----BEGIN PRIVATE KEY-----';
  const pemFooter = '-----END PRIVATE KEY-----';
  const pemContents = privateKey.replace(pemHeader, '').replace(pemFooter, '').replace(/\s/g, '');
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, encoder.encode(signInput));
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${signInput}.${signatureB64}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

// Fallback to legacy FCM API
async function sendLegacyFCM(
  tokens: string[],
  notification: { title: string; body: string },
  data?: Record<string, string>
): Promise<{ successCount: number; failureCount: number; failedTokens: string[] }> {
  const fcmServerKey = Deno.env.get('FCM_SERVER_KEY');
  
  if (!fcmServerKey) {
    console.log('[push] No FCM credentials configured');
    return { successCount: 0, failureCount: tokens.length, failedTokens: [] };
  }

  try {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${fcmServerKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registration_ids: tokens,
        notification: {
          title: notification.title,
          body: notification.body,
          sound: 'default',
        },
        data: data || {},
        priority: 'high',
      }),
    });

    const result = await response.json();
    const failedTokens: string[] = [];

    // Check for failed tokens
    if (result.results) {
      result.results.forEach((res: any, index: number) => {
        if (res.error === 'NotRegistered' || res.error === 'InvalidRegistration') {
          failedTokens.push(tokens[index]);
        }
      });
    }

    return {
      successCount: result.success || 0,
      failureCount: result.failure || 0,
      failedTokens,
    };
  } catch (e) {
    console.error('[push] Legacy FCM error:', e);
    return { successCount: 0, failureCount: tokens.length, failedTokens: [] };
  }
}

// Clean up invalid tokens from database
async function cleanupInvalidTokens(supabase: any, tokens: string[]) {
  if (tokens.length === 0) return;

  console.log(`[push] Cleaning up ${tokens.length} invalid tokens`);
  
  const { error } = await supabase
    .from('push_tokens')
    .delete()
    .in('token', tokens);

  if (error) {
    console.error('[push] Token cleanup error:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, title, body, data, sendEmail = true, badge, sound }: PushPayload = await req.json();
    
    console.log('[push] Sending notification to user:', userId, { title, body });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's push tokens
    const { data: tokens, error: tokensError } = await supabase
      .from('push_tokens')
      .select('token, platform')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (tokensError) {
      console.error('[push] Error fetching push tokens:', tokensError);
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
      console.error('[push] Error storing notification:', notifError);
    }

    const results: { 
      push?: { android?: { success: number; failure: number }; ios?: { success: number; failure: number } }; 
      email?: string;
      totalDevices?: number;
    } = {};

    // Send push notifications
    if (tokens && tokens.length > 0) {
      console.log(`[push] Found ${tokens.length} push tokens for user`);
      
      const androidTokens = tokens.filter(t => t.platform === 'android').map(t => t.token);
      const iosTokens = tokens.filter(t => t.platform === 'ios').map(t => t.token);
      const allTokens = [...androidTokens, ...iosTokens];
      
      results.push = {};
      results.totalDevices = tokens.length;

      if (allTokens.length > 0) {
        const fcmResult = await sendFCMNotification(
          allTokens,
          { title, body },
          { ...data, badge: String(badge || 1), sound: sound || 'default' }
        );

        // Clean up invalid tokens
        if (fcmResult.failedTokens.length > 0) {
          await cleanupInvalidTokens(supabase, fcmResult.failedTokens);
        }

        results.push = {
          android: androidTokens.length > 0 ? { 
            success: fcmResult.successCount, 
            failure: fcmResult.failureCount 
          } : undefined,
          ios: iosTokens.length > 0 ? { 
            success: fcmResult.successCount, 
            failure: fcmResult.failureCount 
          } : undefined,
        };
      }
    }

    // Send email notification if enabled
    if (sendEmail) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name, notification_preferences')
        .eq('id', userId)
        .single();

      if (profile?.email) {
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
                from: 'Mixxclub <notifications@resend.dev>',
                to: [profile.email],
                subject: title,
                html: emailHtml,
              }),
            });

            const emailData = await emailResponse.json();
            results.email = emailResponse.ok ? 'sent' : `failed: ${emailData.message}`;
            console.log('[push] Email result:', results.email);
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
    console.error('[push] Error sending notification:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
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
    <h1 style="color: white; margin: 0; font-size: 24px;">🎵 Mixxclub</h1>
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
      — The Mixxclub Team
    </p>
  </div>
  
  <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
    <p style="margin: 0;">
      <a href="https://mixxclubonline.com/settings" style="color: #5B3CFF;">Manage notification preferences</a>
    </p>
  </div>
  
</body>
</html>
  `;
}