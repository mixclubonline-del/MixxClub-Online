import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, ExternalLink, Eye, Heart, Share2, Plus } from 'lucide-react';

interface PortfolioShowcaseProps {
  userType: 'artist' | 'engineer';
  searchQuery: string;
}

export const PortfolioShowcase: React.FC<PortfolioShowcaseProps> = ({ userType, searchQuery }) => {
  const [playingId, setPlayingId] = React.useState<string | null>(null);

  const portfolioItems = [
    {
      id: '1',
      title: 'Summer Vibes',
      artist: 'Zara "VelvetVox" Johnson',
      genre: 'R&B',
      releaseDate: '2024-01-15',
      thumbnail: '/placeholder.svg',
      plays: 12500,
      likes: 847,
      isFeatured: true,
      role: userType === 'engineer' ? 'Mixing & Mastering' : 'Artist',
    },
    {
      id: '2',
      title: 'Midnight Dreams',
      artist: 'DeShawn "FlowMaster" Davis',
      genre: 'Hip-Hop',
      releaseDate: '2024-01-08',
      thumbnail: '/placeholder.svg',
      plays: 8900,
      likes: 623,
      isFeatured: false,
      role: userType === 'engineer' ? 'Vocal Production' : 'Artist',
    },
    {
      id: '3',
      title: 'Street Anthem',
      artist: 'Jordan "BeatDrop" Smith',
      genre: 'Drill',
      releaseDate: '2023-12-20',
      thumbnail: '/placeholder.svg',
      plays: 45200,
      likes: 2341,
      isFeatured: true,
      role: userType === 'engineer' ? 'Mix Engineer' : 'Artist',
    },
    {
      id: '4',
      title: 'Cloud Nine',
      artist: 'Crystal "Melodic" Waters',
      genre: 'Trap',
      releaseDate: '2023-12-15',
      thumbnail: '/placeholder.svg',
      plays: 6700,
      likes: 412,
      isFeatured: false,
      role: userType === 'engineer' ? 'Mastering' : 'Artist',
    },
  ];

  const filteredItems = portfolioItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredItems.length} items in your portfolio
        </p>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add to Portfolio
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <Card key={item.id} className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden group">
            <div className="relative aspect-video bg-muted">
              <img 
                src={item.thumbnail} 
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button 
                  size="icon" 
                  variant="secondary"
                  className="h-12 w-12 rounded-full"
                  onClick={() => setPlayingId(playingId === item.id ? null : item.id)}
                >
                  {playingId === item.id ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6 ml-1" />
                  )}
                </Button>
              </div>
              {item.isFeatured && (
                <Badge className="absolute top-2 left-2 bg-primary">Featured</Badge>
              )}
            </div>
            
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-foreground">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.artist}</p>
                </div>
                <Badge variant="outline" className="text-xs">{item.genre}</Badge>
              </div>
              
              <p className="text-xs text-muted-foreground mb-3">
                {item.role} • {new Date(item.releaseDate).toLocaleDateString()}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {formatNumber(item.plays)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {formatNumber(item.likes)}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
