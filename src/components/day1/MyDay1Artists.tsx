import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Trophy, TrendingUp, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useDay1Status, type Day1WithArtist } from '@/hooks/useDay1Status';
import { Day1Badge } from './Day1Badge';
import { cn } from '@/lib/utils';

interface MyDay1ArtistsProps {
  className?: string;
  limit?: number;
}

export function MyDay1Artists({ className, limit = 6 }: MyDay1ArtistsProps) {
  const { myDay1Artists, isLoadingMyArtists, stats } = useDay1Status();

  if (isLoadingMyArtists) {
    return <Day1ArtistsSkeleton />;
  }

  if (!myDay1Artists || myDay1Artists.length === 0) {
    return (
      <Card className={cn("bg-card/50 backdrop-blur border-border/50", className)}>
        <CardContent className="p-6 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <h3 className="font-medium text-muted-foreground">No Day 1s Yet</h3>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Follow artists early to become a Day 1 supporter
          </p>
        </CardContent>
      </Card>
    );
  }

  const displayedArtists = myDay1Artists.slice(0, limit);

  return (
    <Card className={cn("bg-card/50 backdrop-blur border-border/50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            My Artists
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {myDay1Artists.length} supported
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={<Trophy className="h-4 w-4 text-amber-500" />}
            label="Day 1s"
            value={stats.day1Count + stats.beforeDay1Count}
          />
          <StatCard
            icon={<TrendingUp className="h-4 w-4 text-green-500" />}
            label="Hit 1K"
            value={stats.artistsHit1k}
          />
          <StatCard
            icon={<Star className="h-4 w-4 text-primary" />}
            label="Discovery"
            value={stats.discoveryScore}
          />
        </div>

        {/* Artist Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {displayedArtists.map((record, index) => (
            <ArtistCard key={record.id} record={record} index={index} />
          ))}
        </div>

        {myDay1Artists.length > limit && (
          <Link 
            to="/profile/day1s"
            className="block text-center text-sm text-primary hover:underline"
          >
            View all {myDay1Artists.length} artists →
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

interface ArtistCardProps {
  record: Day1WithArtist;
  index: number;
}

function ArtistCard({ record, index }: ArtistCardProps) {
  const artist = record.artist;
  const followerRank = record.artist_follower_count_at_follow + 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/u/${artist?.username || record.artist_id}`}
        className="block"
      >
        <div className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50">
          <div className="flex flex-col items-center text-center gap-2">
            <Avatar className="h-12 w-12">
              <AvatarImage src={artist?.avatar_url || undefined} />
              <AvatarFallback>
                {artist?.full_name?.charAt(0) || artist?.username?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            
            <div className="min-w-0 w-full">
              <p className="font-medium text-sm truncate">
                {artist?.full_name || artist?.username || 'Unknown'}
              </p>
              <p className="text-xs text-muted-foreground">
                #{followerRank}
              </p>
            </div>

            <Day1Badge 
              tier={record.recognition_tier as any} 
              compact 
              showRank={false}
            />

            {record.artist_milestone_1k && (
              <Badge variant="outline" className="text-[10px] py-0">
                Hit 1K 🎉
              </Badge>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="p-2 rounded-lg bg-muted/20 text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Day1ArtistsSkeleton() {
  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default MyDay1Artists;
