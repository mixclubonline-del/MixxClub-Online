import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Flame, Target, Globe, TrendingUp, Clock, Award,
  Sparkles, Music, Users, Zap, Calendar, Bell
} from "lucide-react";

export const DashboardHub = () => {
  const [dailyQuests, setDailyQuests] = useState([
    { title: "Complete a mix", progress: 0, target: 1, xp: 50, icon: Music },
    { title: "Upload 3 stems", progress: 2, target: 3, xp: 30, icon: TrendingUp },
    { title: "Leave a review", progress: 0, target: 1, xp: 20, icon: Award }
  ]);

  const [recentActivity, setRecentActivity] = useState([
    { text: "New York Studio just went live", time: "1m ago", location: "🇺🇸" },
    { text: "Techno track hit 1000 plays", time: "5m ago", location: "🇩🇪" },
    { text: "3 engineers joined Mix Battles", time: "12m ago", location: "🌍" }
  ]);

  return (
    <div className="space-y-6 p-6">
      {/* Animated Hero Section */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-accent/20 to-background border-primary/30">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-3xl animate-pulse" />
        
        <div className="relative p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Welcome Back, Creator! 🎵
              </h1>
              <p className="text-muted-foreground text-lg">
                Ready to make some magic today?
              </p>
            </div>
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 text-lg animate-pulse-glow">
              <Flame className="w-5 h-5 mr-2" />
              7 Day Streak!
            </Badge>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-background/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">This Week</span>
              </div>
              <p className="text-2xl font-bold">12 Projects</p>
            </div>
            <div className="p-4 rounded-lg bg-background/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-muted-foreground">XP Earned</span>
              </div>
              <p className="text-2xl font-bold">2,450</p>
            </div>
            <div className="p-4 rounded-lg bg-background/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">Collaborations</span>
              </div>
              <p className="text-2xl font-bold">8 Active</p>
            </div>
            <div className="p-4 rounded-lg bg-background/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-muted-foreground">Achievements</span>
              </div>
              <p className="text-2xl font-bold">24/50</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Quests */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">Daily Quests</h2>
            <Badge variant="outline" className="ml-auto">
              <Clock className="w-3 h-3 mr-1" />
              Resets in 8h
            </Badge>
          </div>

          <div className="space-y-4">
            {dailyQuests.map((quest, index) => {
              const QuestIcon = quest.icon;
              const progressPercent = (quest.progress / quest.target) * 100;
              
              return (
                <div 
                  key={index}
                  className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors animate-slide-up-fade"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <QuestIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{quest.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {quest.progress} / {quest.target} complete
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                      <Zap className="w-3 h-3 mr-1" />
                      {quest.xp} XP
                    </Badge>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Live Activity Globe */}
        <Card className="p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-6">
              <Globe className="w-6 h-6 text-primary animate-pulse" />
              <h2 className="text-xl font-semibold">Live Activity</h2>
            </div>

            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div 
                  key={index}
                  className="p-3 rounded-lg bg-background/50 backdrop-blur-sm animate-slide-up-fade"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">{activity.location}</span>
                    <div className="flex-1">
                      <p className="text-sm">{activity.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="ghost" className="w-full mt-4">
              <Sparkles className="w-4 h-4 mr-2" />
              View Global Feed
            </Button>
          </div>
        </Card>
      </div>

      {/* Motivational Quote */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <div className="text-center">
          <Sparkles className="w-8 h-8 mx-auto mb-3 text-primary" />
          <blockquote className="text-lg font-medium italic mb-2">
            "Every great track starts with a single note. Keep creating!"
          </blockquote>
          <p className="text-sm text-muted-foreground">- The Mix Club Community</p>
        </div>
      </Card>
    </div>
  );
};
