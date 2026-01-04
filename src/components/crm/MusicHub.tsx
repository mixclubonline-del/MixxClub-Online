import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MusicCatalogue } from '@/components/catalogue/MusicCatalogue';
import { useAuth } from '@/hooks/useAuth';
import { useMusicCatalogue } from '@/hooks/useMusicCatalogue';
import { Music, Upload, TrendingUp, Play, DollarSign } from 'lucide-react';

export const MusicHub = () => {
  const { user } = useAuth();
  const { tracks, isLoading } = useMusicCatalogue(user?.id);

  const publicTracks = tracks?.filter(t => t.is_public) || [];
  const forSaleTracks = tracks?.filter(t => t.is_for_sale) || [];
  const totalPlays = tracks?.reduce((sum, t) => sum + (t.play_count || 0), 0) || 0;

  const stats = [
    {
      label: 'Total Tracks',
      value: tracks?.length || 0,
      icon: Music,
      color: 'text-primary'
    },
    {
      label: 'Public Releases',
      value: publicTracks.length,
      icon: TrendingUp,
      color: 'text-green-500'
    },
    {
      label: 'For Sale',
      value: forSaleTracks.length,
      icon: DollarSign,
      color: 'text-yellow-500'
    },
    {
      label: 'Total Plays',
      value: totalPlays.toLocaleString(),
      icon: Play,
      color: 'text-blue-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Music className="w-6 h-6 text-primary" />
            Music Hub
          </h2>
          <p className="text-muted-foreground">
            Manage your music catalogue and releases
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Catalogue */}
      <MusicCatalogue />
    </div>
  );
};
