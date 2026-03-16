import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { createLogger } from '../_shared/logger.ts';
import { handleError, createResponse } from '../_shared/error-handler.ts';
import { renderWelcomeArtist, renderWelcomeEngineer, logEmailSend } from '../_shared/email-templates.ts';

const logger = createLogger('send-welcome-email');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email, fullName, userRole } = await req.json();
    logger.info('Sending welcome email', { userId, email, userRole });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      logger.warn('RESEND_API_KEY not configured - skipping email');
      await logEmailSend(supabase, email, 'welcome', 'skipped', 'RESEND_API_KEY not configured');
      return createResponse({ success: true, message: 'Email not configured' });
    }

    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: activeProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .in('status', ['in_progress', 'review']);

    const userName = fullName || email.split('@')[0];
    const isEngineer = userRole === 'engineer';

    const emailHtml = isEngineer
      ? renderWelcomeEngineer(userName, totalUsers || 0, activeProjects || 0)
      : renderWelcomeArtist(userName, totalUsers || 0, activeProjects || 0);

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Mixxclub <onboarding@resend.dev>',
        to: [email],
        subject: `Welcome to Mixxclub${isEngineer ? ' - Start Earning Today!' : ' - Your Music Journey Begins!'}`,
        html: emailHtml,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      logger.error('Resend error', emailData);
      await logEmailSend(supabase, email, 'welcome', 'failed', emailData.message || 'Unknown error');
      throw new Error(`Failed to send email: ${emailData.message || 'Unknown error'}`);
    }

    await logEmailSend(supabase, email, 'welcome', 'sent', undefined, { messageId: emailData.id });
    logger.info('Welcome email sent successfully', { messageId: emailData.id });

    return createResponse({ success: true, messageId: emailData.id });

  } catch (error) {
    logger.error('Error sending welcome email', error);
    const errorResponse = handleError(error);
    return new Response(
      JSON.stringify(errorResponse.body),
      { status: errorResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
