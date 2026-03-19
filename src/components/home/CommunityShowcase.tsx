import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Users, TrendingUp, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FEATURE_FLAGS } from "@/config/featureFlags";
import { usePageContent } from '@/hooks/usePageContent';

export const CommunityShowcase = () => {
  const { content: sectionTitle } = usePageContent('home', 'community_title');
  const { content: sectionSubtitle } = usePageContent('home', 'community_subtitle');
  const navigate = useNavigate();

  if (!FEATURE_FLAGS.MIX_BATTLES_ARENA_ENABLED) {
    return null;
  }

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="container px-6 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Join the Community</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            {sectionTitle}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {sectionSubtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Mix Battles Card */}
          <Card className="relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-8 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Mix Battles</h3>
              <p className="text-muted-foreground mb-6">
                Compete in monthly mix challenges and song battles. Win cash prizes and get recognized by the community.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="font-semibold">$1,200/mo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>170+ battles</span>
                  </div>
                </div>
                <Button onClick={() => navigate("/mix-battles")} variant="ghost" className="group-hover:bg-primary group-hover:text-primary-foreground">
                  Enter Battle
                </Button>
              </div>
            </div>
          </Card>

          {/* Leaderboards Card */}
          <Card className="relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-background to-background opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-8 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Leaderboards</h3>
              <p className="text-muted-foreground mb-6">
                Climb the ranks with every completed project. Top engineers get featured placement and premium perks.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="font-semibold">Top 100</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>5K+ ranked</span>
                  </div>
                </div>
                <Button onClick={() => navigate("/leaderboard")} variant="ghost" className="group-hover:bg-accent group-hover:text-accent-foreground">
                  View Ranks
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button onClick={() => navigate("/auth?signup=true")} size="lg" className="shadow-glow">
            <Users className="h-5 w-5 mr-2" />
            Join the Community
          </Button>
        </div>
      </div>
    </section>
  );
};
