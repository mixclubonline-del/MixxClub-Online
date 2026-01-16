import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MasteringPackage {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  track_limit: number;
  turnaround_days: number;
  features: string[];
  is_active: boolean;
}

/**
 * Fetch all active mastering packages from database
 */
export function useMasteringPackages() {
  return useQuery({
    queryKey: ['mastering-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mastering_packages')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;

      return data.map(pkg => ({
        ...pkg,
        features: Array.isArray(pkg.features) ? pkg.features : JSON.parse(pkg.features as string || '[]'),
        is_featured: pkg.price === 79 || pkg.name?.toLowerCase().includes('ep'), // Mark EP tier as featured
      }));
    },
  });
}
