import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paymentId } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get payment with project and user details
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .select(`
        *,
        project:projects(
          title,
          client:profiles!projects_client_id_fkey(full_name, email),
          engineer:profiles!projects_engineer_id_fkey(full_name)
        )
      `)
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      throw new Error('Payment not found');
    }

    // Verify user has access to this payment
    if (payment.user_id !== user.id) {
      const { data: isAdmin } = await supabaseClient.rpc('is_admin', { user_uuid: user.id });
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: 'Access denied' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Generate invoice data (client-side will use jsPDF)
    const invoiceData = {
      invoiceNumber: `INV-${payment.id.substring(0, 8).toUpperCase()}`,
      date: new Date(payment.created_at).toLocaleDateString(),
      dueDate: new Date(payment.created_at).toLocaleDateString(),
      
      // Company details
      from: {
        name: 'MixClub',
        address: '123 Audio Street',
        city: 'Los Angeles, CA 90001',
        email: 'billing@mixclub.com'
      },
      
      // Customer details
      to: {
        name: payment.project?.client?.full_name || 'Customer',
        email: payment.project?.client?.email || '',
      },
      
      // Line items
      items: [
        {
          description: payment.project?.title || 'Audio Engineering Services',
          quantity: 1,
          price: payment.amount,
          total: payment.amount
        }
      ],
      
      // Totals
      subtotal: payment.amount,
      tax: 0,
      total: payment.amount,
      
      // Payment info
      status: payment.status,
      paymentMethod: payment.payment_method,
      transactionId: payment.transaction_id,
      
      // Additional notes
      notes: 'Thank you for your business!',
      terms: 'Payment processed securely via Stripe.'
    };

    console.log('Invoice data generated for payment:', paymentId);

    return new Response(
      JSON.stringify({ invoiceData }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error generating invoice:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
