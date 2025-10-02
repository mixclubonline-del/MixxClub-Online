import { Mic2, Headphones, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export const ValueProposition = () => {
  const navigate = useNavigate();

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* For Artists */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Card className="relative overflow-hidden h-full glass-studio border-2 border-primary/30 hover:border-primary transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-700" />
          
          <div className="relative p-8 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Mic2 className="w-8 h-8 text-primary" />
            </div>

            <div>
              <h3 className="text-3xl font-black mb-2">For Artists</h3>
              <p className="text-lg text-muted-foreground">
                Your complete music creation journey
              </p>
            </div>

            <div className="space-y-4">
              {[
                { step: "Create", desc: "Record and upload your tracks" },
                { step: "Collaborate", desc: "Match with top engineers" },
                { step: "Compete", desc: "Join mix battles and tournaments" },
                { step: "Sell", desc: "Monetize in the marketplace" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm flex-shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{item.step}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Avg. Cost Savings</span>
                <span className="text-2xl font-bold text-success">70%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Project Turnaround</span>
                <span className="text-2xl font-bold text-primary">3-7 days</span>
              </div>
            </div>

            <Button 
              onClick={() => navigate('/auth?signup=artist')}
              size="lg" 
              className="w-full group"
            >
              Start as Artist
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* For Engineers */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="relative overflow-hidden h-full glass-studio border-2 border-accent-blue/30 hover:border-accent-blue transition-all duration-300 group">
          <div className="absolute top-0 left-0 w-64 h-64 bg-accent-blue/10 rounded-full blur-3xl -ml-32 -mt-32 group-hover:scale-150 transition-transform duration-700" />
          
          <div className="relative p-8 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-accent-blue/20 flex items-center justify-center">
              <Headphones className="w-8 h-8 text-accent-blue" />
            </div>

            <div>
              <h3 className="text-3xl font-black mb-2">For Engineers</h3>
              <p className="text-lg text-muted-foreground">
                Build your brand, grow your income
              </p>
            </div>

            <div className="space-y-4">
              {[
                { step: "Connect", desc: "Get matched with your ideal clients" },
                { step: "Earn", desc: "Keep 70% of every project" },
                { step: "Build", desc: "Grow your portfolio & reputation" },
                { step: "Scale", desc: "Unlock premium tools & features" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent-blue/20 text-accent-blue font-bold text-sm flex-shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{item.step}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Your Revenue Share</span>
                <span className="text-2xl font-bold text-success">70%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Avg. Monthly Income</span>
                <span className="text-2xl font-bold text-accent-blue">$2,500+</span>
              </div>
            </div>

            <Button 
              onClick={() => navigate('/for-engineers')}
              size="lg" 
              className="w-full group"
              variant="outline"
            >
              Join as Engineer
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
