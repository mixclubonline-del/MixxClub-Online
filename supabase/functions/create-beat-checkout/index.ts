 import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
 import Stripe from "https://esm.sh/stripe@18.5.0";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
 import { getCorsHeaders } from '../_shared/cors.ts';
 
 /**
  * Create Beat Checkout Session
  * Handles Stripe checkout for beat purchases with 70/30 revenue split
  */
 
 const PLATFORM_FEE_PERCENTAGE = 0.30; // 30% platform fee
 
 interface BeatCheckoutRequest {
   beatId: string;
   licenseType: 'lease' | 'exclusive';
   successUrl?: string;
   cancelUrl?: string;
 }
 
 serve(async (req) => {
   const corsHeaders = getCorsHeaders(req);
   
   if (req.method === 'OPTIONS') {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     console.log('[CREATE-BEAT-CHECKOUT] Function started');
 
     const supabaseClient = createClient(
       Deno.env.get('SUPABASE_URL') ?? '',
       Deno.env.get('SUPABASE_ANON_KEY') ?? '',
       {
         global: {
           headers: { Authorization: req.headers.get('Authorization')! },
         },
       }
     );
 
     // Authenticate user
     const authHeader = req.headers.get('Authorization');
     if (!authHeader?.startsWith('Bearer ')) {
       throw new Error('Unauthorized');
     }
 
     const token = authHeader.replace('Bearer ', '');
     const { data: claims, error: claimsError } = await supabaseClient.auth.getClaims(token);
     
     if (claimsError || !claims?.claims) {
       throw new Error('Unauthorized');
     }
 
     const userId = claims.claims.sub;
     const userEmail = claims.claims.email as string;
 
     console.log('[CREATE-BEAT-CHECKOUT] User authenticated:', userId);
 
     const body: BeatCheckoutRequest = await req.json();
     const { beatId, licenseType, successUrl, cancelUrl } = body;
 
     if (!beatId || !licenseType) {
       throw new Error('Beat ID and license type are required');
     }
 
     if (!['lease', 'exclusive'].includes(licenseType)) {
       throw new Error('Invalid license type');
     }
 
     // Use service role for database operations
     const supabaseAdmin = createClient(
       Deno.env.get('SUPABASE_URL') ?? '',
       Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
     );
 
     // Fetch beat details
     const { data: beat, error: beatError } = await supabaseAdmin
       .from('producer_beats')
       .select(`
         id, title, producer_id, price_cents, exclusive_price_cents, 
         license_type, status, is_exclusive_available,
         producer:producer_id(id, username, full_name)
       `)
       .eq('id', beatId)
       .single();
 
     if (beatError || !beat) {
       throw new Error('Beat not found');
     }
 
     if (beat.status !== 'published') {
       throw new Error('Beat is not available for purchase');
     }
 
     // Check if exclusive is available
     if (licenseType === 'exclusive' && beat.is_exclusive_available === false) {
       throw new Error('Exclusive license is no longer available for this beat');
     }
 
     // Check if beat supports requested license type
     if (beat.license_type !== 'both' && beat.license_type !== licenseType) {
       throw new Error(`This beat is only available for ${beat.license_type} license`);
     }
 
     // Prevent self-purchase
     if (beat.producer_id === userId) {
       throw new Error('You cannot purchase your own beat');
     }
 
     // Calculate pricing with 70/30 split
     const priceCents = licenseType === 'exclusive' 
       ? beat.exclusive_price_cents 
       : beat.price_cents;
 
     if (!priceCents || priceCents <= 0) {
       throw new Error('Beat price is not configured');
     }
 
     const platformFeeCents = Math.round(priceCents * PLATFORM_FEE_PERCENTAGE);
     const sellerEarningsCents = priceCents - platformFeeCents;
 
     console.log('[CREATE-BEAT-CHECKOUT] Price calculation:', {
       priceCents,
       platformFeeCents,
       sellerEarningsCents,
       licenseType
     });
 
     // Initialize Stripe
     const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
       apiVersion: '2025-08-27.basil',
     });
 
     // Check if customer exists
     const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
     let customerId: string | undefined;
 
     if (customers.data.length > 0) {
       customerId = customers.data[0].id;
     } else {
       const customer = await stripe.customers.create({
         email: userEmail,
         metadata: { user_id: userId },
       });
       customerId = customer.id;
     }
 
     // Get producer name for display
     const producerName = beat.producer?.full_name || beat.producer?.username || 'Producer';
 
     // Create checkout session
     const session = await stripe.checkout.sessions.create({
       customer: customerId,
       line_items: [
         {
           price_data: {
             currency: 'usd',
             unit_amount: priceCents,
             product_data: {
               name: beat.title,
               description: `${licenseType === 'exclusive' ? 'Exclusive' : 'Lease'} License by ${producerName}`,
               metadata: {
                 beat_id: beatId,
                 license_type: licenseType,
               },
             },
           },
           quantity: 1,
         },
       ],
       mode: 'payment',
       success_url: successUrl || `${req.headers.get('origin')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
       cancel_url: cancelUrl || `${req.headers.get('origin')}/beats`,
       metadata: {
         purchase_type: 'beat',
         beat_id: beatId,
         beat_title: beat.title,
         seller_id: beat.producer_id,
         buyer_id: userId,
         license_type: licenseType,
         price_cents: String(priceCents),
         platform_fee_cents: String(platformFeeCents),
         seller_earnings_cents: String(sellerEarningsCents),
       },
       client_reference_id: userId,
     });
 
     console.log('[CREATE-BEAT-CHECKOUT] Session created:', session.id);
 
     return new Response(
       JSON.stringify({
         url: session.url,
         sessionId: session.id,
       }),
       {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         status: 200,
       }
     );
   } catch (error) {
     const errorMessage = error instanceof Error ? error.message : String(error);
     console.error('[CREATE-BEAT-CHECKOUT] Error:', errorMessage);
 
     return new Response(
       JSON.stringify({ error: errorMessage }),
       {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         status: 500,
       }
     );
   }
 });