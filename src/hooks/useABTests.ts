import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ABTestVariant {
  id: string;
  test_name: string;
  variant_name: string;
  traffic_percentage: number;
  impressions: number;
  conversions: number;
  is_winner: boolean;
  variant_config: any;
  created_at: string;
  updated_at: string;
}

export const useABTests = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: variants, isLoading } = useQuery({
    queryKey: ["ab-test-variants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ab_test_variants")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ABTestVariant[];
    },
  });

  const createVariant = useMutation({
    mutationFn: async (variant: {
      test_name: string;
      variant_name: string;
      traffic_percentage?: number;
      variant_config?: any;
    }) => {
      const { data, error } = await supabase
        .from("ab_test_variants")
        .insert([variant])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ab-test-variants"] });
      toast({
        title: "Variant created",
        description: "A/B test variant has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create variant: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateVariant = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<ABTestVariant>;
    }) => {
      const { error } = await supabase
        .from("ab_test_variants")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ab-test-variants"] });
      toast({
        title: "Variant updated",
        description: "A/B test variant has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update variant: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const recordImpression = useMutation({
    mutationFn: async (variantId: string) => {
      const { data: variant } = await supabase
        .from("ab_test_variants")
        .select("impressions")
        .eq("id", variantId)
        .single();

      if (variant) {
        await supabase
          .from("ab_test_variants")
          .update({ impressions: variant.impressions + 1 })
          .eq("id", variantId);
      }
    },
  });

  const recordConversion = useMutation({
    mutationFn: async (variantId: string) => {
      const { data: variant } = await supabase
        .from("ab_test_variants")
        .select("conversions")
        .eq("id", variantId)
        .single();

      if (variant) {
        await supabase
          .from("ab_test_variants")
          .update({ conversions: variant.conversions + 1 })
          .eq("id", variantId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ab-test-variants"] });
    },
  });

  const setWinner = useMutation({
    mutationFn: async ({ testName, variantId }: { testName: string; variantId: string }) => {
      // Reset all variants for this test
      await supabase
        .from("ab_test_variants")
        .update({ is_winner: false })
        .eq("test_name", testName);

      // Set the winner
      const { error } = await supabase
        .from("ab_test_variants")
        .update({ is_winner: true })
        .eq("id", variantId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ab-test-variants"] });
      toast({
        title: "Winner selected",
        description: "A/B test winner has been set successfully",
      });
    },
  });

  // Group variants by test name
  const testsByName = variants?.reduce((acc, variant) => {
    if (!acc[variant.test_name]) {
      acc[variant.test_name] = [];
    }
    acc[variant.test_name].push(variant);
    return acc;
  }, {} as Record<string, ABTestVariant[]>);

  return {
    variants: variants || [],
    testsByName: testsByName || {},
    isLoading,
    createVariant: createVariant.mutate,
    updateVariant: updateVariant.mutate,
    recordImpression: recordImpression.mutate,
    recordConversion: recordConversion.mutate,
    setWinner: setWinner.mutate,
  };
};
