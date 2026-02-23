/**
 * MusicHub — Migrated to design tokens (GlassPanel, HubHeader, HubSkeleton, EmptyState).
 * 
 * Music catalogue management with glassmorphic stat cards,
 * standardized header, and proper loading/empty states.
 */

import { GlassPanel, HubHeader, HubSkeleton, EmptyState } from './design';
import { Button } from '@/components/ui/button';
import { MusicCatalogue } from '@/components/catalogue/MusicCatalogue';
import { useAuth } from '@/hooks/useAuth';
import { useMusicCatalogue } from '@/hooks/useMusicCatalogue';
import { Music, Upload, TrendingUp, Play, DollarSign } from 'lucide-react';

export const MusicHub = () => {
  const { user } = useAuth();
  const { tracks, isLoading } = useMusicCatalogue(user?.id);

  if (isLoading) {
    return <HubSkeleton variant="stats" count={4} />;
  }

  const publicTracks = tracks?.filter(t => t.is_public) || [];
  const forSaleTracks = tracks?.filter(t => t.is_for_sale) || [];
  const totalPlays = tracks?.reduce((sum, t) => sum + (t.play_count || 0), 0) || 0;

  const stats = [
    { label: 'Total Tracks', value: tracks?.length || 0, icon: Music, color: 'text-purple-400', accent: 'rgba(168, 85, 247, 0.15)' },
    { label: 'Public Releases', value: publicTracks.length, icon: TrendingUp, color: 'text-green-400', accent: 'rgba(34, 197, 94, 0.15)' },
    { label: 'For Sale', value: forSaleTracks.length, icon: DollarSign, color: 'text-yellow-400', accent: 'rgba(234, 179, 8, 0.15)' },
    { label: 'Total Plays', value: totalPlays.toLocaleString(), icon: Play, color: 'text-blue-400', accent: 'rgba(59, 130, 246, 0.15)' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <HubHeader
        icon={<Music className="w-5 h-5 text-purple-400" />}
        title="Music Hub"
        subtitle="Manage your music catalogue and releases"
        accent="rgba(168, 85, 247, 0.5)"
        action={
          <Button className="gap-2">
            <Upload className="w-4 h-4" />
            Upload Track
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <GlassPanel key={stat.label} padding="p-4" hoverable accent={stat.accent}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: stat.accent }}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </GlassPanel>
        ))}
      </div>

      {/* Catalogue */}
      {!tracks?.length ? (
        <GlassPanel>
          <EmptyState
            icon={Music}
            title="No tracks yet"
            description="Upload your first track to get started"
            cta={{ label: 'Upload Your First Track', onClick: () => { } }}
          />
        </GlassPanel>
      ) : (
        <MusicCatalogue />
      )}
    </div>
  );
};
