import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import { useGlobalPlayer } from '@/contexts/GlobalPlayerContext';
import { 
  Music, 
  ShoppingBag, 
  Play, 
  ExternalLink,
  Instagram,
  Twitter,
  Loader2,
  User
} from 'lucide-react';

export default function ArtistStorefront() {
  const { username } = useParams<{ username: string }>();
  const { play, addToQueue, currentTrack } = useGlobalPlayer();

  // Fetch storefront by username
  const { data: storefront, isLoading: storefrontLoading } = useQuery({
    queryKey: ['storefront', username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_storefronts')
        .select('*')
        .eq('storefront_slug', username)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!username
  });

  // Fetch user's public tracks
  const { data: tracks } = useQuery({
    queryKey: ['storefront-tracks', storefront?.user_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_tracks')
        .select('*')
        .eq('user_id', storefront?.user_id)
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!storefront?.user_id
  });

  // Fetch merch products
  const { data: products } = useQuery({
    queryKey: ['storefront-products', storefront?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('merch_products')
        .select('*')
        .eq('storefront_id', storefront?.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!storefront?.id
  });

  const handlePlayTrack = (track: any) => {
    play({
      id: track.id,
      title: track.title,
      artist: storefront?.display_name || 'Unknown Artist',
      audioUrl: track.audio_url,
      artworkUrl: track.artwork_url,
      duration: track.duration_seconds || 0
    });
  };

  const handlePlayAll = () => {
    if (tracks && tracks.length > 0) {
      handlePlayTrack(tracks[0]);
      tracks.slice(1).forEach(track => {
        addToQueue({
          id: track.id,
          title: track.title,
          artist: storefront?.display_name || 'Unknown Artist',
          audioUrl: track.audio_url,
          artworkUrl: track.artwork_url,
          duration: track.duration_seconds || 0
        });
      });
    }
  };

  const socialLinks = storefront?.social_links as Record<string, string> | null;

  if (storefrontLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!storefront) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container px-6 pt-24 pb-12 text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Store Not Found</h2>
          <p className="text-muted-foreground">
            This storefront doesn't exist or is not active.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Banner */}
      <div 
        className="relative h-64 md:h-80 bg-gradient-to-br from-primary/20 to-primary/5"
        style={storefront.banner_url ? {
          backgroundImage: `url(${storefront.banner_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : undefined}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      {/* Profile Section */}
      <div className="container px-6 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar */}
          <div 
            className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background bg-muted overflow-hidden"
            style={{ borderColor: storefront.theme_color }}
          >
            {storefront.logo_url ? (
              <img 
                src={storefront.logo_url} 
                alt={storefront.display_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 pt-4 md:pt-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{storefront.display_name}</h1>
            {storefront.bio && (
              <p className="text-muted-foreground max-w-2xl mb-4">{storefront.bio}</p>
            )}
            
            {/* Social Links */}
            {socialLinks && (
              <div className="flex gap-3">
                {socialLinks.instagram && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={`https://instagram.com/${socialLinks.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                      <Instagram className="w-4 h-4" />
                    </a>
                  </Button>
                )}
                {socialLinks.twitter && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={`https://twitter.com/${socialLinks.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                      <Twitter className="w-4 h-4" />
                    </a>
                  </Button>
                )}
                {socialLinks.spotify && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={socialLinks.spotify} target="_blank" rel="noopener noreferrer">
                      Spotify <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container px-6 py-12 space-y-12">
        {/* Music Section */}
        {tracks && tracks.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Music className="w-6 h-6 text-primary" />
                Music
              </h2>
              <Button onClick={handlePlayAll} variant="outline">
                <Play className="w-4 h-4 mr-2" />
                Play All
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {tracks.map((track) => (
                <Card 
                  key={track.id} 
                  className="group cursor-pointer overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all"
                  onClick={() => handlePlayTrack(track)}
                >
                  <div className="aspect-square bg-muted relative">
                    {track.artwork_url ? (
                      <img 
                        src={track.artwork_url} 
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                    {currentTrack?.id === track.id && (
                      <div className="absolute bottom-2 left-2">
                        <Badge className="bg-primary">Now Playing</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium truncate">{track.title}</h3>
                    {track.genre && (
                      <p className="text-xs text-muted-foreground">{track.genre}</p>
                    )}
                    {track.is_for_sale && track.price && (
                      <p className="text-sm font-bold text-primary mt-1">${Number(track.price).toFixed(2)}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Merch Section */}
        {products && products.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <ShoppingBag className="w-6 h-6 text-primary" />
              Merch
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="aspect-square bg-muted">
                    {product.thumbnail_url ? (
                      <img 
                        src={product.thumbnail_url} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium truncate">{product.name}</h3>
                    <p className="text-lg font-bold text-primary">${Number(product.price).toFixed(2)}</p>
                    <Badge variant="outline" className="mt-2">{product.category}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {(!tracks || tracks.length === 0) && (!products || products.length === 0) && (
          <Card className="p-12 text-center">
            <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground">
              This artist is setting up their store. Check back soon!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
