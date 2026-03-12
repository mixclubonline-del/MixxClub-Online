import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { requireAdmin, authErrorResponse } from '../_shared/auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authResult = await requireAdmin(req);
    if ('error' in authResult) return authErrorResponse(authResult, corsHeaders);

    const { submissionId, recipientEmail, recipientName, replyMessage } = await req.json();

    if (!submissionId || !recipientEmail || !replyMessage) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: submissionId, recipientEmail, replyMessage' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send reply email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'MixxClub Support <support@mixxclub.com>',
        to: [recipientEmail],
        subject: `Re: Your message to MixxClub`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff;">
            <div style="margin-bottom: 30px;">
              <h1 style="font-size: 20px; color: #111; margin: 0 0 4px 0;">MixxClub</h1>
              <p style="font-size: 12px; color: #666; margin: 0;">Support Response</p>
            </div>
            <p style="font-size: 14px; color: #333; margin: 0 0 16px 0;">Hi ${recipientName || 'there'},</p>
            <div style="font-size: 14px; color: #333; line-height: 1.7; white-space: pre-wrap; margin-bottom: 30px;">${replyMessage}</div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="font-size: 12px; color: #999;">This is a reply from the MixxClub team regarding your recent message.</p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errBody = await emailResponse.text();
      console.error('Resend error:', errBody);
      return new Response(
        JSON.stringify({ error: `Failed to send email: ${emailResponse.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update submission status to in_progress (or resolved)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabaseAdmin
      .from('contact_submissions')
      .update({ status: 'in_progress' })
      .eq('id', submissionId);

    return new Response(
      JSON.stringify({ success: true, message: 'Reply sent successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('admin-reply-contact error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
