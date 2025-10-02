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
    const { packageId } = await req.json();

    if (!packageId) {
      throw new Error("Package ID is required");
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

    const { data: packageData, error: packageError } = await supabaseClient
      .from("distribution_packages")
      .select("*")
      .eq("id", packageId)
      .single();

    if (packageError || !packageData) {
      throw new Error("Package not found");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: packageData.currency.toLowerCase(),
            product_data: {
              name: `${packageData.package_name} Distribution Package`,
              description: packageData.package_description,
            },
            unit_amount: Math.round(packageData.price * 100),
            recurring: packageData.billing_cycle === "annual" 
              ? { interval: "year" }
              : { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/distribution?success=true`,
      cancel_url: `${req.headers.get("origin")}/distribution?canceled=true`,
      client_reference_id: user.id,
      metadata: {
        packageId,
        packageType: "distribution",
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating distribution checkout:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
