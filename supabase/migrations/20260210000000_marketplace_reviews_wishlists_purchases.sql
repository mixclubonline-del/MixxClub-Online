-- ============================================================================
-- Migration: Marketplace Products, Product Reviews, Wishlists & Purchases View
-- Created: 2026-02-10
-- Purpose: Creates tables needed by Tier 2 marketplace hooks
--          (useProductReviews, useWishlist, useSellerAnalytics)
-- ============================================================================

-- ──────────────────────────────────────────────────────────
-- 1. marketplace_products — canonical product table
--    Referenced by: useSellerAnalytics, useWishlist, useProductReviews
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.marketplace_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  category TEXT,
  image_url TEXT,
  preview_url TEXT,
  file_url TEXT,
  seller_name TEXT,
  status TEXT DEFAULT 'active',
  downloads INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;

-- Everyone can see active products
CREATE POLICY "marketplace_products_select_public"
  ON public.marketplace_products FOR SELECT
  USING (status = 'active');

-- Sellers can manage their own products
CREATE POLICY "marketplace_products_all_seller"
  ON public.marketplace_products FOR ALL
  USING (auth.uid() = seller_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_products_seller
  ON public.marketplace_products(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_category
  ON public.marketplace_products(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_status
  ON public.marketplace_products(status);

-- ──────────────────────────────────────────────────────────
-- 2. product_reviews — user reviews for marketplace products
--    Referenced by: useProductReviews, useProductRating,
--                   useSubmitReview, useHasReviewed, useSellerAnalytics
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- One review per user per product
  UNIQUE(product_id, user_id)
);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can read reviews
CREATE POLICY "product_reviews_select_public"
  ON public.product_reviews FOR SELECT
  USING (true);

-- Authenticated users can create reviews
CREATE POLICY "product_reviews_insert_auth"
  ON public.product_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "product_reviews_update_own"
  ON public.product_reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "product_reviews_delete_own"
  ON public.product_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_product_reviews_product
  ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user
  ON public.product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating
  ON public.product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_product_reviews_created
  ON public.product_reviews(created_at DESC);

-- ──────────────────────────────────────────────────────────
-- 3. wishlists — user product favorites
--    Referenced by: useWishlist, useIsWishlisted,
--                   useToggleWishlist, useWishlistCount
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- One wishlist entry per user per product
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Users can view their own wishlist
CREATE POLICY "wishlists_select_own"
  ON public.wishlists FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add to their own wishlist
CREATE POLICY "wishlists_insert_own"
  ON public.wishlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove from their own wishlist
CREATE POLICY "wishlists_delete_own"
  ON public.wishlists FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wishlists_user
  ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product
  ON public.wishlists(product_id);

-- ──────────────────────────────────────────────────────────
-- 4. purchases — product purchase records
--    Referenced by: useSellerAnalytics (queries product_id, amount, created_at)
--    Note: marketplace_purchases already exists for marketplace_items.
--          This table is for marketplace_products specifically.
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'completed',
  stripe_payment_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Buyers can view their own purchases
CREATE POLICY "purchases_select_buyer"
  ON public.purchases FOR SELECT
  USING (auth.uid() = buyer_id);

-- Sellers can view purchases of their products
CREATE POLICY "purchases_select_seller"
  ON public.purchases FOR SELECT
  USING (auth.uid() = seller_id);

-- System can create purchases (via edge functions / webhooks)
CREATE POLICY "purchases_insert_auth"
  ON public.purchases FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_purchases_product
  ON public.purchases(product_id);
CREATE INDEX IF NOT EXISTS idx_purchases_buyer
  ON public.purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_seller
  ON public.purchases(seller_id);
CREATE INDEX IF NOT EXISTS idx_purchases_created
  ON public.purchases(created_at DESC);

-- ──────────────────────────────────────────────────────────
-- 5. Auto-update updated_at trigger
-- ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- marketplace_products
DROP TRIGGER IF EXISTS trg_marketplace_products_updated_at ON public.marketplace_products;
CREATE TRIGGER trg_marketplace_products_updated_at
  BEFORE UPDATE ON public.marketplace_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- product_reviews
DROP TRIGGER IF EXISTS trg_product_reviews_updated_at ON public.product_reviews;
CREATE TRIGGER trg_product_reviews_updated_at
  BEFORE UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
