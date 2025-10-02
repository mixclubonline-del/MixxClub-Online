-- Insert 5 test merchandise products
INSERT INTO public.merch_products (name, description, printful_id, thumbnail_url, is_active)
VALUES 
  (
    'MixClub Logo T-Shirt',
    'Premium cotton t-shirt featuring the iconic MixClub logo. Perfect for studio sessions and everyday wear.',
    'printful_prod_001',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    true
  ),
  (
    'MixClub Studio Hoodie',
    'Comfortable pullover hoodie perfect for long studio sessions. Features embroidered MixClub branding.',
    'printful_prod_002',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
    true
  ),
  (
    'MixClub Snapback Hat',
    'Adjustable snapback hat with embroidered MixClub logo. One size fits all.',
    'printful_prod_003',
    'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400',
    true
  ),
  (
    'Producer Edition Mug',
    '11oz ceramic mug for your coffee or tea during mixing sessions. Dishwasher safe.',
    'printful_prod_004',
    'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400',
    true
  ),
  (
    'MixClub Tote Bag',
    'Durable canvas tote bag for carrying gear or groceries. Features screen-printed MixClub logo.',
    'printful_prod_005',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400',
    true
  );

-- Insert variants for MixClub Logo T-Shirt (Black, White, Navy in S, M, L, XL)
INSERT INTO public.merch_variants (product_id, name, printful_variant_id, price, currency, size, color, sku, image_url, is_available)
SELECT 
  id,
  color_variant.color || ' / ' || size_variant.size,
  'printful_var_001_' || ROW_NUMBER() OVER (),
  24.99,
  'USD',
  size_variant.size,
  color_variant.color,
  'MXCLB-TSH-' || UPPER(SUBSTRING(color_variant.color, 1, 3)) || '-' || size_variant.size,
  color_variant.img_url,
  true
FROM merch_products,
  (VALUES ('Black', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'),
          ('White', 'https://images.unsplash.com/photo-1622445275576-721325763afe?w=400'),
          ('Navy', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400')) AS color_variant(color, img_url),
  (VALUES ('S'), ('M'), ('L'), ('XL')) AS size_variant(size)
WHERE merch_products.printful_id = 'printful_prod_001';

-- Insert variants for MixClub Studio Hoodie (Black, Gray in S, M, L, XL)
INSERT INTO public.merch_variants (product_id, name, printful_variant_id, price, currency, size, color, sku, image_url, is_available)
SELECT 
  id,
  color_variant.color || ' / ' || size_variant.size,
  'printful_var_002_' || ROW_NUMBER() OVER (),
  44.99,
  'USD',
  size_variant.size,
  color_variant.color,
  'MXCLB-HDY-' || UPPER(SUBSTRING(color_variant.color, 1, 3)) || '-' || size_variant.size,
  color_variant.img_url,
  true
FROM merch_products,
  (VALUES ('Black', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400'),
          ('Gray', 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=400')) AS color_variant(color, img_url),
  (VALUES ('S'), ('M'), ('L'), ('XL')) AS size_variant(size)
WHERE merch_products.printful_id = 'printful_prod_002';

-- Insert variants for MixClub Snapback Hat (Black, Red, White - One Size)
INSERT INTO public.merch_variants (product_id, name, printful_variant_id, price, currency, size, color, sku, image_url, is_available)
SELECT 
  id,
  color_variant.color || ' / One Size',
  'printful_var_003_' || ROW_NUMBER() OVER (),
  29.99,
  'USD',
  'One Size',
  color_variant.color,
  'MXCLB-HAT-' || UPPER(SUBSTRING(color_variant.color, 1, 3)),
  color_variant.img_url,
  true
FROM merch_products,
  (VALUES ('Black', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400'),
          ('Red', 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=400'),
          ('White', 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400')) AS color_variant(color, img_url)
WHERE merch_products.printful_id = 'printful_prod_003';

-- Insert variants for Producer Edition Mug (Black, White)
INSERT INTO public.merch_variants (product_id, name, printful_variant_id, price, currency, size, color, sku, image_url, is_available)
SELECT 
  id,
  color_variant.color || ' / Standard',
  'printful_var_004_' || ROW_NUMBER() OVER (),
  14.99,
  'USD',
  'Standard',
  color_variant.color,
  'MXCLB-MUG-' || UPPER(SUBSTRING(color_variant.color, 1, 3)),
  color_variant.img_url,
  true
FROM merch_products,
  (VALUES ('Black', 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400'),
          ('White', 'https://images.unsplash.com/photo-1572119437334-f8bcfe922d05?w=400')) AS color_variant(color, img_url)
WHERE merch_products.printful_id = 'printful_prod_004';

-- Insert variants for MixClub Tote Bag (Natural, Black)
INSERT INTO public.merch_variants (product_id, name, printful_variant_id, price, currency, size, color, sku, image_url, is_available)
SELECT 
  id,
  color_variant.color || ' / One Size',
  'printful_var_005_' || ROW_NUMBER() OVER (),
  19.99,
  'USD',
  'One Size',
  color_variant.color,
  'MXCLB-BAG-' || UPPER(SUBSTRING(color_variant.color, 1, 3)),
  color_variant.img_url,
  true
FROM merch_products,
  (VALUES ('Natural', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400'),
          ('Black', 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400')) AS color_variant(color, img_url)
WHERE merch_products.printful_id = 'printful_prod_005';