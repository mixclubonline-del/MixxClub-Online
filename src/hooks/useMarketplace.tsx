import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useMarketplaceItems = () => {
  return useQuery({
    queryKey: ["marketplace-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_items")
        .select("*, marketplace_categories(category_name)")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
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
        .order("category_name");
      
      if (error) throw error;
      return data;
    },
  });
};

export const useMarketplaceItem = (itemId?: string) => {
  return useQuery({
    queryKey: ["marketplace-item", itemId],
    queryFn: async () => {
      if (!itemId) return null;
      
      const { data, error } = await supabase
        .from("marketplace_items")
        .select("*, marketplace_categories(category_name), profiles(full_name, email)")
        .eq("id", itemId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!itemId,
  });
};

export const useUserPurchases = (userId?: string) => {
  return useQuery({
    queryKey: ["user-purchases", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("marketplace_purchases")
        .select("*, marketplace_items(item_name, item_type, files)")
        .eq("buyer_id", userId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useUserListings = (userId?: string) => {
  return useQuery({
    queryKey: ["user-listings", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("marketplace_items")
        .select("*")
        .eq("seller_id", userId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const usePurchaseItem = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, buyerId, sellerId, amount }: {
      itemId: string;
      buyerId: string;
      sellerId: string;
      amount: number;
    }) => {
      const { data, error } = await supabase
        .from("marketplace_purchases")
        .insert({
          item_id: itemId,
          buyer_id: buyerId,
          seller_id: sellerId,
          purchase_amount: amount,
          status: "completed",
        })
        .select()
        .single();

      if (error) throw error;

      // Update sales count
      await supabase.rpc("increment", {
        table_name: "marketplace_items",
        row_id: itemId,
        column_name: "sales_count",
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace-items"] });
      queryClient.invalidateQueries({ queryKey: ["user-purchases"] });
      toast({
        title: "Purchase successful",
        description: "Your purchase has been completed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useCreateListing = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listing: {
      item_name: string;
      item_description: string;
      item_type: string;
      price: number;
      seller_id: string;
      category_id?: string;
      files?: any;
      preview_urls?: string[];
    }) => {
      const { data, error } = await supabase
        .from("marketplace_items")
        .insert({
          ...listing,
          status: "active",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace-items"] });
      queryClient.invalidateQueries({ queryKey: ["user-listings"] });
      toast({
        title: "Listing created",
        description: "Your item has been listed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create listing",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useMarketplace = () => {
  const items = useMarketplaceItems();
  const categories = useMarketplaceCategories();
  
  return {
    items: items.data || [],
    categories: categories.data || [],
    purchases: [],
    userListings: [],
    isLoading: items.isLoading || categories.isLoading,
    error: items.error || categories.error,
  };
};
