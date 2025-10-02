import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { createLogger } from '../_shared/logger.ts';
import { handleError, createResponse, validateRequest } from '../_shared/error-handler.ts';

const logger = createLogger('printful-create-order');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderItem {
  variant_id: string;
  quantity: number;
}

interface ShippingAddress {
  name: string;
  address1: string;
  address2?: string;
  city: string;
  state_code: string;
  country_code: string;
  zip: string;
  phone?: string;
  email: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const body = await req.json();
    validateRequest(body, ['items', 'shipping_address']);

    const { items, shipping_address } = body as {
      items: OrderItem[];
      shipping_address: ShippingAddress;
    };

    logger.info('Creating Printful order', { userId: user.id, itemCount: items.length });

    const printfulApiKey = Deno.env.get('PRINTFUL_API_KEY');
    if (!printfulApiKey) {
      throw new Error('PRINTFUL_API_KEY not configured');
    }

    // Calculate order total from database prices
    let orderTotal = 0;
    const orderItems = [];

    for (const item of items) {
      const { data: variant } = await supabaseClient
        .from('merch_variants')
        .select('*, merch_products(*)')
        .eq('printful_variant_id', item.variant_id)
        .single();

      if (!variant) {
        throw new Error(`Variant ${item.variant_id} not found`);
      }

      orderTotal += parseFloat(variant.price) * item.quantity;
      orderItems.push({
        sync_variant_id: parseInt(item.variant_id),
        quantity: item.quantity,
      });
    }

    // Create order in database
    const { data: dbOrder, error: orderError } = await supabaseClient
      .from('merch_orders')
      .insert({
        user_id: user.id,
        status: 'pending',
        total_amount: orderTotal,
        currency: 'USD',
        shipping_address: shipping_address,
      })
      .select()
      .single();

    if (orderError || !dbOrder) {
      throw new Error('Failed to create order in database');
    }

    // Create order with Printful
    const printfulOrder = {
      recipient: {
        name: shipping_address.name,
        address1: shipping_address.address1,
        address2: shipping_address.address2,
        city: shipping_address.city,
        state_code: shipping_address.state_code,
        country_code: shipping_address.country_code,
        zip: shipping_address.zip,
        phone: shipping_address.phone,
        email: shipping_address.email,
      },
      items: orderItems,
      retail_costs: {
        currency: 'USD',
        subtotal: orderTotal.toFixed(2),
        shipping: '0.00',
        tax: '0.00',
      },
    };

    const response = await fetch('https://api.printful.com/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${printfulApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(printfulOrder),
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error('Printful API error', { error });
      throw new Error(`Printful API error: ${response.statusText}`);
    }

    const { result } = await response.json();

    // Update order with Printful ID
    await supabaseClient
      .from('merch_orders')
      .update({
        printful_order_id: result.id.toString(),
        status: 'processing',
      })
      .eq('id', dbOrder.id);

    logger.info('Order created successfully', { orderId: dbOrder.id, printfulOrderId: result.id });

    return createResponse(
      {
        success: true,
        order_id: dbOrder.id,
        printful_order_id: result.id,
        total: orderTotal,
      },
      200,
      corsHeaders
    );

  } catch (error) {
    logger.error('Error creating order', error);
    const { status, body } = handleError(error);
    return createResponse(body, status, corsHeaders);
  }
});
