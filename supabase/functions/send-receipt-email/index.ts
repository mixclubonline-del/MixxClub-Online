import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { renderSimpleReceipt, logEmailSend } from '../_shared/email-templates.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paymentId } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`*, project:projects(title), user:profiles!payments_user_id_fkey(full_name, email)`)
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) throw new Error('Payment not found');

    const recipientEmail = payment.user?.email || '';
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    if (!RESEND_API_KEY) {
      await logEmailSend(supabase, recipientEmail, 'receipt', 'skipped', 'RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: true, message: 'Email not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const receiptHtml = renderSimpleReceipt({
      userName: payment.user?.full_name || 'there',
      receiptNumber: `#${payment.id.substring(0, 8).toUpperCase()}`,
      date: new Date(payment.created_at).toLocaleDateString(),
      paymentMethod: payment.payment_method || 'Card',
      projectTitle: payment.project?.title || '',
      transactionId: payment.transaction_id || 'N/A',
      amount: `$${payment.amount}`,
    });

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Mixxclub <receipts@mixxclubonline.com>',
        to: [recipientEmail],
        subject: `Payment Receipt - Order #${payment.id.substring(0, 8).toUpperCase()}`,
        html: receiptHtml,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      await logEmailSend(supabase, recipientEmail, 'receipt', 'failed', error);
      throw new Error(`Failed to send email: ${error}`);
    }

    await logEmailSend(supabase, recipientEmail, 'receipt', 'sent');
    console.log('Receipt email sent for payment:', paymentId);

    return new Response(
      JSON.stringify({ success: true, message: 'Receipt email sent' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error sending receipt email:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
