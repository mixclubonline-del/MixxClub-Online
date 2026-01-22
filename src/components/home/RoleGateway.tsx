import { motion } from "framer-motion";
import { ArrowRight, Sparkles, DollarSign, Users, Headphones, Sliders } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useCommunityStats } from "@/hooks/useCommunityStats";
import { getCharacter, getRandomQuote } from "@/config/characters";

export function RoleGateway() {
  const [hoveredRole, setHoveredRole] = useState<"artist" | "engineer" | null>(null);
  const { data: stats } = useCommunityStats();
  
  const jax = getCharacter('jax');
  const rell = getCharacter('rell');
  
  // Calculate average earnings per engineer
  const avgEarnings = stats?.totalEngineers && stats.totalEngineers > 0 
    ? Math.round(stats.totalEarnings / stats.totalEngineers) 
    : 4200;

  const artistBenefits = [
    { icon: Sparkles, text: "AI-powered engineer matching" },
    { icon: Headphones, text: "Professional mixing & mastering" },
    { icon: Users, text: "Real-time collaboration sessions" },
  ];

  const engineerBenefits = [
    { icon: DollarSign, text: "10 revenue streams to earn from" },
    { icon: Users, text: "Automatic client pipeline" },
    { icon: Sliders, text: "Pro tools, zero overhead" },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.08),transparent_60%)]" />
      
      <div className="container px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Path
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Whether you're creating music or crafting sound, MixClub has your journey mapped out.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Artist Path - Jax */}
          <motion.div
            onMouseEnter={() => setHoveredRole("artist")}
            onMouseLeave={() => setHoveredRole(null)}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`p-8 h-full border-2 transition-all duration-300 ${
              hoveredRole === "artist" 
                ? "border-[hsl(142_76%_36%)] bg-[hsl(142_76%_36%_/_0.05)] shadow-lg shadow-[hsl(142_76%_36%_/_0.15)]" 
                : "border-border/50 bg-card/50"
            }`}>
              {/* Jax Portrait Header */}
              <div className="flex items-center gap-4 mb-6">
                <motion.div 
                  className={`relative w-16 h-16 rounded-2xl overflow-hidden transition-all ${
                    hoveredRole === "artist" 
                      ? "shadow-[0_0_25px_hsl(142_76%_36%_/_0.4)]" 
                      : ""
                  }`}
                  animate={{ 
                    scale: hoveredRole === "artist" ? 1.05 : 1 
                  }}
                >
                  <img 
                    src={jax.avatarPath} 
                    alt={jax.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Accent ring on hover */}
                  <div 
                    className={`absolute inset-0 border-2 rounded-2xl transition-opacity ${
                      hoveredRole === "artist" ? "opacity-100" : "opacity-0"
                    }`}
                    style={{ borderColor: jax.accentColor }}
                  />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold">I'm an Artist</h3>
                  <p className="text-muted-foreground">Creator, Musician, Producer</p>
                </div>
              </div>

              {/* Jax Quote */}
              <motion.div 
                className="mb-6 p-3 rounded-lg bg-[hsl(142_76%_36%_/_0.08)] border border-[hsl(142_76%_36%_/_0.2)]"
                animate={{ 
                  opacity: hoveredRole === "artist" ? 1 : 0.8 
                }}
              >
                <p className="text-sm text-muted-foreground italic">
                  <span className="font-semibold" style={{ color: jax.accentColor }}>
                    {jax.name}:
                  </span>{" "}
                  "{jax.sampleQuotes[0]}"
                </p>
              </motion.div>

              <p className="text-lg mb-6 text-muted-foreground">
                Turn your bedroom beats into billboard bangers with professional mixing, AI analysis, and access to world-class engineers.
              </p>

              <div className="space-y-3 mb-8">
                {artistBenefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: hoveredRole === "artist" ? 1 : 0.7, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[hsl(142_76%_36%_/_0.15)] flex items-center justify-center">
                      <benefit.icon className="w-4 h-4 text-[hsl(142_76%_36%)]" />
                    </div>
                    <span className="text-sm">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>

              <Link to="/for-artists">
                <Button 
                  className="w-full group bg-[hsl(142_76%_36%)] hover:bg-[hsl(142_76%_30%)]" 
                  size="lg"
                >
                  Start as Artist
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <div className="mt-4 text-center">
                <Badge variant="outline" className="text-xs border-[hsl(142_76%_36%_/_0.3)]">
                  🎵 {stats?.totalArtists?.toLocaleString() || '10,000'}+ artists trust MixClub
                </Badge>
              </div>
            </Card>
          </motion.div>

          {/* Engineer Path - Rell */}
          <motion.div
            onMouseEnter={() => setHoveredRole("engineer")}
            onMouseLeave={() => setHoveredRole(null)}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`p-8 h-full border-2 transition-all duration-300 ${
              hoveredRole === "engineer" 
                ? "border-secondary bg-secondary/5 shadow-lg shadow-secondary/10" 
                : "border-border/50 bg-card/50"
            }`}>
              {/* Rell Portrait Header */}
              <div className="flex items-center gap-4 mb-6">
                <motion.div 
                  className={`relative w-16 h-16 rounded-2xl overflow-hidden transition-all ${
                    hoveredRole === "engineer" 
                      ? "shadow-[0_0_25px_hsl(var(--secondary)_/_0.4)]" 
                      : ""
                  }`}
                  animate={{ 
                    scale: hoveredRole === "engineer" ? 1.05 : 1 
                  }}
                >
                  <img 
                    src={rell.avatarPath} 
                    alt={rell.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Accent ring on hover */}
                  <div 
                    className={`absolute inset-0 border-2 rounded-2xl transition-opacity border-secondary ${
                      hoveredRole === "engineer" ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold">I'm an Engineer</h3>
                  <p className="text-muted-foreground">Mixer, Producer, Audio Pro</p>
                </div>
              </div>

              {/* Rell Quote */}
              <motion.div 
                className="mb-6 p-3 rounded-lg bg-secondary/10 border border-secondary/20"
                animate={{ 
                  opacity: hoveredRole === "engineer" ? 1 : 0.8 
                }}
              >
                <p className="text-sm text-muted-foreground italic">
                  <span className="font-semibold text-secondary">
                    {rell.name}:
                  </span>{" "}
                  "{rell.sampleQuotes[0]}"
                </p>
              </motion.div>

              <p className="text-lg mb-6 text-muted-foreground">
                Transform your skills into a thriving business. Get matched with artists, access pro tools, and earn from 10 revenue streams.
              </p>

              <div className="space-y-3 mb-8">
                {engineerBenefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: hoveredRole === "engineer" ? 1 : 0.7, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <benefit.icon className="w-4 h-4 text-secondary" />
                    </div>
                    <span className="text-sm">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>

              <Link to="/for-engineers">
                <Button className="w-full group bg-secondary hover:bg-secondary/90" size="lg">
                  Start as Engineer
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <div className="mt-4 text-center">
                <Badge variant="outline" className="text-xs border-secondary/30">
                  💰 Engineers earn avg. ${avgEarnings.toLocaleString()}/month
                </Badge>
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Not sure yet?</p>
          <Link to="/showcase">
            <Button variant="outline" size="lg">
              <Sparkles className="w-4 h-4 mr-2" />
              See The Technology First
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
