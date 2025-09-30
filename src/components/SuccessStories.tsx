import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Play, Award, TrendingUp } from "lucide-react";

interface SuccessStory {
  id: string;
  artistName: string;
  engineerName: string;
  trackTitle: string;
  genre: string;
  achievement: string;
  description: string;
  beforeAfterAudio?: {
    before: string;
    after: string;
  };
  stats: {
    streams?: string;
    chartPosition?: string;
    improvement?: string;
  };
  testimonial: string;
  artistAvatar: string;
  engineerAvatar: string;
  completedDate: string;
}

const successStories: SuccessStory[] = [
  {
    id: "1",
    artistName: "Maya Chen",
    engineerName: "Alex Rodriguez",
    trackTitle: "Midnight Dreams",
    genre: "Electronic Pop",
    achievement: "2M+ Spotify Streams",
    description: "Transformed a bedroom recording into a chart-ready hit through AI-enhanced mixing and mastering",
    stats: {
      streams: "2.1M",
      chartPosition: "#3 on Indie Charts",
      improvement: "300% louder, crystal clear"
    },
    testimonial: "Alex took my rough demo and turned it into something I never imagined possible. The AI tools helped us iterate so quickly!",
    artistAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maya",
    engineerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    completedDate: "2024-01-15"
  },
  {
    id: "2",
    artistName: "Jordan Beats",
    engineerName: "Samantha Kim",
    trackTitle: "Urban Nights",
    genre: "Hip Hop",
    achievement: "Featured on Spotify Editorial",
    description: "Real-time collaboration brought this track from concept to editorial playlist in just 2 weeks",
    stats: {
      streams: "850K",
      chartPosition: "Spotify Editorial Pick",
      improvement: "Professional radio quality"
    },
    testimonial: "The collaboration workspace was game-changing. Sam and I worked together like we were in the same studio.",
    artistAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jordan",
    engineerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=samantha",
    completedDate: "2024-02-08"
  },
  {
    id: "3",
    artistName: "The Velvet Sound",
    engineerName: "Marcus Thompson",
    trackTitle: "Golden Hour",
    genre: "Indie Rock",
    achievement: "500K+ TikTok Uses",
    description: "AI stem separation allowed perfect balance of vintage and modern elements",
    stats: {
      streams: "1.2M",
      chartPosition: "Viral on TikTok",
      improvement: "Perfect vintage warmth"
    },
    testimonial: "Marcus understood exactly what we wanted. The AI analysis helped identify the perfect sonic signature.",
    artistAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=velvet",
    engineerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcus",
    completedDate: "2024-01-28"
  }
];

export const SuccessStories = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-primary/5">
      <div className="container px-6">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Award className="w-6 h-6 text-primary" />
            <Badge variant="outline" className="text-primary border-primary/30">
              Success Stories
            </Badge>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Real Artists, Real Results
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how our AI-powered collaboration platform transformed these tracks from demos to hits
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {successStories.map((story) => (
            <Card key={story.id} className="group hover:shadow-xl transition-all duration-300 border-primary/20 hover:border-primary/40 bg-card/50 backdrop-blur-sm">
              <div className="p-6 space-y-4">
                {/* Header with Achievement */}
                <div className="flex items-start justify-between">
                  <Badge className="bg-primary/10 text-primary border-primary/30">
                    {story.achievement}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <Star className="w-4 h-4 fill-primary text-primary" />
                  </div>
                </div>

                {/* Track Info */}
                <div>
                  <h3 className="font-bold text-lg">{story.trackTitle}</h3>
                  <p className="text-muted-foreground text-sm">{story.genre}</p>
                  <p className="text-sm mt-2">{story.description}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-2 p-3 bg-primary/5 rounded-lg">
                  {story.stats.streams && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Streams</span>
                      <span className="font-semibold text-primary">{story.stats.streams}</span>
                    </div>
                  )}
                  {story.stats.chartPosition && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Achievement</span>
                      <span className="font-semibold text-primary">{story.stats.chartPosition}</span>
                    </div>
                  )}
                  {story.stats.improvement && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Quality</span>
                      <span className="font-semibold text-primary">{story.stats.improvement}</span>
                    </div>
                  )}
                </div>

                {/* Testimonial */}
                <blockquote className="text-sm italic text-muted-foreground border-l-2 border-primary/30 pl-3">
                  "{story.testimonial}"
                </blockquote>

                {/* Collaboration Team */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={story.artistAvatar} />
                      <AvatarFallback>{story.artistName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-xs">
                      <div className="font-medium">{story.artistName}</div>
                      <div className="text-muted-foreground">Artist</div>
                    </div>
                  </div>
                  
                  <div className="w-px h-8 bg-border" />
                  
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={story.engineerAvatar} />
                      <AvatarFallback>{story.engineerName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-xs">
                      <div className="font-medium">{story.engineerName}</div>
                      <div className="text-muted-foreground">Engineer</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="flex items-center justify-center gap-4 text-muted-foreground">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm">Join 2,500+ artists and engineers creating hits together</span>
          </div>
        </div>
      </div>
    </section>
  );
};