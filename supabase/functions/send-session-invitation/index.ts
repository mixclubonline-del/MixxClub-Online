import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  invitationId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { invitationId }: InvitationRequest = await req.json();

    console.log("Sending invitation email for:", invitationId);

    // Get invitation details
    const { data: invitation, error: invError } = await supabaseClient
      .from("session_invitations")
      .select(`
        *,
        artist:artist_id(id, email, full_name),
        engineer:engineer_id(id, email, full_name),
        session:session_id(id, session_name, description)
      `)
      .eq("id", invitationId)
      .single();

    if (invError || !invitation) {
      console.error("Error fetching invitation:", invError);
      throw new Error("Invitation not found");
    }

    const artistName = invitation.artist?.full_name || "An artist";
    const engineerEmail = invitation.engineer?.email;
    const engineerName = invitation.engineer?.full_name || "there";
    const sessionName = invitation.session?.session_name || "a collaboration session";
    const sessionDescription = invitation.session?.description || "";
    const message = invitation.message || "";

    if (!engineerEmail) {
      throw new Error("Engineer email not found");
    }

    // Send email
    const emailResponse = await resend.emails.send({
      from: "MixClub <onboarding@resend.dev>",
      to: [engineerEmail],
      subject: `${artistName} invited you to collaborate on MixClub`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .session-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .button-secondary { background: #6b7280; }
            .message { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; font-style: italic; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎵 Collaboration Invitation</h1>
            </div>
            <div class="content">
              <p>Hi ${engineerName},</p>
              <p><strong>${artistName}</strong> has invited you to collaborate on a session!</p>
              
              <div class="session-info">
                <h2>📀 ${sessionName}</h2>
                ${sessionDescription ? `<p>${sessionDescription}</p>` : ''}
              </div>
              
              ${message ? `
                <div class="message">
                  <strong>Personal message:</strong><br/>
                  ${message}
                </div>
              ` : ''}
              
              <p>Join this collaborative session to work together in real-time, share ideas, and create amazing music!</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://htvmkylgrrlaydhdbonl.supabase.co/engineer-crm?tab=sessions" class="button">
                  View Invitation
                </a>
              </div>
              
              <div class="footer">
                <p>MixClub - Where Artists and Engineers Collaborate</p>
                <p style="font-size: 12px; color: #9ca3af;">
                  If you don't want to receive these emails, you can manage your notification preferences in your account settings.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-session-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});