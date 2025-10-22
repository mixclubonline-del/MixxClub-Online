import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { checkRateLimit, rateLimitHeaders } from '../_shared/rate-limit.ts';
import { getCorsHeaders } from '../_shared/cors.ts';

const addonPaymentSchema = z.object({
  serviceId: z.string().uuid('Invalid service ID format'),
  projectId: z.string().uuid('Invalid project ID format').optional(),
  amount: z.number()
    .positive('Amount must be positive')
    .min(1, 'Minimum payment is $1')
    .max(100000, 'Maximum payment is $100,000')
});

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { serviceId, projectId, amount } = addonPaymentSchema.parse(body);

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

    // Rate limiting: 5 addon purchases per hour per user
    const rateLimit = await checkRateLimit(
      user.id,
      { maxRequests: 5, windowMs: 60 * 60 * 1000, keyPrefix: 'addon-payment' },
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Too many purchase attempts. Please try again later.',
          resetAt: rateLimit.resetAt 
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            ...rateLimitHeaders(rateLimit),
            'Content-Type': 'application/json' 
          } 
        }
      );
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
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: error.errors }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    if (error instanceof Error && error.message === 'Service not found') {
      return new Response(
        JSON.stringify({ error: 'Service not found' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Payment processing failed' }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
