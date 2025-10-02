import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createLogger } from "../_shared/logger.ts";

const logger = createLogger("docusign-webhook");

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const webhookData = await req.json();
    logger.info("Received DocuSign webhook", webhookData);

    const envelopeId = webhookData.envelopeId || webhookData.data?.envelopeId;
    const event = webhookData.event;

    if (!envelopeId) {
      throw new Error("No envelope ID in webhook");
    }

    // Find document with this envelope ID
    const { data: document, error: docError } = await supabaseClient
      .from("legal_documents")
      .select("*")
      .eq("docusign_envelope_id", envelopeId)
      .single();

    if (docError || !document) {
      logger.warn("Document not found for envelope", { envelopeId });
      return new Response(JSON.stringify({ received: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle envelope completion
    if (event === "envelope-completed") {
      await supabaseClient
        .from("legal_documents")
        .update({
          docusign_status: "completed",
          docusign_completed_at: new Date().toISOString(),
          attorney_reviewed: true,
          attorney_reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", document.id);

      // Send notification to admin
      await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-attorney-notification-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            document_id: document.id,
            document_type: document.document_type,
            document_title: document.title,
            attorney_name: document.attorney_name,
            attorney_email: document.attorney_email,
          }),
        }
      );

      logger.info("Document marked as reviewed", { documentId: document.id });
    } else if (event === "envelope-declined") {
      await supabaseClient
        .from("legal_documents")
        .update({
          docusign_status: "declined",
          updated_at: new Date().toISOString(),
        })
        .eq("id", document.id);

      logger.info("Document declined", { documentId: document.id });
    } else if (event === "envelope-voided") {
      await supabaseClient
        .from("legal_documents")
        .update({
          docusign_status: "voided",
          updated_at: new Date().toISOString(),
        })
        .eq("id", document.id);

      logger.info("Document voided", { documentId: document.id });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    logger.error("Error in docusign-webhook", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});