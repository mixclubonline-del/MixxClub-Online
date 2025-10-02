import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { createLogger } from '../_shared/logger.ts';
import { handleError, createResponse } from '../_shared/error-handler.ts';

const logger = createLogger('printful-sync-products');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PrintfulProduct {
  id: number;
  external_id: string;
  name: string;
  variants: number;
  synced: number;
  thumbnail_url: string;
  is_ignored: boolean;
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

    logger.info('Syncing Printful products', { userId: user.id });

    const printfulApiKey = Deno.env.get('PRINTFUL_API_KEY');
    if (!printfulApiKey) {
      throw new Error('PRINTFUL_API_KEY not configured');
    }

    // Fetch products from Printful
    const response = await fetch('https://api.printful.com/store/products', {
      headers: {
        'Authorization': `Bearer ${printfulApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Printful API error: ${response.statusText}`);
    }

    const { result } = await response.json();
    const products = result as PrintfulProduct[];

    logger.info('Fetched products from Printful', { count: products.length });

    // Sync products to database
    for (const product of products) {
      if (product.is_ignored) continue;

      // Fetch detailed product info including variants
      const detailResponse = await fetch(
        `https://api.printful.com/store/products/${product.id}`,
        {
          headers: {
            'Authorization': `Bearer ${printfulApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!detailResponse.ok) continue;

      const { result: detailResult } = await detailResponse.json();
      const syncProduct = detailResult.sync_product;
      const syncVariants = detailResult.sync_variants;

      // Upsert product
      const { data: dbProduct, error: productError } = await supabaseClient
        .from('merch_products')
        .upsert({
          printful_id: product.id.toString(),
          name: syncProduct.name,
          description: syncProduct.name,
          thumbnail_url: product.thumbnail_url,
          is_active: true,
        })
        .select()
        .single();

      if (productError || !dbProduct) {
        logger.error('Failed to upsert product', productError);
        continue;
      }

      // Upsert variants
      for (const variant of syncVariants) {
        await supabaseClient
          .from('merch_variants')
          .upsert({
            product_id: dbProduct.id,
            printful_variant_id: variant.id.toString(),
            name: variant.name,
            sku: variant.sku,
            price: variant.retail_price,
            currency: variant.currency,
            size: variant.size || null,
            color: variant.color || null,
            image_url: variant.files?.[0]?.preview_url || product.thumbnail_url,
            is_available: variant.is_ignored === false,
          });
      }
    }

    logger.info('Product sync completed successfully');

    return createResponse(
      { 
        success: true, 
        message: 'Products synced successfully',
        productCount: products.length
      },
      200,
      corsHeaders
    );

  } catch (error) {
    logger.error('Error syncing products', error);
    const { status, body } = handleError(error);
    return createResponse(body, status, corsHeaders);
  }
});
