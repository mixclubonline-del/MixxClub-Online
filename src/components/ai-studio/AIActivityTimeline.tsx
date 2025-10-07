import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Zap, Users, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function AIActivityTimeline() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['ai-activity-timeline'],
    queryFn: async () => {
      const [analyses, matches] = await Promise.all([
        supabase
          .from('ai_audio_profiles')
          .select('id, created_at, audio_file_id, audio_files(file_name, profiles(full_name))')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('ai_collaboration_matches')
          .select('id, created_at, compatibility_score, artist:profiles!ai_collaboration_matches_artist_id_fkey(full_name), engineer:profiles!ai_collaboration_matches_engineer_id_fkey(full_name)')
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      const combined = [
        ...(analyses.data || []).map(a => ({ type: 'analysis', data: a, timestamp: a.created_at })),
        ...(matches.data || []).map(m => ({ type: 'match', data: m, timestamp: m.created_at }))
      ];

      return combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 15);
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="bg-card/20 backdrop-blur-sm border-white/5">
            <CardContent className="p-3 flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'analysis': return <Sparkles className="w-4 h-4 text-primary" />;
      case 'match': return <Users className="w-4 h-4 text-accent-cyan" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getMessage = (activity: any) => {
    switch (activity.type) {
      case 'analysis':
        return `AI analyzed "${(activity.data.audio_files as any)?.file_name || 'track'}"`;
      case 'match':
        return `New collaboration match: ${(activity.data.artist as any)?.full_name || 'Artist'} + ${(activity.data.engineer as any)?.full_name || 'Engineer'}`;
      default:
        return 'AI activity';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'analysis': return 'Analysis';
      case 'match': return 'Match';
      default: return 'Event';
    }
  };

  return (
    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
      {activities?.map((activity, i) => (
        <Card key={i} className="bg-card/20 backdrop-blur-sm border-white/5 hover:border-primary/20 transition-all">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="bg-background rounded-full p-2">
              {getIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{getMessage(activity)}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {getTypeLabel(activity.type)}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
            <Zap className="w-4 h-4 text-accent-cyan flex-shrink-0" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
