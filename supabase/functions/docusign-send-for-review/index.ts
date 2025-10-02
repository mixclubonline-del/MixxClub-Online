import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createLogger } from "../_shared/logger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logger = createLogger("docusign-send-for-review");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Verify admin access
    const { data: isAdmin } = await supabaseClient.rpc("is_admin", { user_uuid: user.id });
    if (!isAdmin) {
      throw new Error("Admin access required");
    }

    const { document_id, attorney_email, attorney_name } = await req.json();

    // Get document content
    const { data: document, error: docError } = await supabaseClient
      .from("legal_documents")
      .select("*")
      .eq("id", document_id)
      .single();

    if (docError || !document) {
      throw new Error("Document not found");
    }

    const docusignAccessToken = Deno.env.get("DOCUSIGN_ACCESS_TOKEN");
    const docusignAccountId = Deno.env.get("DOCUSIGN_ACCOUNT_ID");

    if (!docusignAccessToken || !docusignAccountId) {
      throw new Error("DocuSign credentials not configured");
    }

    // Create DocuSign envelope
    const envelopeData = {
      emailSubject: `Legal Document Review Required: ${document.title}`,
      documents: [
        {
          documentBase64: btoa(document.content),
          name: `${document.title} v${document.version}.txt`,
          fileExtension: "txt",
          documentId: "1",
        },
      ],
      recipients: {
        signers: [
          {
            email: attorney_email,
            name: attorney_name,
            recipientId: "1",
            routingOrder: "1",
            tabs: {
              signHereTabs: [
                {
                  documentId: "1",
                  pageNumber: "1",
                  xPosition: "100",
                  yPosition: "100",
                },
              ],
            },
          },
        ],
      },
      status: "sent",
    };

    const docusignResponse = await fetch(
      `https://demo.docusign.net/restapi/v2.1/accounts/${docusignAccountId}/envelopes`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${docusignAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(envelopeData),
      }
    );

    if (!docusignResponse.ok) {
      const errorText = await docusignResponse.text();
      logger.error("DocuSign API error", errorText);
      throw new Error(`DocuSign API error: ${errorText}`);
    }

    const envelopeResult = await docusignResponse.json();

    // Update document with DocuSign info
    await supabaseClient
      .from("legal_documents")
      .update({
        docusign_envelope_id: envelopeResult.envelopeId,
        docusign_status: "sent",
        docusign_sent_at: new Date().toISOString(),
        attorney_email,
        attorney_name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", document_id);

    // Create attorney notification
    await supabaseClient.from("attorney_notifications").insert({
      document_id,
      notification_type: "review_requested",
      attorney_email,
      attorney_name,
      email_sent: true,
      email_sent_at: new Date().toISOString(),
    });

    logger.info("DocuSign envelope sent successfully", { envelopeId: envelopeResult.envelopeId });

    return new Response(
      JSON.stringify({
        success: true,
        envelope_id: envelopeResult.envelopeId,
        envelope_url: envelopeResult.uri,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    logger.error("Error in docusign-send-for-review", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});