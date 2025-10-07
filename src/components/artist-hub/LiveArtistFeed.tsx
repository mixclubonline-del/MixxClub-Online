import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, Award, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function LiveArtistFeed() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['artist-feed'],
    queryFn: async () => {
      const [uploads, achievements, newArtists] = await Promise.all([
        supabase
          .from('audio_files')
          .select('id, created_at, file_name, uploaded_by, profiles!audio_files_uploaded_by_fkey(full_name, avatar_url)')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('achievements')
          .select('id, earned_at, badge_name, user_id, profiles(full_name, avatar_url)')
          .order('earned_at', { ascending: false })
          .limit(5),
        supabase
          .from('profiles')
          .select('id, created_at, full_name, avatar_url')
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      const combined = [
        ...(uploads.data || []).map(u => ({ type: 'upload', data: u, timestamp: u.created_at })),
        ...(achievements.data || []).map(a => ({ type: 'achievement', data: a, timestamp: a.earned_at })),
        ...(newArtists.data || []).map(a => ({ type: 'signup', data: a, timestamp: a.created_at }))
      ];

      return combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="bg-card/20 backdrop-blur-sm border-white/5">
            <CardContent className="p-3 flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
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
      case 'upload': return <Upload className="w-4 h-4 text-primary" />;
      case 'achievement': return <Award className="w-4 h-4 text-accent-cyan" />;
      case 'signup': return <UserPlus className="w-4 h-4 text-accent-blue" />;
      default: return null;
    }
  };

  const getMessage = (activity: any) => {
    switch (activity.type) {
      case 'upload':
        return `${activity.data.profiles?.full_name || 'Artist'} uploaded a new track`;
      case 'achievement':
        return `${activity.data.profiles?.full_name || 'Artist'} earned "${activity.data.badge_name}"`;
      case 'signup':
        return `${activity.data.full_name || 'New artist'} joined the platform`;
      default:
        return '';
    }
  };

  return (
    <div className="space-y-2">
      {activities?.map((activity, i) => (
        <Card key={i} className="bg-card/20 backdrop-blur-sm border-white/5 hover:border-primary/20 transition-all">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={(activity.data as any).profiles?.avatar_url || (activity.data as any).avatar_url} />
                <AvatarFallback>{((activity.data as any).profiles?.full_name || (activity.data as any).full_name || '?')[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
                {getIcon(activity.type)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{getMessage(activity)}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
