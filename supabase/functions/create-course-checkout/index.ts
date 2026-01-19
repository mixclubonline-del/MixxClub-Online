import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

/**
 * Create Course Checkout
 * Handles paid course purchases via Stripe Checkout
 * Free courses are enrolled directly
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    const { courseId } = await req.json();
    if (!courseId) {
      throw new Error("Course ID is required");
    }

    // Fetch course details
    const { data: course, error: courseError } = await supabaseClient
      .from("courses")
      .select("id, title, price, tier, stripe_price_id, is_published")
      .eq("id", courseId)
      .single();

    if (courseError || !course) {
      throw new Error("Course not found");
    }

    if (!course.is_published) {
      throw new Error("Course is not available");
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabaseClient
      .from("course_enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .single();

    if (existingEnrollment) {
      throw new Error("Already enrolled in this course");
    }

    // Free courses - enroll directly
    if (course.tier === "free" || !course.price || course.price === 0) {
      const { data: enrollment, error: enrollError } = await supabaseClient
        .from("course_enrollments")
        .insert({
          user_id: user.id,
          course_id: courseId,
          progress_percentage: 0,
        })
        .select()
        .single();

      if (enrollError) {
        throw new Error("Failed to enroll in course");
      }

      // Increment enrollment count
      try {
        await supabaseClient.rpc("increment_course_enrollments", { p_course_id: courseId });
      } catch (e) {
        console.warn("Could not increment enrollment count:", e);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          enrolled: true,
          enrollment_id: enrollment.id,
          message: "Successfully enrolled in course" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Paid courses - create Stripe checkout session
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const origin = req.headers.get("origin") || "https://mixxclub.lovable.app";

    // Create line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    if (course.stripe_price_id) {
      // Use existing Stripe price
      lineItems.push({
        price: course.stripe_price_id,
        quantity: 1,
      });
    } else {
      // Create dynamic price
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: course.title,
            description: `Premium Course: ${course.title}`,
          },
          unit_amount: Math.round((course.price || 0) * 100), // Convert to cents
        },
        quantity: 1,
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email!,
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&type=course`,
      cancel_url: `${origin}/courses?canceled=true`,
      metadata: {
        user_id: user.id,
        course_id: courseId,
        package_type: "course",
        course_title: course.title,
      },
      client_reference_id: user.id,
    });

    console.log(`[CREATE-COURSE-CHECKOUT] Session created for user ${user.id}, course ${courseId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: session.url,
        session_id: session.id 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("[CREATE-COURSE-CHECKOUT] Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
