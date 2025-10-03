import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paymentId } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get payment details with user info
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .select(`
        *,
        project:projects(title),
        user:profiles!payments_user_id_fkey(full_name, email)
      `)
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      throw new Error('Payment not found');
    }

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .receipt-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .total-row { font-size: 18px; font-weight: bold; margin-top: 10px; padding-top: 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Receipt</h1>
              <p>Thank you for your purchase!</p>
            </div>
            
            <div class="content">
              <p>Hi ${payment.user?.full_name || 'there'},</p>
              
              <p>Your payment has been successfully processed. Here are your receipt details:</p>
              
              <div class="receipt-box">
                <div class="receipt-row">
                  <span>Receipt Number:</span>
                  <strong>#${payment.id.substring(0, 8).toUpperCase()}</strong>
                </div>
                
                <div class="receipt-row">
                  <span>Date:</span>
                  <span>${new Date(payment.created_at).toLocaleDateString()}</span>
                </div>
                
                <div class="receipt-row">
                  <span>Payment Method:</span>
                  <span>${payment.payment_method || 'Card'}</span>
                </div>
                
                ${payment.project?.title ? `
                <div class="receipt-row">
                  <span>Project:</span>
                  <span>${payment.project.title}</span>
                </div>
                ` : ''}
                
                <div class="receipt-row">
                  <span>Transaction ID:</span>
                  <span class="font-mono">${payment.transaction_id || 'N/A'}</span>
                </div>
                
                <div class="receipt-row total-row">
                  <span>Total Amount:</span>
                  <span>$${payment.amount}</span>
                </div>
              </div>
              
              <p style="text-align: center;">
                <a href="https://htvmkylgrrlaydhdbonl.supabase.co/functions/v1/generate-invoice?paymentId=${paymentId}" class="button">
                  Download Invoice
                </a>
              </p>
              
              <p>If you have any questions about this payment, please don't hesitate to contact our support team.</p>
              
              <div class="footer">
                <p>MixClub - Professional Audio Services</p>
                <p>1234 Audio Avenue, Suite 500, Los Angeles, CA 90028</p>
                <p>&copy; ${new Date().getFullYear()} MixClub. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'MixClub <receipts@mixclub.com>',
        to: [payment.user?.email || ''],
        subject: `Payment Receipt - Order #${payment.id.substring(0, 8).toUpperCase()}`,
        html: receiptHtml,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      throw new Error(`Failed to send email: ${error}`);
    }

    console.log('Receipt email sent for payment:', paymentId);

    return new Response(
      JSON.stringify({ success: true, message: 'Receipt email sent' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error sending receipt email:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
