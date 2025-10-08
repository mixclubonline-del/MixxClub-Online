import { Helmet } from 'react-helmet-async';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Music, Headphones, Trophy, TrendingUp, 
  Clock, Users, Heart, MessageCircle,
  Sparkles, Award, Activity
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import { motion } from 'framer-motion';

export default function Feed() {
  const featuredArtist = {
    name: "Maya Rivers",
    genre: "Electronic / Ambient",
    bio: "Creating soundscapes that blur the lines between digital and organic",
    image: "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?w=400",
    followers: 12400,
    tracks: 45
  };

  const featuredEngineer = {
    name: "Alex Chen",
    specialty: "Mix Engineer",
    bio: "10+ years crafting radio-ready mixes for indie and electronic artists",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400",
    projects: 234,
    rating: 4.9
  };

  const featuredSong = {
    title: "Midnight Drive",
    artist: "Luna Park",
    plays: 45200,
    likes: 3400,
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400"
  };

  const featuredMix = {
    title: "Synthwave Sunset (Radio Mix)",
    engineer: "Marcus Stone",
    genre: "Synthwave",
    image: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=400",
    likes: 2100
  };

  const recentActivity = [
    { user: "Sarah K.", action: "uploaded a new track", time: "2m ago", icon: Music },
    { user: "DJ Nova", action: "completed a mix", time: "15m ago", icon: Headphones },
    { user: "Beat Maker Pro", action: "won a battle", time: "1h ago", icon: Trophy },
    { user: "Vinyl Dreams", action: "reached 10k followers", time: "2h ago", icon: TrendingUp },
  ];

  return (
    <>
      <Helmet>
        <title>Community Feed — Mixxclub</title>
        <meta 
          name="description" 
          content="Stay connected with the Mixxclub community. Discover trending music, featured artists and engineers, and the latest activity." 
        />
      </Helmet>

      <main className="min-h-screen bg-gradient-to-b from-background via-[hsl(265_50%_10%)] to-background">
        <GlobalHeader />
        
        <div className="container mx-auto px-4 pt-24 pb-12">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-blue))] mb-4">
              Community Feed
            </h1>
            <p className="text-muted-foreground text-lg">
              Discover the best of Mixxclub — artists, engineers, and music making waves
            </p>
          </motion.div>

          {/* Featured Content Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Artist of the Week */}
            <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Artist of the Week</h2>
              </div>
              <div className="flex gap-4">
                <img 
                  src={featuredArtist.image} 
                  alt={featuredArtist.name}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{featuredArtist.name}</h3>
                  <Badge variant="secondary" className="mb-2">{featuredArtist.genre}</Badge>
                  <p className="text-sm text-muted-foreground mb-3">{featuredArtist.bio}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {featuredArtist.followers.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Music className="w-4 h-4" />
                      {featuredArtist.tracks} tracks
                    </span>
                  </div>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline">
                View Profile
              </Button>
            </Card>

            {/* Engineer of the Week */}
            <Card className="p-6 bg-card/50 backdrop-blur border-accent-blue/20">
              <div className="flex items-center gap-2 mb-4">
                <Headphones className="w-5 h-5 text-accent-blue" />
                <h2 className="text-xl font-bold">Engineer of the Week</h2>
              </div>
              <div className="flex gap-4">
                <img 
                  src={featuredEngineer.image} 
                  alt={featuredEngineer.name}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{featuredEngineer.name}</h3>
                  <Badge variant="secondary" className="mb-2">{featuredEngineer.specialty}</Badge>
                  <p className="text-sm text-muted-foreground mb-3">{featuredEngineer.bio}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      {featuredEngineer.projects} projects
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      {featuredEngineer.rating} rating
                    </span>
                  </div>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline">
                View Profile
              </Button>
            </Card>
          </div>

          {/* Trending Content */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Song of the Week */}
            <Card className="p-6 bg-card/50 backdrop-blur">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Song of the Week</h2>
              </div>
              <div className="flex gap-4">
                <img 
                  src={featuredSong.image} 
                  alt={featuredSong.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-bold mb-1">{featuredSong.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{featuredSong.artist}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Music className="w-4 h-4" />
                      {featuredSong.plays.toLocaleString()} plays
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {featuredSong.likes.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <Button className="w-full mt-4" size="sm">
                Listen Now
              </Button>
            </Card>

            {/* Mix of the Week */}
            <Card className="p-6 bg-card/50 backdrop-blur">
              <div className="flex items-center gap-2 mb-4">
                <Headphones className="w-5 h-5 text-accent-blue" />
                <h2 className="text-xl font-bold">Mix of the Week</h2>
              </div>
              <div className="flex gap-4">
                <img 
                  src={featuredMix.image} 
                  alt={featuredMix.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-bold mb-1">{featuredMix.title}</h3>
                  <p className="text-sm text-muted-foreground mb-1">by {featuredMix.engineer}</p>
                  <Badge variant="outline" className="mb-2">{featuredMix.genre}</Badge>
                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {featuredMix.likes.toLocaleString()} likes
                    </span>
                  </div>
                </div>
              </div>
              <Button className="w-full mt-4" size="sm">
                Listen Now
              </Button>
            </Card>
          </div>

          {/* Recent Activity Feed */}
          <Card className="p-6 bg-card/50 backdrop-blur">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">{activity.user}</span>{' '}
                        <span className="text-muted-foreground">{activity.action}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <Button variant="outline" className="w-full mt-6">
              View All Activity
            </Button>
          </Card>

          {/* CTA Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent-blue/10 border-primary/20">
              <h2 className="text-2xl font-bold mb-3">Ready to join the community?</h2>
              <p className="text-muted-foreground mb-6">
                Sign up now and start collaborating with artists and engineers worldwide
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-primary to-accent-blue">
                  Get Started
                </Button>
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>
    </>
  );
}
