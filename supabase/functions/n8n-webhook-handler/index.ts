import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  action: string;
  userId?: string;
  data?: Record<string, any>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload: WebhookPayload = await req.json();
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
            from: 'MixClub <noreply@mixclub.com>',
            to: profile.email,
            subject: data.subject || 'Update from MixClub',
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
        // This allows n8n to trigger other n8n workflows via MixClub
        console.log('[n8n-webhook] Workflow trigger:', data);
        result.message = 'Workflow triggered';
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
