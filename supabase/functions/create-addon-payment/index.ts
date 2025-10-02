import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { serviceId, projectId, amount } = await req.json();

    if (!serviceId || !amount) {
      throw new Error("Service ID and amount are required");
    }

    const authHeader = req.headers.get("Authorization")!;
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { data: serviceData, error: serviceError } = await supabaseClient
      .from("add_on_services")
      .select("*")
      .eq("id", serviceId)
      .single();

    if (serviceError || !serviceData) {
      throw new Error("Service not found");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: serviceData.currency.toLowerCase(),
      metadata: {
        serviceId,
        projectId: projectId || "",
        userId: user.id,
        serviceName: serviceData.service_name,
      },
    });

    return new Response(
      JSON.stringify({ 
        clientSecret: paymentIntent.client_secret,
        publishableKey: Deno.env.get("STRIPE_PUBLISHABLE_KEY") 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating add-on payment:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
