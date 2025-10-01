import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, paymentDetails } = await req.json();

    console.log('Sending payment receipt for project:', projectId);

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured - skipping email');
      return new Response(
        JSON.stringify({ success: true, message: 'Email not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Not authenticated');
    }

    // Get project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*, profiles!projects_client_id_fkey(email, full_name)')
      .eq('id', projectId)
      .single();

    if (projectError) {
      throw new Error('Project not found');
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single();

    const userEmail = profile?.email || user.email;
    const userName = profile?.full_name || 'Customer';

    // Generate HTML email
    const emailHtml = generateReceiptEmail({
      userName,
      projectName: project.title || 'MixClub Project',
      amount: paymentDetails.amount,
      engineerShare: paymentDetails.engineerShare,
      platformFee: paymentDetails.platformFee,
      paymentMethod: paymentDetails.paymentMethod,
      transactionId: paymentDetails.transactionId,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    });

    // Send email via Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'MixClub <onboarding@resend.dev>',
        to: [userEmail],
        subject: `Payment Receipt - ${project.title}`,
        html: emailHtml,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error('Resend error:', emailData);
      throw new Error(`Failed to send email: ${emailData.message || 'Unknown error'}`);
    }

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
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function generateReceiptEmail(details: {
  userName: string;
  projectName: string;
  amount: number;
  engineerShare: number;
  platformFee: number;
  paymentMethod: string;
  transactionId: string;
  date: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(135deg, #5B3CFF 0%, #7C3AED 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Payment Receipt</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Thank you for your payment!</p>
  </div>
  
  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
    
    <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="color: #5B3CFF; margin: 0 0 20px 0; font-size: 20px;">Payment Details</h2>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
            <strong>Customer:</strong>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
            ${details.userName}
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
            <strong>Project:</strong>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
            ${details.projectName}
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
            <strong>Date:</strong>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
            ${details.date}
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
            <strong>Payment Method:</strong>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
            ${details.paymentMethod}
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
            <strong>Transaction ID:</strong>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right; font-family: monospace; font-size: 12px;">
            ${details.transactionId}
          </td>
        </tr>
      </table>
    </div>
    
    <div style="background: white; padding: 25px; border-radius: 8px;">
      <h2 style="color: #5B3CFF; margin: 0 0 20px 0; font-size: 20px;">Payment Breakdown</h2>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
            Engineer Share (70%)
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
            $${details.engineerShare.toFixed(2)}
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
            Platform Fee (30%)
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; text-align: right;">
            $${details.platformFee.toFixed(2)}
          </td>
        </tr>
        <tr>
          <td style="padding: 20px 0 0 0; font-size: 18px;">
            <strong>Total Paid</strong>
          </td>
          <td style="padding: 20px 0 0 0; text-align: right; font-size: 24px; color: #5B3CFF;">
            <strong>$${details.amount.toFixed(2)}</strong>
          </td>
        </tr>
      </table>
    </div>
    
    <div style="margin-top: 30px; padding: 20px; background: white; border-radius: 8px; text-align: center;">
      <p style="margin: 0; color: #666; font-size: 14px;">
        Questions about your payment? Contact us at 
        <a href="mailto:support@mixclubonline.com" style="color: #5B3CFF; text-decoration: none;">support@mixclubonline.com</a>
      </p>
    </div>
    
  </div>
  
  <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
    <p>© ${new Date().getFullYear()} MixClub. All rights reserved.</p>
    <p style="margin: 10px 0 0 0;">
      This is an automated receipt for your records. Please do not reply to this email.
    </p>
  </div>
  
</body>
</html>
  `;
}
