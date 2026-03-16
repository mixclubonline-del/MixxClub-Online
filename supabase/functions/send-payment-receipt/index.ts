import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { getCorsHeaders } from '../_shared/cors.ts';
import { renderPaymentReceipt, logEmailSend } from '../_shared/email-templates.ts';

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, paymentDetails } = await req.json();
    console.log('Sending payment receipt for project:', projectId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) throw new Error('Not authenticated');

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*, profiles!projects_client_id_fkey(email, full_name)')
      .eq('id', projectId)
      .single();

    if (projectError) throw new Error('Project not found');

    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single();

    const userEmail = profile?.email || user.email;
    const userName = profile?.full_name || 'Customer';

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured - skipping email');
      await logEmailSend(supabase, userEmail || '', 'payment_receipt', 'skipped', 'RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: true, message: 'Email not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailHtml = renderPaymentReceipt({
      userName,
      projectName: project.title || 'Mixxclub Project',
      amount: paymentDetails.amount,
      engineerShare: paymentDetails.engineerShare,
      platformFee: paymentDetails.platformFee,
      paymentMethod: paymentDetails.paymentMethod,
      transactionId: paymentDetails.transactionId,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    });

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Mixxclub <onboarding@resend.dev>',
        to: [userEmail],
        subject: `Payment Receipt - ${project.title}`,
        html: emailHtml,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error('Resend error:', emailData);
      await logEmailSend(supabase, userEmail || '', 'payment_receipt', 'failed', emailData.message);
      throw new Error(`Failed to send email: ${emailData.message || 'Unknown error'}`);
    }

    await logEmailSend(supabase, userEmail || '', 'payment_receipt', 'sent', undefined, { messageId: emailData.id });
    console.log('Receipt email sent successfully:', emailData);

    return new Response(
      JSON.stringify({ success: true, messageId: emailData.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending receipt:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
