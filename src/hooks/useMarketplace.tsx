import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MarketplaceItem {
  id: string;
  seller_id: string;
  category_id: string | null;
  item_name: string;
  item_description: string | null;
  item_type: 'sample_pack' | 'preset' | 'template' | 'plugin';
  price: number;
  is_free: boolean;
  file_path: string | null;
  preview_audio_path: string | null;
  thumbnail_url: string | null;
  demo_video_url: string | null;
  download_count: number;
  total_sales: number;
  average_rating: number;
  total_reviews: number;
  tags: string[];
  is_published: boolean;
  featured: boolean;
  created_at: string;
}

export interface MarketplaceCategory {
  id: string;
  category_name: string;
  category_description: string | null;
  icon_name: string | null;
  display_order: number;
  is_active: boolean;
}

export const useMarketplaceItems = (filters?: {
  category?: string;
  type?: string;
  search?: string;
  featured?: boolean;
}) => {
  return useQuery({
    queryKey: ["marketplace-items", filters],
    queryFn: async () => {
      let query = supabase
        .from("marketplace_items")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (filters?.category) {
        query = query.eq("category_id", filters.category);
      }
      if (filters?.type) {
        query = query.eq("item_type", filters.type);
      }
      if (filters?.search) {
        query = query.ilike("item_name", `%${filters.search}%`);
      }
      if (filters?.featured) {
        query = query.eq("featured", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as MarketplaceItem[];
    },
  });
};

export const useMarketplaceCategories = () => {
  return useQuery({
    queryKey: ["marketplace-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      return data as MarketplaceCategory[];
    },
  });
};

export const useMarketplaceItem = (itemId: string) => {
  return useQuery({
    queryKey: ["marketplace-item", itemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_items")
        .select("*")
        .eq("id", itemId)
        .single();

      if (error) throw error;
      return data as MarketplaceItem;
    },
    enabled: !!itemId,
  });
};

export const usePurchaseItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      price,
    }: {
      itemId: string;
      price: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("marketplace_purchases")
        .insert({
          buyer_id: user.id,
          item_id: itemId,
          purchase_price: price,
          payment_status: "completed", // In production, this would be set after payment processing
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace-items"] });
      queryClient.invalidateQueries({ queryKey: ["user-purchases"] });
      toast.success("Purchase successful!");
    },
    onError: (error: Error) => {
      toast.error(`Purchase failed: ${error.message}`);
    },
  });
};

export const useUserPurchases = () => {
  return useQuery({
    queryKey: ["user-purchases"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("marketplace_purchases")
        .select(`
          *,
          marketplace_items (*)
        `)
        .eq("buyer_id", user.id)
        .order("purchased_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};
