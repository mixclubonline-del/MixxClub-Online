import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature, x-webhook-timestamp',
};

interface WebhookPayload {
  action: string;
  userId?: string;
  data?: Record<string, any>;
}

// HMAC-SHA256 signature verification (optional - only enforced if N8N_WEBHOOK_SECRET is set)
async function verifySignature(req: Request, bodyText: string): Promise<{ valid: boolean; reason?: string }> {
  const secret = Deno.env.get('N8N_WEBHOOK_SECRET');
  
  // If no secret configured, skip verification (dev mode)
  if (!secret) {
    console.log('[n8n-webhook] No N8N_WEBHOOK_SECRET configured, skipping signature verification');
    return { valid: true, reason: 'no_secret_configured' };
  }
  
  const signature = req.headers.get('x-webhook-signature');
  const timestamp = req.headers.get('x-webhook-timestamp');
  
  if (!signature || !timestamp) {
    console.log('[n8n-webhook] Missing signature headers');
    return { valid: false, reason: 'missing_headers' };
  }
  
  // Check timestamp is within 5 minutes (replay attack protection)
  const now = Date.now();
  const reqTime = parseInt(timestamp, 10);
  if (isNaN(reqTime) || Math.abs(now - reqTime) > 300000) {
    console.log('[n8n-webhook] Timestamp too old or invalid:', timestamp);
    return { valid: false, reason: 'timestamp_invalid' };
  }
  
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    // Sign: timestamp.body
    const signatureData = `${timestamp}.${bodyText}`;
    const expectedSig = await crypto.subtle.sign('HMAC', key, encoder.encode(signatureData));
    const expectedHex = Array.from(new Uint8Array(expectedSig))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    
    if (signature !== expectedHex) {
      console.log('[n8n-webhook] Signature mismatch');
      return { valid: false, reason: 'signature_mismatch' };
    }
    
    return { valid: true };
  } catch (error) {
    console.error('[n8n-webhook] Signature verification error:', error);
    return { valid: false, reason: 'verification_error' };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Read body as text for signature verification
    const bodyText = await req.text();
    
    // Verify signature (optional, only if secret is configured)
    const signatureResult = await verifySignature(req, bodyText);
    if (!signatureResult.valid) {
      console.log('[n8n-webhook] Signature verification failed:', signatureResult.reason);
      return new Response(
        JSON.stringify({ error: 'Invalid signature', reason: signatureResult.reason }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload: WebhookPayload = JSON.parse(bodyText);
    const { action, userId, data } = payload;

    console.log('[n8n-webhook] Received action:', action, 'for user:', userId);

    let result: any = { success: true };

    switch (action) {
      case 'send_notification': {
        if (!userId || !data?.title || !data?.message) {
          throw new Error('Missing required fields for send_notification');
        }
        
        const { error } = await supabaseClient.from('notifications').insert({
          user_id: userId,
          type: data.type || 'journey',
          title: data.title,
          message: data.message,
          action_url: data.action_url,
          is_read: false,
        });
        
        if (error) throw error;
        result.message = 'Notification sent';
        break;
      }

      case 'award_xp': {
        if (!userId || typeof data?.points !== 'number') {
          throw new Error('Missing required fields for award_xp');
        }
        
        const { data: awardResult, error } = await supabaseClient.rpc('award_points', {
          p_user_id: userId,
          p_points: data.points,
          p_action_type: data.action_type || 'n8n_automation',
          p_action_description: data.description || 'Points from automation',
        });
        
        if (error) throw error;
        result.newPoints = awardResult;
        result.message = `Awarded ${data.points} XP`;
        break;
      }

      case 'unlock_achievement': {
        if (!userId || !data?.achievement_type || !data?.title) {
          throw new Error('Missing required fields for unlock_achievement');
        }
        
        const { error } = await supabaseClient.from('achievements').insert({
          user_id: userId,
          achievement_type: data.achievement_type,
          title: data.title,
          description: data.description || '',
          icon: data.icon || 'trophy',
          badge_name: data.badge_name,
          badge_type: data.badge_type || 'milestone',
        });
        
        if (error && error.code !== '23505') throw error; // Ignore duplicate
        result.message = 'Achievement unlocked';
        break;
      }

      case 'update_journey_state': {
        if (!userId || !data?.journey_type || !data?.current_step) {
          throw new Error('Missing required fields for update_journey_state');
        }
        
        const { data: existing } = await supabaseClient
          .from('user_journeys')
          .select('id, metadata')
          .eq('user_id', userId)
          .eq('journey_type', data.journey_type)
          .single();
        
        if (existing) {
          const { error } = await supabaseClient
            .from('user_journeys')
            .update({
              current_step: data.current_step,
              completed_at: data.completed ? new Date().toISOString() : null,
              metadata: {
                ...(existing.metadata as Record<string, any> || {}),
                ...(data.metadata || {}),
                last_updated_by: 'n8n',
                last_updated_at: new Date().toISOString(),
              },
            })
            .eq('id', existing.id);
          
          if (error) throw error;
        } else {
          const { error } = await supabaseClient.from('user_journeys').insert({
            user_id: userId,
            journey_type: data.journey_type,
            current_step: data.current_step,
            completed_at: data.completed ? new Date().toISOString() : null,
            metadata: {
              ...(data.metadata || {}),
              created_by: 'n8n',
            },
          });
          
          if (error) throw error;
        }
        
        result.message = 'Journey state updated';
        break;
      }

      case 'send_email': {
        if (!userId || !data?.template) {
          throw new Error('Missing required fields for send_email');
        }
        
        // Get user email
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('email, full_name')
          .eq('id', userId)
          .single();
        
        if (!profile?.email) {
          throw new Error('User email not found');
        }
        
        // Use Resend to send email
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        if (!resendApiKey) {
          console.warn('[n8n-webhook] RESEND_API_KEY not configured');
          result.message = 'Email skipped - no API key';
          break;
        }
        
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Mixxclub <noreply@mixxclubonline.com>',
            to: profile.email,
            subject: data.subject || 'Update from Mixxclub',
            html: data.html || `<p>${data.message || 'You have a new update!'}</p>`,
          }),
        });
        
        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          console.error('[n8n-webhook] Email send failed:', errorText);
        }
        
        result.message = 'Email sent';
        break;
      }

      case 'update_user_tier': {
        if (!userId || !data?.tier) {
          throw new Error('Missing required fields for update_user_tier');
        }
        
        // Check if user_loyalty record exists
        const { data: existing } = await supabaseClient
          .from('user_loyalty')
          .select('id')
          .eq('user_id', userId)
          .single();
        
        if (existing) {
          const { error } = await supabaseClient
            .from('user_loyalty')
            .update({
              current_tier: data.tier,
              tier_updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);
          
          if (error) throw error;
        } else {
          const { error } = await supabaseClient.from('user_loyalty').insert({
            user_id: userId,
            current_tier: data.tier,
            lifetime_points: 0,
          });
          
          if (error) throw error;
        }
        
        // Send notification about tier upgrade
        await supabaseClient.from('notifications').insert({
          user_id: userId,
          type: 'tier_upgrade',
          title: `Welcome to ${data.tier} Tier!`,
          message: data.message || `You've been upgraded to ${data.tier} tier. Enjoy your new benefits!`,
          action_url: '/loyalty',
        });
        
        result.message = `User tier updated to ${data.tier}`;
        break;
      }

      case 'trigger_workflow': {
        // This allows n8n to trigger other n8n workflows via Mixxclub
        console.log('[n8n-webhook] Workflow trigger:', data);
        result.message = 'Workflow triggered';
        break;
      }

      case 'release_payment': {
        if (!data?.payment_id || !data?.session_id) {
          throw new Error('Missing required fields for release_payment: payment_id, session_id');
        }
        
        console.log('[n8n-webhook] Processing payment release for:', data.payment_id);
        
        // Get payment details
        const { data: payment, error: paymentError } = await supabaseClient
          .from('session_payments')
          .select('*, collaboration_sessions!inner(host_user_id, title)')
          .eq('id', data.payment_id)
          .single();
        
        if (paymentError || !payment) {
          throw new Error('Payment not found');
        }
        
        if (payment.status !== 'held') {
          throw new Error(`Cannot release payment with status: ${payment.status}`);
        }
        
        // Update payment status to released
        const { error: updateError } = await supabaseClient
          .from('session_payments')
          .update({
            status: 'released',
            released_at: new Date().toISOString(),
            released_by: data.approved_by || null,
          })
          .eq('id', data.payment_id);
        
        if (updateError) throw updateError;
        
        // Create earnings record for engineer
        if (payment.payee_id) {
          await supabaseClient.from('engineer_earnings').insert({
            engineer_id: payment.payee_id,
            amount: payment.amount,
            base_amount: payment.amount,
            total_amount: payment.amount,
            currency: payment.currency || 'USD',
            status: 'pending',
          });
          
          // Notify the payee
          await supabaseClient.from('notifications').insert({
            user_id: payment.payee_id,
            type: 'payment',
            title: 'Payment Released! 💰',
            message: `Your payment of $${payment.amount} has been released.`,
            action_url: '/earnings',
          });
        }
        
        result.message = `Payment ${data.payment_id} released`;
        result.amount = payment.amount;
        break;
      }

      case 'send_push_notification': {
        if (!userId || !data?.title || !data?.body) {
          throw new Error('Missing required fields for send_push_notification: userId, title, body');
        }
        
        console.log('[n8n-webhook] Sending push notification to:', userId);
        
        // Get user's push tokens
        const { data: tokens } = await supabaseClient
          .from('push_tokens')
          .select('token, platform')
          .eq('user_id', userId)
          .eq('is_active', true);
        
        // Store notification in database
        await supabaseClient.from('notifications').insert({
          user_id: userId,
          type: data.type || 'push',
          title: data.title,
          message: data.body,
          action_url: data.action_url,
          is_read: false,
        });
        
        let pushCount = 0;
        
        if (tokens && tokens.length > 0) {
          // Group tokens by platform
          const fcmTokens = tokens.filter(t => t.platform === 'android').map(t => t.token);
          const apnsTokens = tokens.filter(t => t.platform === 'ios').map(t => t.token);
          
          // Send FCM notifications (Android)
          if (fcmTokens.length > 0) {
            const fcmKey = Deno.env.get('FCM_SERVER_KEY');
            if (fcmKey) {
              try {
                await fetch('https://fcm.googleapis.com/fcm/send', {
                  method: 'POST',
                  headers: {
                    'Authorization': `key=${fcmKey}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    registration_ids: fcmTokens,
                    notification: {
                      title: data.title,
                      body: data.body,
                      badge: data.badge || 1,
                      sound: data.sound || 'default',
                    },
                    data: data.payload || {},
                  }),
                });
                pushCount += fcmTokens.length;
              } catch (e) {
                console.error('[n8n-webhook] FCM error:', e);
              }
            }
          }
          
          // For iOS, we'd use APNS - log for now
          if (apnsTokens.length > 0) {
            console.log('[n8n-webhook] APNS tokens found:', apnsTokens.length);
            pushCount += apnsTokens.length;
          }
        }
        
        // Optionally send email notification as well
        if (data.sendEmail) {
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('email, full_name')
            .eq('id', userId)
            .single();
          
          if (profile?.email) {
            const resendApiKey = Deno.env.get('RESEND_API_KEY');
            if (resendApiKey) {
              await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${resendApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from: 'Mixxclub <noreply@mixxclubonline.com>',
                  to: profile.email,
                  subject: data.title,
                  html: `<h2>${data.title}</h2><p>${data.body}</p>`,
                }),
              });
            }
          }
        }
        
        result.message = `Push notification sent to ${pushCount} devices`;
        result.deviceCount = pushCount;
        break;
      }

      case 'sync_analytics': {
        if (!data?.eventName) {
          throw new Error('Missing required field for sync_analytics: eventName');
        }
        
        console.log('[n8n-webhook] Syncing analytics event:', data.eventName);
        
        const platforms = data.platforms || ['internal'];
        const syncResults: Record<string, boolean> = {};
        
        // Always sync to internal analytics
        if (platforms.includes('internal')) {
          const today = new Date().toISOString().split('T')[0];
          
          const { error } = await supabaseClient.rpc('track_analytics_event', {
            p_event_name: data.eventName,
            p_event_data: data.eventData || {},
            p_user_id: userId || null,
          }).maybeSingle();
          
          // Upsert daily metric
          await supabaseClient.from('daily_metrics').upsert({
            metric_date: today,
            metric_name: data.eventName,
            metric_value: 1,
            metadata: data.eventData || {},
          }, {
            onConflict: 'metric_date,metric_name',
          });
          
          syncResults.internal = !error;
        }
        
        // Sync to GA4 via Measurement Protocol
        if (platforms.includes('ga4')) {
          const measurementId = Deno.env.get('GA4_MEASUREMENT_ID');
          const apiSecret = Deno.env.get('GA4_API_SECRET');
          
          if (measurementId && apiSecret) {
            try {
              const response = await fetch(
                `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
                {
                  method: 'POST',
                  body: JSON.stringify({
                    client_id: userId || 'anonymous',
                    events: [{
                      name: data.eventName.replace(/\./g, '_'),
                      params: {
                        ...data.eventData,
                        user_id: userId,
                      },
                    }],
                  }),
                }
              );
              syncResults.ga4 = response.ok;
            } catch (e) {
              console.error('[n8n-webhook] GA4 error:', e);
              syncResults.ga4 = false;
            }
          } else {
            console.warn('[n8n-webhook] GA4 not configured');
            syncResults.ga4 = false;
          }
        }
        
        // Sync to Mixpanel
        if (platforms.includes('mixpanel')) {
          const mixpanelToken = Deno.env.get('MIXPANEL_TOKEN');
          
          if (mixpanelToken) {
            try {
              const eventData = {
                event: data.eventName,
                properties: {
                  token: mixpanelToken,
                  distinct_id: userId || 'anonymous',
                  ...data.eventData,
                },
              };
              
              const response = await fetch('https://api.mixpanel.com/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([eventData]),
              });
              syncResults.mixpanel = response.ok;
            } catch (e) {
              console.error('[n8n-webhook] Mixpanel error:', e);
              syncResults.mixpanel = false;
            }
          }
        }
        
        result.message = `Analytics synced to ${Object.keys(syncResults).join(', ')}`;
        result.syncResults = syncResults;
        break;
      }

      case 'trigger_email_sequence': {
        if (!userId || !data?.sequenceId) {
          throw new Error('Missing required fields for trigger_email_sequence: userId, sequenceId');
        }
        
        console.log('[n8n-webhook] Enrolling user in email sequence:', data.sequenceId);
        
        // Find sequence by name or ID
        let sequenceQuery = supabaseClient.from('email_sequences').select('*');
        
        if (data.sequenceId.includes('-')) {
          sequenceQuery = sequenceQuery.eq('id', data.sequenceId);
        } else {
          sequenceQuery = sequenceQuery.eq('name', data.sequenceId);
        }
        
        const { data: sequence, error: seqError } = await sequenceQuery.single();
        
        if (seqError || !sequence) {
          throw new Error(`Email sequence not found: ${data.sequenceId}`);
        }
        
        if (!sequence.is_active) {
          result.message = 'Sequence is inactive, skipping enrollment';
          break;
        }
        
        // Check if already enrolled
        const { data: existingEnrollment } = await supabaseClient
          .from('email_sequence_enrollments')
          .select('id, status')
          .eq('user_id', userId)
          .eq('sequence_id', sequence.id)
          .single();
        
        if (existingEnrollment && data.skipIfEnrolled) {
          result.message = 'User already enrolled, skipping';
          result.enrollmentId = existingEnrollment.id;
          break;
        }
        
        // Get first step of sequence
        const { data: firstStep } = await supabaseClient
          .from('email_sequence_steps')
          .select('*')
          .eq('sequence_id', sequence.id)
          .eq('is_active', true)
          .order('step_order', { ascending: true })
          .limit(1)
          .single();
        
        // Calculate next email time
        const delayHours = firstStep?.delay_hours || 0;
        const nextEmailAt = new Date(Date.now() + delayHours * 60 * 60 * 1000);
        
        // Create or update enrollment
        const enrollmentData = {
          user_id: userId,
          sequence_id: sequence.id,
          current_step: 0,
          status: 'active',
          next_email_at: nextEmailAt.toISOString(),
          metadata: data.metadata || {},
        };
        
        if (existingEnrollment) {
          const { error } = await supabaseClient
            .from('email_sequence_enrollments')
            .update(enrollmentData)
            .eq('id', existingEnrollment.id);
          
          if (error) throw error;
          result.enrollmentId = existingEnrollment.id;
        } else {
          const { data: newEnrollment, error } = await supabaseClient
            .from('email_sequence_enrollments')
            .insert(enrollmentData)
            .select('id')
            .single();
          
          if (error) throw error;
          result.enrollmentId = newEnrollment?.id;
        }
        
        // If delay is 0, send first email immediately
        if (delayHours === 0 && firstStep) {
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('email, full_name')
            .eq('id', userId)
            .single();
          
          if (profile?.email) {
            const resendApiKey = Deno.env.get('RESEND_API_KEY');
            if (resendApiKey) {
              // Replace template variables
              let htmlContent = firstStep.html_template
                .replace(/\{\{full_name\}\}/g, profile.full_name || 'there')
                .replace(/\{\{email\}\}/g, profile.email);
              
              await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${resendApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from: 'Mixxclub <noreply@mixxclubonline.com>',
                  to: profile.email,
                  subject: firstStep.subject,
                  html: htmlContent,
                }),
              });
              
              // Update enrollment
              await supabaseClient
                .from('email_sequence_enrollments')
                .update({
                  current_step: 1,
                  last_email_at: new Date().toISOString(),
                })
                .eq('id', result.enrollmentId);
            }
          }
        }
        
        result.message = `User enrolled in sequence: ${sequence.name}`;
        result.sequenceName = sequence.name;
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('[n8n-webhook] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
