import { motion } from 'framer-motion';
import { 
  Radio, Share2, Globe, Disc, Calendar,
  ExternalLink, CheckCircle, Clock, Music
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DistrictPortal } from '@/components/ui/DistrictPortal';
import { cn } from '@/lib/utils';

const platforms = [
  { name: 'Spotify', connected: true, color: 'bg-green-500' },
  { name: 'Apple Music', connected: true, color: 'bg-pink-500' },
  { name: 'YouTube Music', connected: false, color: 'bg-red-500' },
  { name: 'SoundCloud', connected: true, color: 'bg-orange-500' },
  { name: 'Tidal', connected: false, color: 'bg-blue-500' },
  { name: 'Amazon Music', connected: false, color: 'bg-cyan-500' },
];

const upcomingReleases = [
  { title: 'New Single - "Midnight"', date: 'Jan 20, 2026', status: 'Scheduled' },
  { title: 'EP - Summer Vibes', date: 'Feb 14, 2026', status: 'In Review' },
];

const recentReleases = [
  { title: 'Beat Pack Vol. 3', streams: 12450, platforms: 5 },
  { title: 'Collaboration Track', streams: 8920, platforms: 4 },
  { title: 'Remix - Official', streams: 6340, platforms: 6 },
];

export default function BroadcastTower() {
  const connectedCount = platforms.filter(p => p.connected).length;

  return (
    <DistrictPortal districtId="broadcast">
      <div className="p-6 md:p-8 pb-24">
        {/* Distribution Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Radio className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Distribution Hub</h2>
                  <p className="text-sm text-muted-foreground">
                    {connectedCount} of {platforms.length} platforms connected
                  </p>
                </div>
              </div>
              <Button className="gap-2">
                <Share2 className="w-4 h-4" />
                New Release
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Platforms Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Distribution Platforms
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {platforms.map((platform, index) => (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + index * 0.03 }}
              >
                <Card className={cn(
                  "p-4 text-center cursor-pointer transition-all hover:scale-105",
                  platform.connected 
                    ? "bg-card/50 border-green-500/30" 
                    : "bg-card/30 border-border/50 opacity-60"
                )}>
                  <div className={cn(
                    "w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center",
                    platform.color
                  )}>
                    <Disc className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs font-medium">{platform.name}</p>
                  {platform.connected && (
                    <CheckCircle className="w-3 h-3 text-green-400 mx-auto mt-1" />
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upcoming Releases */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-4 bg-card/50 backdrop-blur border-border/50">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Upcoming Releases
              </h3>
              {upcomingReleases.length > 0 ? (
                <div className="space-y-3">
                  {upcomingReleases.map((release, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                      <div>
                        <p className="text-sm font-medium">{release.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {release.date}
                        </p>
                      </div>
                      <Badge 
                        variant="outline"
                        className={cn(
                          release.status === 'Scheduled' && 'border-green-500/50 text-green-400',
                          release.status === 'In Review' && 'border-yellow-500/50 text-yellow-400'
                        )}
                      >
                        {release.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No upcoming releases</p>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Recent Releases */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-4 bg-card/50 backdrop-blur border-border/50">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Music className="w-4 h-4 text-primary" />
                Recent Releases
              </h3>
              <div className="space-y-3">
                {recentReleases.map((release, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{release.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {release.streams.toLocaleString()} streams • {release.platforms} platforms
                      </p>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </DistrictPortal>
  );
}
