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

interface ProjectStatusEmailRequest {
  projectId: string;
  status: string;
  clientEmail: string;
  clientName: string;
  projectName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, status, clientEmail, clientName, projectName }: ProjectStatusEmailRequest = await req.json();

    const statusMessages = {
      'in_progress': {
        subject: `Your Project "${projectName}" is Now In Progress! 🎵`,
        content: `
          <h1>Great News, ${clientName}!</h1>
          <p>Your project <strong>${projectName}</strong> has been assigned to an engineer and is now in progress.</p>
          <p>You'll receive updates as your project moves through each stage. Feel free to communicate with your engineer directly through the platform.</p>
          <p><a href="https://mixclub.com/project/${projectId}">View Project Status</a></p>
        `
      },
      'review': {
        subject: `Your Project "${projectName}" is Ready for Review! ✨`,
        content: `
          <h1>Time to Review, ${clientName}!</h1>
          <p>Your engineer has completed the first version of <strong>${projectName}</strong> and it's ready for your feedback.</p>
          <p>Listen to the results and let us know if you need any adjustments. Your engineer is standing by!</p>
          <p><a href="https://mixclub.com/project/${projectId}">Listen & Review Now</a></p>
        `
      },
      'completed': {
        subject: `Your Project "${projectName}" is Complete! 🎉`,
        content: `
          <h1>Congratulations, ${clientName}!</h1>
          <p>Your project <strong>${projectName}</strong> has been completed and your final files are ready to download.</p>
          <p>Thank you for trusting MixClub with your music. We can't wait to hear what you create next!</p>
          <p><a href="https://mixclub.com/project/${projectId}">Download Your Files</a></p>
          <p style="margin-top: 20px;"><em>Love how your project turned out? Please consider leaving a review for your engineer!</em></p>
        `
      }
    };

    const message = statusMessages[status as keyof typeof statusMessages];
    if (!message) {
      throw new Error(`Invalid status: ${status}`);
    }

    const emailResponse = await resend.emails.send({
      from: "MixClub <projects@mixclub.com>",
      to: [clientEmail],
      subject: message.subject,
      html: message.content,
    });

    console.log("Project status email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-project-status function:", error);
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
