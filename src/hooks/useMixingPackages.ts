import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MixingPackage {
  id: string;
  package_name: string;
  description: string | null;
  price: number;
  currency: string;
  track_limit: number;
  turnaround_days: number;
  features: string[];
  is_active: boolean;
}

/**
 * Fetch all active mixing packages from database
 */
export function useMixingPackages() {
  return useQuery({
    queryKey: ['mixing-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mixing_packages')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;

      return data.map(pkg => ({
        ...pkg,
        features: Array.isArray(pkg.features) ? pkg.features : JSON.parse(pkg.features as string || '[]'),
        is_featured: pkg.price === 199 || pkg.price === 249, // Mark middle tier as featured
      }));
    },
  });
}
