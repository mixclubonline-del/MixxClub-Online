import { useState, useEffect } from 'react';
import { Music, TrendingUp, Star, Zap } from 'lucide-react';
import { Badge } from './ui/badge';

interface SuccessStory {
  artist: string;
  genre: string;
  improvement: string;
  timeAgo: string;
  rating: number;
}

export const RecentSuccesses = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const successes: SuccessStory[] = [
    { artist: "Sarah M.", genre: "Hip Hop", improvement: "+12dB clarity", timeAgo: "2 min ago", rating: 5 },
    { artist: "Mike R.", genre: "Rock", improvement: "+15dB punch", timeAgo: "5 min ago", rating: 5 },
    { artist: "Lisa K.", genre: "Pop", improvement: "+10dB warmth", timeAgo: "8 min ago", rating: 5 },
    { artist: "James P.", genre: "EDM", improvement: "+18dB power", timeAgo: "12 min ago", rating: 5 },
    { artist: "Emma T.", genre: "R&B", improvement: "+14dB depth", timeAgo: "15 min ago", rating: 5 },
    { artist: "Alex C.", genre: "Jazz", improvement: "+11dB clarity", timeAgo: "18 min ago", rating: 5 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % successes.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [successes.length]);

  return (
    <section className="py-16 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.05),transparent_70%)]" />
      
      <div className="container px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-studio border border-green-500/30 mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-green-500">LIVE ACTIVITY</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Tracks Being Mastered Right Now
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of artists getting professional results every day
            </p>
          </div>

          {/* Live Feed */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {successes.map((success, index) => (
              <div
                key={index}
                className={`glass-studio rounded-xl p-6 border transition-all duration-500 ${
                  index === currentIndex
                    ? 'border-primary/50 scale-105 shadow-glow'
                    : 'border-primary/20 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Music className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{success.artist}</p>
                      <p className="text-xs text-muted-foreground">{success.timeAgo}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-primary/30">
                    {success.genre}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-semibold text-green-500">
                      {success.improvement}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: success.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                </div>

                {index === currentIndex && (
                  <div className="mt-4 pt-4 border-t border-primary/20 animate-fade-in">
                    <div className="flex items-center gap-2 text-xs text-primary">
                      <Zap className="w-3 h-3 animate-pulse-glow" />
                      <span>Processing complete!</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Stats Bar */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 glass-studio rounded-xl border border-primary/20">
              <div className="text-3xl font-bold text-primary mb-1">847</div>
              <div className="text-sm text-muted-foreground">Tracks Today</div>
            </div>
            <div className="text-center p-4 glass-studio rounded-xl border border-primary/20">
              <div className="text-3xl font-bold text-primary mb-1">4.9★</div>
              <div className="text-sm text-muted-foreground">Avg Rating</div>
            </div>
            <div className="text-center p-4 glass-studio rounded-xl border border-primary/20">
              <div className="text-3xl font-bold text-primary mb-1">2.1s</div>
              <div className="text-sm text-muted-foreground">Avg Speed</div>
            </div>
            <div className="text-center p-4 glass-studio rounded-xl border border-primary/20">
              <div className="text-3xl font-bold text-primary mb-1">98%</div>
              <div className="text-sm text-muted-foreground">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};