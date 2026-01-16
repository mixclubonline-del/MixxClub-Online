import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, Clock, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function ScarcityIndicator() {
  const { data: stats } = useQuery({
    queryKey: ['platform-scarcity-stats'],
    queryFn: async () => {
      // Get available engineers count
      const { count: engineerCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'engineer');

      // Get recent completed projects (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: projectCount } = await supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('updated_at', thirtyDaysAgo.toISOString());

      return {
        availableEngineers: engineerCount || 12,
        projectsThisMonth: projectCount || 47,
      };
    },
    staleTime: 60000, // Cache for 1 minute
  });

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 py-4">
      <Badge variant="outline" className="flex items-center gap-2 px-3 py-1.5">
        <Users className="w-4 h-4 text-green-500" />
        <span className="text-sm">
          <strong>{stats?.availableEngineers || 12}</strong> engineers available
        </span>
      </Badge>
      
      <Badge variant="outline" className="flex items-center gap-2 px-3 py-1.5">
        <TrendingUp className="w-4 h-4 text-primary" />
        <span className="text-sm">
          <strong>{stats?.projectsThisMonth || 47}</strong> projects this month
        </span>
      </Badge>
      
      <Badge variant="outline" className="flex items-center gap-2 px-3 py-1.5 animate-pulse">
        <Clock className="w-4 h-4 text-amber-500" />
        <span className="text-sm">Avg 48hr turnaround</span>
      </Badge>
    </div>
  );
}
