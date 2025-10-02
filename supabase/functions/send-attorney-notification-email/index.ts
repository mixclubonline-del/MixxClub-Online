import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createLogger } from "../_shared/logger.ts";

const logger = createLogger("send-attorney-notification-email");

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const {
      document_id,
      document_type,
      document_title,
      attorney_name,
      attorney_email,
    } = await req.json();

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    // Send email to admin
    const adminEmail = "mixclubonline@gmail.com";

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">✓ Legal Document Reviewed</h1>
        
        <p>Hi Admin,</p>
        
        <p>Attorney <strong>${attorney_name}</strong> has completed their review of your <strong>${document_title}</strong>.</p>
        
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Document Details:</h3>
          <p style="margin: 8px 0;"><strong>Document:</strong> ${document_title}</p>
          <p style="margin: 8px 0;"><strong>Type:</strong> ${document_type}</p>
          <p style="margin: 8px 0;"><strong>Reviewed By:</strong> ${attorney_name} (${attorney_email})</p>
          <p style="margin: 8px 0;"><strong>Reviewed On:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <div style="margin: 30px 0;">
          <a href="${Deno.env.get("SUPABASE_URL")?.replace("supabase.co", "lovable.app")}/admin/legal-documents" 
             style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            View in Admin Panel
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        
        <p style="color: #6b7280; font-size: 14px;">
          MixClub Admin System<br />
          This is an automated notification. Do not reply to this email.
        </p>
      </div>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "MixClub Legal <onboarding@resend.dev>",
        to: [adminEmail],
        subject: `✓ Legal Document Reviewed: ${document_title}`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      logger.error("Failed to send email", errorText);
      throw new Error(`Email send failed: ${errorText}`);
    }

    // Create in-app notification
    const { data: adminUser } = await supabaseClient
      .from("profiles")
      .select("id")
      .limit(1)
      .single();

    if (adminUser) {
      await supabaseClient.from("notifications").insert({
        user_id: adminUser.id,
        type: "attorney_review_completed",
        title: "Legal Document Reviewed",
        message: `${attorney_name} completed review of ${document_title}`,
        action_url: `/admin/legal-documents?doc=${document_type}`,
        related_id: document_id,
        related_type: "legal_document",
        metadata: {
          attorney_name,
          attorney_email,
          document_type,
        },
      });
    }

    logger.info("Attorney notification sent successfully", { document_id });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    logger.error("Error sending attorney notification", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});