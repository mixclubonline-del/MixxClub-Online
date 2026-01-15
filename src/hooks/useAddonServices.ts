import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AddonService {
  id: string;
  service_name: string;
  service_description: string | null;
  price: number;
  currency: string;
  applicable_to: string[];
  is_percentage: boolean;
  percentage_value: number | null;
  is_active: boolean;
  sort_order: number;
}

/**
 * Fetch all active addon services
 */
export function useAddonServices(applicableTo?: 'mixing' | 'mastering' | 'distribution') {
  return useQuery({
    queryKey: ['addon-services', applicableTo],
    queryFn: async () => {
      let query = supabase
        .from('addon_services')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (applicableTo) {
        query = query.contains('applicable_to', [applicableTo]);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AddonService[];
    },
  });
}

/**
 * Calculate addon price (handles percentage-based addons)
 */
export function calculateAddonPrice(addon: AddonService, basePrice: number): number {
  if (addon.is_percentage && addon.percentage_value) {
    return (basePrice * addon.percentage_value) / 100;
  }
  return addon.price;
}

/**
 * Format addon price for display
 */
export function formatAddonPrice(addon: AddonService, basePrice?: number): string {
  if (addon.is_percentage && addon.percentage_value) {
    const percentStr = `+${addon.percentage_value}%`;
    if (basePrice) {
      const actualPrice = calculateAddonPrice(addon, basePrice);
      return `${percentStr} (+$${actualPrice.toFixed(0)})`;
    }
    return percentStr;
  }
  return `+$${addon.price.toFixed(0)}`;
}
