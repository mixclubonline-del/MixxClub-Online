import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Music, TrendingUp, Zap, ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FEATURE_FLAGS } from "@/config/featureFlags";

export const AISessionPrepShowcase = () => {
  const navigate = useNavigate();

  if (!FEATURE_FLAGS.AI_SESSION_PREP_SHOWCASE) {
    return null;
  }

  const analysisExample = {
    genre: "Hip-Hop / Trap",
    key: "F# Minor",
    tempo: "140 BPM",
    confidence: 94,
    suggestions: [
      { icon: TrendingUp, text: "Boost low-end presence for modern trap sound", confidence: 92 },
      { icon: Zap, text: "Apply parallel compression to drum bus", confidence: 88 },
      { icon: Music, text: "Add subtle sidechain to bass for clarity", confidence: 85 }
    ]
  };

  return (
    <section className="min-h-screen flex items-center py-16 md:py-20 relative overflow-hidden">

      <div className="container px-4 md:px-6 relative z-10">
        <div className="text-center mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="glass-morphic backdrop-blur-xl border-primary/30 gap-2 px-5 py-2 text-base mb-6">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              AI-Powered Session Prep
            </Badge>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              Engineers Know Your Track
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Before The Session
              </span>
            </h2>
            <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed">
              Our AI analyzes your music instantly, giving engineers the insights they need to deliver perfect mixes faster
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-center">
          {/* AI Analysis Demo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glass-morphic-strong backdrop-blur-xl border-primary/30 p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">AI Analysis Complete</h3>
                  <p className="text-sm text-muted-foreground">Analyzed in 2.3 seconds</p>
                </div>
                <Badge className="ml-auto bg-success">
                  {analysisExample.confidence}% Match
                </Badge>
              </div>

              {/* Musical DNA */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">Detected Genre</span>
                  <span className="font-semibold">{analysisExample.genre}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Key</span>
                    <span className="font-semibold">{analysisExample.key}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Tempo</span>
                    <span className="font-semibold">{analysisExample.tempo}</span>
                  </div>
                </div>
              </div>

              {/* AI Suggestions */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Smart Mixing Suggestions
                </h4>
                {analysisExample.suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-transparent border border-primary/10"
                  >
                    <suggestion.icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm">{suggestion.text}</p>
                      <span className="text-xs text-muted-foreground">
                        {suggestion.confidence}% confidence
                      </span>
                    </div>
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Benefits List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold mb-6">Why Engineers Love It</h3>
            
            {[
              {
                title: "Instant Musical DNA",
                description: "Genre, key, tempo, and mood detected before the session starts",
                icon: Music
              },
              {
                title: "Smart Suggestions",
                description: "AI recommends mixing techniques based on your track's characteristics",
                icon: Sparkles
              },
              {
                title: "Faster Turnaround",
                description: "Engineers spend less time analyzing, more time mixing your music",
                icon: Zap
              },
              {
                title: "Better Results",
                description: "Data-driven insights lead to mixes that hit industry standards",
                icon: TrendingUp
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4"
              >
                <div className="p-3 rounded-xl bg-primary/10 h-fit">
                  <benefit.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{benefit.title}</h4>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </motion.div>
            ))}

            <Button 
              size="lg" 
              className="w-full mt-6 shadow-glow bg-gradient-to-r from-primary to-accent hover:opacity-90"
              onClick={() => navigate("/auth?signup=true")}
            >
              Try AI Session Prep Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-6 p-6 rounded-2xl bg-muted/30 border border-primary/10">
            <div className="text-left">
              <p className="text-2xl font-bold">10,000+</p>
              <p className="text-sm text-muted-foreground">Tracks Analyzed</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-left">
              <p className="text-2xl font-bold">2.3s</p>
              <p className="text-sm text-muted-foreground">Avg Analysis Time</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-left">
              <p className="text-2xl font-bold">94%</p>
              <p className="text-sm text-muted-foreground">Accuracy Rate</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};