import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { Lock, Users, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCommunityUnlockables } from "@/hooks/useUnlockables";
import { CommunityMilestoneTracker } from "@/components/CommunityMilestoneTracker";
import { Skeleton } from "@/components/ui/skeleton";

const ComingSoon = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  
  // Fetch live data from database
  const { data: communityMilestones, platformStats, isLoading } = useCommunityUnlockables();

  const currentUsers = platformStats?.userCount || 0;
  
  // Find next locked milestone
  const nextMilestone = communityMilestones.find(m => !m.is_unlocked);
  const nextTarget = nextMilestone?.target_value || 100;
  const progressToNext = nextMilestone 
    ? Math.min((currentUsers / nextMilestone.target_value) * 100, 100)
    : 100;

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Thanks! We'll notify you when features unlock.");
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      
      <main className="container mx-auto px-4 py-12">
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

        {/* Community Progress - Live Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          {isLoading ? (
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-4 w-48 mt-2" />
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Community Progress
                </CardTitle>
                <CardDescription>
                  We're at {currentUsers} members! 
                  {nextMilestone && ` Next milestone: ${nextMilestone.name} at ${nextMilestone.target_value} users`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={progressToNext} className="h-3" />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-muted-foreground">
                    {nextMilestone 
                      ? `${nextMilestone.target_value - currentUsers} more members needed`
                      : 'All milestones unlocked! 🎉'
                    }
                  </p>
                  {nextMilestone && nextMilestone.progress_percentage >= 80 && (
                    <Badge variant="default" className="animate-pulse">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Almost there!
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Community Milestone Tracker - Live Data from Database */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <CommunityMilestoneTracker />
        </motion.div>

        {/* Platform Stats Summary */}
        {!isLoading && platformStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
          >
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">{platformStats.userCount}</div>
                <p className="text-sm text-muted-foreground">Members</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">{platformStats.sessionCount}</div>
                <p className="text-sm text-muted-foreground">Sessions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">{platformStats.projectCount}</div>
                <p className="text-sm text-muted-foreground">Projects</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">{platformStats.beatsUploaded}</div>
                <p className="text-sm text-muted-foreground">Beats</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center p-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
        >
          <h2 className="text-3xl font-bold mb-4">Help Us Unlock These Features</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Every new member brings us closer to unlocking these powerful tools. Join MixxClub today and be part of the journey.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")}>
            Join MixxClub Now
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

export default ComingSoon;
