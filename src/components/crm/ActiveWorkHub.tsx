import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Flame, TrendingUp, Zap, Users, Sparkles, 
  Play, Upload, CheckCircle, Target, Award,
  Activity, Globe, Headphones, MessageSquare
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ActiveWorkHubProps {
  userRole: "client" | "engineer" | "admin";
  onStartSession?: () => void;
  onUploadStems?: () => void;
}

export const ActiveWorkHub = ({ userRole, onStartSession, onUploadStems }: ActiveWorkHubProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    level: 12,
    xp: 2450,
    xpToNext: 3000,
    streak: 7,
    weeklyProgress: 68
  });
  const [liveActivities, setLiveActivities] = useState<any[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState("");

  useEffect(() => {
    fetchLiveActivities();
    generateAiSuggestion();
  }, [user]);

  const fetchLiveActivities = async () => {
    const activities = [
      { user: "Sarah M.", action: "completed a mix", time: "2m ago", icon: "CheckCircle" },
      { user: "Tokyo Studio", action: "went live", time: "5m ago", icon: "Activity" },
      { user: "Mike R.", action: "uploaded stems", time: "8m ago", icon: "Upload" }
    ];
    setLiveActivities(activities);
  };

  const generateAiSuggestion = () => {
    const suggestions = [
      "Your vocals on 'Summer Dreams' need compression attention 🎵",
      "Ready to book your next session? Top engineers available now!",
      "Your project health score improved by 15% this week 📈",
      "3 new job matches found based on your style!"
    ];
    setAiSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)]);
  };

  const progressPercentage = (stats.xp / stats.xpToNext) * 100;

  return (
    <div className="space-y-8">
      {/* Compact Status Bar */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-xl border border-primary/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Level {stats.level}
            </span>
            {stats.streak >= 7 && (
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 animate-pulse-glow">
                <Flame className="w-3 h-3 mr-1" />
                {stats.streak} Day
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {stats.xp} / {stats.xpToNext} XP
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Weekly Progress</div>
          <div className="text-xl font-bold text-primary">{stats.weeklyProgress}%</div>
        </div>
      </div>

      {/* Smart Quick Actions Panel - Horizontal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          className="group relative overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border-purple-500/30"
          onClick={onStartSession}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative p-8">
            <Play className="w-10 h-10 mb-4 text-purple-400" />
            <h3 className="font-semibold text-lg mb-2">Start New Session</h3>
            <p className="text-sm text-muted-foreground">Go live with collaborators</p>
          </div>
        </Card>

        <Card 
          className="group relative overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30"
        >
          <div className="absolute top-2 right-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </div>
          <div className="relative p-8">
            <Users className="w-10 h-10 mb-4 text-orange-400" />
            <h3 className="font-semibold text-lg mb-2">Join Live Session</h3>
            <p className="text-sm text-muted-foreground">3 active sessions now</p>
          </div>
        </Card>

        <Card 
          className="group relative overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 bg-gradient-to-br from-blue-500/20 to-green-500/20 border-blue-500/30"
          onClick={onUploadStems}
        >
          <div className="relative p-8">
            <Upload className="w-10 h-10 mb-4 text-blue-400" />
            <h3 className="font-semibold text-lg mb-2">Upload Stems</h3>
            <p className="text-sm text-muted-foreground">Add new audio files</p>
          </div>
        </Card>

        <Card 
          className="group relative overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/30"
        >
          <div className="relative p-8">
            <CheckCircle className="w-10 h-10 mb-4 text-pink-400" />
            <h3 className="font-semibold text-lg mb-2">Review & Approve</h3>
            <p className="text-sm text-muted-foreground">2 pending reviews</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Activity Feed */}
        <Card className="lg:col-span-2 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-primary" />
              <h3 className="font-bold text-2xl">Live Activity</h3>
            </div>
            <Badge variant="outline" className="animate-pulse">
              <Globe className="w-3 h-3 mr-1" />
              Global
            </Badge>
          </div>

          <div className="space-y-4">
            {liveActivities.map((activity, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors animate-slide-up-fade"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  {activity.icon === "CheckCircle" && <CheckCircle className="w-5 h-5 text-white" />}
                  {activity.icon === "Activity" && <Activity className="w-5 h-5 text-white animate-pulse" />}
                  {activity.icon === "Upload" && <Upload className="w-5 h-5 text-white" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>

          <Button variant="ghost" className="w-full mt-4">
            View More Activity
          </Button>
        </Card>

        {/* AI Copilot Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-blue-500/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />
          <div className="relative p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <h3 className="font-semibold">AI Copilot</h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-background/50 backdrop-blur-sm">
                <p className="text-sm mb-3">{aiSuggestion}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Learn More
                  </Button>
                  <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500">
                    Apply Now
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Project Health</span>
                  <span className="font-medium text-green-500">Excellent</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-4/5 bg-gradient-to-r from-green-500 to-emerald-500" />
                </div>
              </div>

              <Button variant="ghost" className="w-full" onClick={generateAiSuggestion}>
                <Zap className="w-4 h-4 mr-2" />
                Get New Suggestion
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
