import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExpiringContract {
  id: string;
  account_id: string;
  contract_number: string;
  package_type: string;
  start_date: string;
  end_date: string;
  value: number;
  organization_name: string;
  contact_email: string;
  days_until_expiration: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

  try {
    console.log("[CONTRACT-EXPIRATION] Starting expiration check");

    // Check for contracts expiring in 30, 7, and 1 day
    const thresholds = [30, 7, 1];
    const results = {
      checked: 0,
      notifications_sent: 0,
      errors: 0,
    };

    for (const days of thresholds) {
      console.log(`[CONTRACT-EXPIRATION] Checking contracts expiring in ${days} days`);

      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      const targetDateStr = targetDate.toISOString().split('T')[0];

      // Query contracts expiring on the target date
      const { data: contracts, error: queryError } = await supabaseClient
        .from('enterprise_contracts')
        .select(`
          id,
          account_id,
          contract_number,
          package_type,
          start_date,
          end_date,
          value,
          enterprise_accounts!inner (
            organization_name,
            contact_email: contact->email
          )
        `)
        .eq('status', 'active')
        .gte('end_date', targetDateStr)
        .lt('end_date', new Date(targetDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      if (queryError) {
        console.error(`[CONTRACT-EXPIRATION] Query error for ${days} days:`, queryError);
        results.errors++;
        continue;
      }

      if (!contracts || contracts.length === 0) {
        console.log(`[CONTRACT-EXPIRATION] No contracts expiring in ${days} days`);
        continue;
      }

      console.log(`[CONTRACT-EXPIRATION] Found ${contracts.length} contracts expiring in ${days} days`);
      results.checked += contracts.length;

      // Process each contract
      for (const contract of contracts) {
        try {
          const orgName = contract.enterprise_accounts?.organization_name || 'Unknown Organization';
          const contactEmail = contract.enterprise_accounts?.contact_email;

          if (!contactEmail) {
            console.warn(`[CONTRACT-EXPIRATION] No contact email for contract ${contract.contract_number}`);
            continue;
          }

          // Check if notification was already sent for this threshold
          const { data: existingNotification } = await supabaseClient
            .from('contract_expiration_notifications')
            .select('id')
            .eq('contract_id', contract.id)
            .eq('days_threshold', days)
            .single();

          if (existingNotification) {
            console.log(`[CONTRACT-EXPIRATION] Notification already sent for contract ${contract.contract_number} at ${days} days`);
            continue;
          }

          // Send email notification
          const emailResult = await resend.emails.send({
            from: 'MixClub Enterprise <onboarding@resend.dev>',
            to: [contactEmail],
            subject: `Contract Expiration Notice - ${days} Days Remaining`,
            html: generateEmailHTML({
              organizationName: orgName,
              contractNumber: contract.contract_number,
              packageType: contract.package_type,
              endDate: contract.end_date,
              value: contract.value,
              daysUntilExpiration: days,
            }),
          });

          console.log(`[CONTRACT-EXPIRATION] Email sent to ${contactEmail} for contract ${contract.contract_number}`);

          // Log the notification
          await supabaseClient
            .from('contract_expiration_notifications')
            .insert({
              contract_id: contract.id,
              days_threshold: days,
              notification_type: 'email',
              recipient_email: contactEmail,
              sent_at: new Date().toISOString(),
            });

          // Create in-app notification for admins
          const { data: adminUsers } = await supabaseClient
            .from('user_roles')
            .select('user_id')
            .eq('role', 'admin');

          if (adminUsers && adminUsers.length > 0) {
            for (const admin of adminUsers) {
              await supabaseClient
                .from('notifications')
                .insert({
                  user_id: admin.user_id,
                  type: 'contract_expiration',
                  title: 'Contract Expiring Soon',
                  message: `${orgName} - Contract ${contract.contract_number} expires in ${days} days`,
                  action_url: '/enterprise-demo?tab=contracts',
                  related_id: contract.id,
                  related_type: 'contract',
                  metadata: {
                    contract_number: contract.contract_number,
                    organization_name: orgName,
                    days_until_expiration: days,
                    end_date: contract.end_date,
                  },
                });
            }
          }

          results.notifications_sent++;
        } catch (emailError) {
          console.error(`[CONTRACT-EXPIRATION] Error processing contract ${contract.id}:`, emailError);
          results.errors++;
        }
      }
    }

    console.log(`[CONTRACT-EXPIRATION] Check complete:`, results);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[CONTRACT-EXPIRATION] Fatal error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

function generateEmailHTML(data: {
  organizationName: string;
  contractNumber: string;
  packageType: string;
  endDate: string;
  value: number;
  daysUntilExpiration: number;
}): string {
  const urgencyColor = data.daysUntilExpiration <= 7 ? '#ef4444' : '#f59e0b';
  const urgencyLabel = data.daysUntilExpiration === 1 ? 'URGENT' : 'IMPORTANT';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contract Expiration Notice</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #f4f4f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #9b87f5 0%, #7E69AB 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">MixClub Enterprise</h1>
            <p style="color: #ffffff; margin: 10px 0 0; opacity: 0.9; font-size: 16px;">Contract Expiration Notice</p>
          </div>

          <!-- Content -->
          <div style="background-color: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Urgency Badge -->
            <div style="background-color: ${urgencyColor}; color: #ffffff; padding: 8px 16px; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 12px; text-transform: uppercase; margin-bottom: 20px;">
              ${urgencyLabel}
            </div>

            <h2 style="color: #18181b; margin: 0 0 20px; font-size: 24px;">Contract Expiring in ${data.daysUntilExpiration} Day${data.daysUntilExpiration !== 1 ? 's' : ''}</h2>
            
            <p style="color: #52525b; line-height: 1.6; margin: 0 0 30px; font-size: 16px;">
              Hello ${data.organizationName},
            </p>

            <p style="color: #52525b; line-height: 1.6; margin: 0 0 30px; font-size: 16px;">
              This is a reminder that your MixClub Enterprise contract is expiring soon. Please review the details below and contact us to discuss renewal options.
            </p>

            <!-- Contract Details Card -->
            <div style="background-color: #f4f4f5; padding: 24px; border-radius: 8px; margin-bottom: 30px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; color: #71717a; font-size: 14px; font-weight: 500;">Contract Number:</td>
                  <td style="padding: 12px 0; color: #18181b; font-size: 14px; font-weight: 600; text-align: right;">${data.contractNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #71717a; font-size: 14px; font-weight: 500; border-top: 1px solid #e4e4e7;">Package Type:</td>
                  <td style="padding: 12px 0; color: #18181b; font-size: 14px; font-weight: 600; text-align: right; border-top: 1px solid #e4e4e7;">${data.packageType}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #71717a; font-size: 14px; font-weight: 500; border-top: 1px solid #e4e4e7;">Expiration Date:</td>
                  <td style="padding: 12px 0; color: #18181b; font-size: 14px; font-weight: 600; text-align: right; border-top: 1px solid #e4e4e7;">${new Date(data.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #71717a; font-size: 14px; font-weight: 500; border-top: 1px solid #e4e4e7;">Contract Value:</td>
                  <td style="padding: 12px 0; color: #18181b; font-size: 14px; font-weight: 600; text-align: right; border-top: 1px solid #e4e4e7;">$${data.value.toLocaleString()}</td>
                </tr>
              </table>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="mailto:enterprise@mixclub.com?subject=Contract Renewal - ${data.contractNumber}" 
                 style="display: inline-block; background: linear-gradient(135deg, #9b87f5 0%, #7E69AB 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Contact Us About Renewal
              </a>
            </div>

            <p style="color: #71717a; line-height: 1.6; margin: 30px 0 0; font-size: 14px;">
              To ensure uninterrupted service, please reach out to our enterprise team at your earliest convenience. We're here to help make the renewal process smooth and discuss any changes you'd like to make to your contract.
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding: 30px 20px; color: #a1a1aa; font-size: 12px;">
            <p style="margin: 0 0 10px;">© 2024 MixClub Enterprise. All rights reserved.</p>
            <p style="margin: 0;">
              <a href="mailto:enterprise@mixclub.com" style="color: #9b87f5; text-decoration: none;">enterprise@mixclub.com</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}
