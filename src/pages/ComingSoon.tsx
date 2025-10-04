import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import { FEATURE_FLAGS } from "@/config/featureFlags";
import { Lock, Users, Sparkles, GraduationCap, ShoppingBag, Plug, Brain, Disc, BarChart3, Music, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const featureData = [
...
];

const ComingSoon = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const currentUsers = 42;

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Thanks! We'll notify you when features unlock.");
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="mb-4">
            <Lock className="w-3 h-3 mr-1" />
            Coming Soon
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Unlock the Future of Music Production
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            As our community grows, we unlock powerful new features. Join now to help us reach these milestones faster.
          </p>
          
          {/* Email Signup */}
          <form onSubmit={handleNotifyMe} className="max-w-md mx-auto flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit">Notify Me</Button>
          </form>
        </motion.div>

        {/* Community Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Community Progress
              </CardTitle>
              <CardDescription>
                We're at {currentUsers} members! Next milestone: 100 users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={(currentUsers / 100) * 100} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                {100 - currentUsers} more members needed to unlock Tier 1 features
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Feature Tiers */}
        <div className="space-y-12">
          {featureData.map((tier, tierIndex) => (
            <motion.div
              key={tier.tier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + tierIndex * 0.1 }}
            >
              <div className="mb-6">
                <Badge variant="outline" className="mb-2">
                  Tier {tier.tier} • {tier.milestone} Users
                </Badge>
                <h2 className="text-3xl font-bold">{tier.title}</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {tier.features.map((feature) => {
                  const Icon = feature.icon;
                  const isEnabled = FEATURE_FLAGS[feature.flag];
                  
                  return (
                    <Card key={feature.name} className={isEnabled ? "border-primary" : ""}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Icon className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-xl">{feature.name}</CardTitle>
                            </div>
                          </div>
                          {isEnabled ? (
                            <Badge variant="default">Live</Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Lock className="w-3 h-3 mr-1" />
                              Locked
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          ))}

          {/* Distribution Hub Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="mb-6">
              <Badge variant="outline" className="mb-2">
                Distribution Hub Expansion
              </Badge>
              <h2 className="text-3xl font-bold">Advanced Distribution Features</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {distributionFeatures.map((feature) => {
                const Icon = feature.icon;
                const isEnabled = FEATURE_FLAGS[feature.flag];
                
                return (
                  <Card key={feature.name} className={isEnabled ? "border-primary" : ""}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{feature.name}</CardTitle>
                          </div>
                        </div>
                        {isEnabled ? (
                          <Badge variant="default">Live</Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Lock className="w-3 h-3 mr-1" />
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-16 p-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
        >
          <h2 className="text-3xl font-bold mb-4">Help Us Unlock These Features</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Every new member brings us closer to unlocking these powerful tools. Join MixClub today and be part of the journey.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")}>
            Join MixClub Now
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

export default ComingSoon;
