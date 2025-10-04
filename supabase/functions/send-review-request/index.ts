import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReviewRequestEmailData {
  projectId: string;
  clientEmail: string;
  clientName: string;
  projectName: string;
  engineerName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, clientEmail, clientName, projectName, engineerName }: ReviewRequestEmailData = await req.json();

    const emailResponse = await resend.emails.send({
      from: "MixClub <reviews@mixclub.com>",
      to: [clientEmail],
      subject: `How was your experience with ${engineerName}? ⭐`,
      html: `
        <h1>Hi ${clientName}!</h1>
        <p>We hope you're happy with how <strong>${projectName}</strong> turned out!</p>
        <p>Would you mind taking 2 minutes to share your experience working with ${engineerName}? Your feedback helps other artists find great engineers and helps ${engineerName} build their reputation.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://mixclub.com/project/${projectId}?review=true" 
             style="background-color: #9b87f5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Leave a Review
          </a>
        </div>
        
        <p>It takes less than 2 minutes and means the world to us and your engineer.</p>
        <p>Thank you for being part of the MixClub community!</p>
        
        <p style="margin-top: 40px; font-size: 12px; color: #666;">
          <em>This is an automated email sent 3 days after project completion. If you've already left a review, thank you!</em>
        </p>
      `,
    });

    console.log("Review request email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-review-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
