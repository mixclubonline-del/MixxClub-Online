import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BATCH_SIZE = 50;
const MAX_RETRY_ATTEMPTS = 3;

interface Enrollment {
  id: string;
  user_id: string;
  sequence_id: string;
  current_step: number;
  metadata: Record<string, unknown> | null;
}

interface SequenceStep {
  id: string;
  sequence_id: string;
  step_order: number;
  subject: string;
  html_template: string;
  delay_hours: number;
  is_active: boolean;
}

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
}

interface Sequence {
  id: string;
  name: string;
}

function replaceTemplateVariables(
  template: string,
  profile: Profile,
  sequence: Sequence,
  stepNumber: number,
  metadata: Record<string, unknown> | null
): string {
  let result = template;
  
  // Basic variables
  result = result.replace(/\{\{full_name\}\}/g, profile.full_name || "there");
  result = result.replace(/\{\{email\}\}/g, profile.email);
  result = result.replace(/\{\{first_name\}\}/g, profile.full_name?.split(" ")[0] || "there");
  result = result.replace(/\{\{sequence_name\}\}/g, sequence.name);
  result = result.replace(/\{\{step_number\}\}/g, String(stepNumber));
  
  // Metadata variables
  if (metadata) {
    Object.entries(metadata).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value));
    });
  }
  
  return result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const results = {
    enrollments_processed: 0,
    emails_sent: 0,
    sequences_completed: 0,
    errors: [] as string[],
  };

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    console.log("[process-email-sequences] Starting email sequence processing...");

    // Get pending enrollments where next_email_at has passed
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("email_sequence_enrollments")
      .select("id, user_id, sequence_id, current_step, metadata")
      .eq("status", "active")
      .lte("next_email_at", new Date().toISOString())
      .limit(BATCH_SIZE);

    if (enrollmentsError) {
      throw new Error(`Failed to fetch enrollments: ${enrollmentsError.message}`);
    }

    if (!enrollments || enrollments.length === 0) {
      console.log("[process-email-sequences] No pending enrollments to process");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No pending enrollments",
        ...results,
        processing_time_ms: Date.now() - startTime
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[process-email-sequences] Processing ${enrollments.length} enrollments`);

    for (const enrollment of enrollments as Enrollment[]) {
      try {
        results.enrollments_processed++;

        // Get the sequence
        const { data: sequence, error: seqError } = await supabase
          .from("email_sequences")
          .select("id, name")
          .eq("id", enrollment.sequence_id)
          .eq("is_active", true)
          .single();

        if (seqError || !sequence) {
          console.log(`[process-email-sequences] Sequence ${enrollment.sequence_id} not found or inactive`);
          continue;
        }

        // Get the next step (current_step + 1)
        const nextStepOrder = (enrollment.current_step || 0) + 1;
        
        const { data: step, error: stepError } = await supabase
          .from("email_sequence_steps")
          .select("*")
          .eq("sequence_id", enrollment.sequence_id)
          .eq("step_order", nextStepOrder)
          .eq("is_active", true)
          .single();

        if (stepError || !step) {
          // No more steps - mark as completed
          console.log(`[process-email-sequences] No more steps for enrollment ${enrollment.id}, marking complete`);
          
          await supabase
            .from("email_sequence_enrollments")
            .update({
              status: "completed",
              completed_at: new Date().toISOString(),
            })
            .eq("id", enrollment.id);

          results.sequences_completed++;
          continue;
        }

        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .eq("id", enrollment.user_id)
          .single();

        if (profileError || !profile || !profile.email) {
          console.log(`[process-email-sequences] Profile not found for user ${enrollment.user_id}`);
          results.errors.push(`Profile not found: ${enrollment.user_id}`);
          continue;
        }

        // Replace template variables
        const subject = replaceTemplateVariables(
          step.subject,
          profile,
          sequence,
          nextStepOrder,
          enrollment.metadata
        );

        const htmlContent = replaceTemplateVariables(
          step.html_template,
          profile,
          sequence,
          nextStepOrder,
          enrollment.metadata
        );

        // Send the email
        console.log(`[process-email-sequences] Sending email to ${profile.email} - Step ${nextStepOrder}`);
        
        const { error: emailError } = await resend.emails.send({
          from: "MIXXCLUB <noreply@mixxclub.com>",
          to: [profile.email],
          subject: subject,
          html: htmlContent,
        });

        if (emailError) {
          // Track retry attempts in metadata
          const retryCount = (enrollment.metadata?.retry_count as number) || 0;
          
          if (retryCount >= MAX_RETRY_ATTEMPTS - 1) {
            // Max retries reached, pause enrollment
            console.log(`[process-email-sequences] Max retries reached for ${enrollment.id}, pausing`);
            
            await supabase
              .from("email_sequence_enrollments")
              .update({
                status: "paused",
                metadata: {
                  ...enrollment.metadata,
                  paused_reason: "max_retries_exceeded",
                  last_error: emailError.message,
                },
              })
              .eq("id", enrollment.id);
          } else {
            // Increment retry count, will retry next run
            await supabase
              .from("email_sequence_enrollments")
              .update({
                metadata: {
                  ...enrollment.metadata,
                  retry_count: retryCount + 1,
                  last_error: emailError.message,
                },
              })
              .eq("id", enrollment.id);
          }

          results.errors.push(`Email failed for ${profile.email}: ${emailError.message}`);
          continue;
        }

        results.emails_sent++;

        // Check if there's a next step after this one
        const { data: nextStep } = await supabase
          .from("email_sequence_steps")
          .select("delay_hours")
          .eq("sequence_id", enrollment.sequence_id)
          .eq("step_order", nextStepOrder + 1)
          .eq("is_active", true)
          .single();

        const updateData: Record<string, unknown> = {
          current_step: nextStepOrder,
          last_email_at: new Date().toISOString(),
          metadata: {
            ...enrollment.metadata,
            retry_count: 0, // Reset retry count on success
          },
        };

        if (nextStep) {
          // Calculate next email time
          const nextEmailAt = new Date();
          nextEmailAt.setHours(nextEmailAt.getHours() + (nextStep.delay_hours || 24));
          updateData.next_email_at = nextEmailAt.toISOString();
        } else {
          // This was the last step
          updateData.status = "completed";
          updateData.completed_at = new Date().toISOString();
          updateData.next_email_at = null;
          results.sequences_completed++;
        }

        await supabase
          .from("email_sequence_enrollments")
          .update(updateData)
          .eq("id", enrollment.id);

        console.log(`[process-email-sequences] Successfully processed enrollment ${enrollment.id}`);

      } catch (enrollmentError) {
        const errorMessage = enrollmentError instanceof Error ? enrollmentError.message : "Unknown error";
        console.error(`[process-email-sequences] Error processing enrollment ${enrollment.id}:`, errorMessage);
        results.errors.push(`Enrollment ${enrollment.id}: ${errorMessage}`);
      }
    }

    const processingTime = Date.now() - startTime;
    console.log(`[process-email-sequences] Completed in ${processingTime}ms:`, results);

    return new Response(JSON.stringify({
      success: true,
      ...results,
      processing_time_ms: processingTime,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[process-email-sequences] Fatal error:", errorMessage);

    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      ...results,
      processing_time_ms: Date.now() - startTime,
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
