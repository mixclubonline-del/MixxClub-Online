import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentLinkRequest {
  accountId: string;
  amount: number;
  currency?: string;
  description: string;
  packageId?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[CREATE-PAYMENT-LINK] Function started");

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication failed: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    console.log("[CREATE-PAYMENT-LINK] User authenticated:", user.id);

    // Parse request body
    const requestData: PaymentLinkRequest = await req.json();
    const { accountId, amount, currency = "USD", description, packageId } = requestData;

    if (!amount || amount <= 0) throw new Error("Invalid amount");
    if (!description) throw new Error("Description required");

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("[CREATE-PAYMENT-LINK] Existing customer found:", customerId);
    } else {
      // Create customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
          account_id: accountId,
        },
      });
      customerId = customer.id;
      console.log("[CREATE-PAYMENT-LINK] New customer created:", customerId);
    }

    // Create payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: Math.round(amount * 100), // Convert to cents
            product_data: {
              name: description,
              metadata: {
                account_id: accountId,
                package_id: packageId || "",
              },
            },
          },
          quantity: 1,
        },
      ],
      after_completion: {
        type: "redirect",
        redirect: {
          url: `${req.headers.get("origin")}/enterprise/payment-success?account_id=${accountId}`,
        },
      },
      metadata: {
        user_id: user.id,
        account_id: accountId,
        package_id: packageId || "",
      },
    });

    console.log("[CREATE-PAYMENT-LINK] Payment link created:", paymentLink.id);

    return new Response(
      JSON.stringify({
        url: paymentLink.url,
        id: paymentLink.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[CREATE-PAYMENT-LINK] Error:", errorMessage);

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
