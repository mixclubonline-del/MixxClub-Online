import React, { useState } from 'react';
import { useMusicCatalogue, UserTrack } from '@/hooks/useMusicCatalogue';
import { useGlobalPlayer, Track } from '@/contexts/GlobalPlayerContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Play, Pause, Music2, Loader2, Search, Grid3X3, List, 
  MoreHorizontal, Pencil, Trash2, Eye, EyeOff, DollarSign,
  Upload, PlayCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CharacterEmptyState } from '@/components/characters/CharacterEmptyState';

interface MusicCatalogueProps {
  userId?: string;
  isOwner?: boolean;
  onAddTrack?: () => void;
}

export const MusicCatalogue: React.FC<MusicCatalogueProps> = ({
  userId,
  isOwner = true,
  onAddTrack,
}) => {
  const { tracks, isLoading, updateTrack, deleteTrack } = useMusicCatalogue(userId);
  const { play, addToQueue, currentTrack, isPlaying, playPlaylist } = useGlobalPlayer();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.genre?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'public') return matchesSearch && track.is_public;
    if (activeTab === 'private') return matchesSearch && !track.is_public;
    if (activeTab === 'for-sale') return matchesSearch && track.is_for_sale;
    return matchesSearch;
  });

  const handlePlayTrack = (track: UserTrack) => {
    const playerTrack: Track = {
      id: track.id,
      title: track.title,
      artist: 'You',
      artistId: track.user_id,
      audioUrl: track.audio_url,
      artworkUrl: track.artwork_url,
      duration: track.duration_seconds || 0,
      genre: track.genre,
    };
    play(playerTrack);
  };

  const handlePlayAll = () => {
    const playerTracks: Track[] = filteredTracks.map(track => ({
      id: track.id,
      title: track.title,
      artist: 'You',
      artistId: track.user_id,
      audioUrl: track.audio_url,
      artworkUrl: track.artwork_url,
      duration: track.duration_seconds || 0,
      genre: track.genre,
    }));
    playPlaylist(playerTracks);
  };

  const handleToggleVisibility = (track: UserTrack) => {
    updateTrack({ id: track.id, is_public: !track.is_public });
  };

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Music Catalogue</h2>
          <p className="text-muted-foreground">{tracks.length} tracks</p>
        </div>
        
        <div className="flex items-center gap-2">
          {isOwner && (
            <Button onClick={onAddTrack} className="gap-2">
              <Upload className="w-4 h-4" />
              Add Track
            </Button>
          )}
          
          {filteredTracks.length > 0 && (
            <Button variant="outline" onClick={handlePlayAll} className="gap-2">
              <PlayCircle className="w-4 h-4" />
              Play All
            </Button>
          )}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">All ({tracks.length})</TabsTrigger>
            <TabsTrigger value="public">
              Public ({tracks.filter(t => t.is_public).length})
            </TabsTrigger>
            <TabsTrigger value="private">
              Private ({tracks.filter(t => !t.is_public).length})
            </TabsTrigger>
            <TabsTrigger value="for-sale">
              For Sale ({tracks.filter(t => t.is_for_sale).length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tracks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="rounded-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="rounded-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Empty State - Nova integration */}
      {filteredTracks.length === 0 && (
        <CharacterEmptyState
          type={searchQuery ? 'search' : 'tracks'}
          title={searchQuery ? 'No tracks found' : 'Your catalogue is empty'}
          actionLabel={isOwner && !searchQuery ? 'Add Your First Track' : undefined}
          onAction={isOwner && !searchQuery ? onAddTrack : undefined}
        />
      )}

      {/* Grid View */}
      {viewMode === 'grid' && filteredTracks.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredTracks.map((track, index) => {
            const isCurrentTrack = currentTrack?.id === track.id;
            const isTrackPlaying = isCurrentTrack && isPlaying;

            return (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className="group overflow-hidden">
                  <div 
                    className="relative aspect-square bg-gradient-to-br from-primary/20 to-primary/5 cursor-pointer"
                    onClick={() => handlePlayTrack(track)}
                  >
                    {track.artwork_url ? (
                      <img 
                        src={track.artwork_url} 
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music2 className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                    )}
                    
                    {/* Play overlay */}
                    <div className={cn(
                      "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity",
                      isTrackPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    )}>
                      <Button
                        size="icon"
                        className="w-12 h-12 rounded-full bg-primary text-primary-foreground"
                      >
                        {isTrackPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5 ml-0.5" />
                        )}
                      </Button>
                    </div>

                    {/* Status badges */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {!track.is_public && (
                        <Badge variant="secondary" className="text-xs">
                          <EyeOff className="w-3 h-3 mr-1" />
                          Private
                        </Badge>
                      )}
                      {track.is_for_sale && (
                        <Badge className="text-xs bg-green-500">
                          <DollarSign className="w-3 h-3 mr-1" />
                          ${track.price}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-sm truncate">{track.title}</h3>
                        {track.genre && (
                          <p className="text-xs text-muted-foreground">{track.genre}</p>
                        )}
                      </div>
                      
                      {isOwner && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleVisibility(track)}>
                              {track.is_public ? (
                                <>
                                  <EyeOff className="w-4 h-4 mr-2" />
                                  Make Private
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Make Public
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => deleteTrack(track.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>{track.play_count} plays</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && filteredTracks.length > 0 && (
        <Card>
          <div className="divide-y divide-border">
            {filteredTracks.map((track, index) => {
              const isCurrentTrack = currentTrack?.id === track.id;
              const isTrackPlaying = isCurrentTrack && isPlaying;

              return (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors"
                >
                  <div 
                    className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0 cursor-pointer"
                    onClick={() => handlePlayTrack(track)}
                  >
                    {track.artwork_url ? (
                      <img 
                        src={track.artwork_url} 
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                        <Music2 className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    
                    <div className={cn(
                      "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity",
                      isTrackPlaying ? 'opacity-100' : 'opacity-0 hover:opacity-100'
                    )}>
                      {isTrackPlaying ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{track.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {track.genre && <span>{track.genre}</span>}
                      <span>•</span>
                      <span>{track.play_count} plays</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!track.is_public && (
                      <Badge variant="secondary">Private</Badge>
                    )}
                    {track.is_for_sale && (
                      <Badge className="bg-green-500">${track.price}</Badge>
                    )}
                    
                    {isOwner && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleVisibility(track)}>
                            {track.is_public ? (
                              <>
                                <EyeOff className="w-4 h-4 mr-2" />
                                Make Private
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-2" />
                                Make Public
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => deleteTrack(track.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default MusicCatalogue;
