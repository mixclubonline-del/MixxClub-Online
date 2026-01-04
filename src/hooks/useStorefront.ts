import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Storefront {
  id: string;
  user_id: string;
  storefront_slug: string;
  display_name: string;
  bio?: string;
  banner_url?: string;
  logo_url?: string;
  theme_color: string;
  social_links: Record<string, string>;
  is_active: boolean;
  stripe_account_id?: string;
  total_sales: number;
  total_revenue: number;
  created_at: string;
  updated_at: string;
}

export interface MerchProduct {
  id: string;
  storefront_id: string;
  user_id: string;
  name: string;
  description?: string;
  thumbnail_url?: string;
  images: string[];
  price: number;
  category: string;
  is_active: boolean;
  inventory_count?: number;
  created_at: string;
  updated_at: string;
}

export interface MerchVariant {
  id: string;
  product_id: string;
  name: string;
  size?: string;
  color?: string;
  price: number;
  sku?: string;
  image_url?: string;
  inventory_count: number;
  created_at: string;
}

export interface CreateStorefrontInput {
  storefront_slug: string;
  display_name: string;
  bio?: string;
  banner_url?: string;
  logo_url?: string;
  theme_color?: string;
  social_links?: Record<string, string>;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  thumbnail_url?: string;
  images?: string[];
  price: number;
  category?: string;
  inventory_count?: number;
}

export const useStorefront = (slugOrUserId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: storefront,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['storefront', slugOrUserId || user?.id],
    queryFn: async () => {
      const identifier = slugOrUserId || user?.id;
      if (!identifier) return null;

      // Try by slug first, then by user_id
      let { data, error } = await supabase
        .from('user_storefronts')
        .select('*')
        .eq('storefront_slug', identifier)
        .maybeSingle();

      if (!data && !error) {
        const result = await supabase
          .from('user_storefronts')
          .select('*')
          .eq('user_id', identifier)
          .maybeSingle();
        data = result.data;
        error = result.error;
      }

      if (error) throw error;
      return data as Storefront | null;
    },
    enabled: !!(slugOrUserId || user?.id),
  });

  const createStorefrontMutation = useMutation({
    mutationFn: async (input: CreateStorefrontInput) => {
      if (!user?.id) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('user_storefronts')
        .insert({
          ...input,
          user_id: user.id,
          social_links: input.social_links || {},
        })
        .select()
        .single();

      if (error) throw error;
      return data as Storefront;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storefront'] });
      toast.success('Storefront created!');
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('This storefront URL is already taken');
      } else {
        toast.error('Failed to create storefront: ' + error.message);
      }
    },
  });

  const updateStorefrontMutation = useMutation({
    mutationFn: async (updates: Partial<Storefront>) => {
      if (!storefront?.id) throw new Error('No storefront found');

      const { data, error } = await supabase
        .from('user_storefronts')
        .update(updates)
        .eq('id', storefront.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storefront'] });
      toast.success('Storefront updated!');
    },
    onError: (error) => {
      toast.error('Failed to update storefront: ' + error.message);
    },
  });

  return {
    storefront,
    isLoading,
    error,
    refetch,
    hasStorefront: !!storefront,
    isOwner: storefront?.user_id === user?.id,
    createStorefront: createStorefrontMutation.mutateAsync,
    updateStorefront: updateStorefrontMutation.mutate,
    isCreating: createStorefrontMutation.isPending,
    isUpdating: updateStorefrontMutation.isPending,
  };
};

export const useStorefrontProducts = (storefrontId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['storefront-products', storefrontId],
    queryFn: async () => {
      if (!storefrontId) return [];

      const { data, error } = await supabase
        .from('merch_products')
        .select('*')
        .eq('storefront_id', storefrontId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MerchProduct[];
    },
    enabled: !!storefrontId,
  });

  const createProductMutation = useMutation({
    mutationFn: async (input: CreateProductInput) => {
      if (!user?.id || !storefrontId) throw new Error('Missing required data');

      const { data, error } = await supabase
        .from('merch_products')
        .insert({
          ...input,
          storefront_id: storefrontId,
          user_id: user.id,
          images: input.images || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storefront-products'] });
      toast.success('Product created!');
    },
    onError: (error) => {
      toast.error('Failed to create product: ' + error.message);
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MerchProduct> & { id: string }) => {
      const { data, error } = await supabase
        .from('merch_products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storefront-products'] });
      toast.success('Product updated!');
    },
    onError: (error) => {
      toast.error('Failed to update product: ' + error.message);
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('merch_products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storefront-products'] });
      toast.success('Product deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete product: ' + error.message);
    },
  });

  return {
    products,
    isLoading,
    error,
    createProduct: createProductMutation.mutateAsync,
    updateProduct: updateProductMutation.mutate,
    deleteProduct: deleteProductMutation.mutate,
    isCreating: createProductMutation.isPending,
    isUpdating: updateProductMutation.isPending,
    isDeleting: deleteProductMutation.isPending,
  };
};

export const useProductVariants = (productId?: string) => {
  const queryClient = useQueryClient();

  const {
    data: variants = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['product-variants', productId],
    queryFn: async () => {
      if (!productId) return [];

      const { data, error } = await supabase
        .from('merch_variants')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as MerchVariant[];
    },
    enabled: !!productId,
  });

  const createVariantMutation = useMutation({
    mutationFn: async (input: Omit<MerchVariant, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('merch_variants')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants'] });
      toast.success('Variant added!');
    },
  });

  const deleteVariantMutation = useMutation({
    mutationFn: async (variantId: string) => {
      const { error } = await supabase
        .from('merch_variants')
        .delete()
        .eq('id', variantId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants'] });
      toast.success('Variant removed');
    },
  });

  return {
    variants,
    isLoading,
    error,
    createVariant: createVariantMutation.mutate,
    deleteVariant: deleteVariantMutation.mutate,
  };
};
