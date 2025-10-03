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
    <div className="space-y-8">
      {/* Compact Stats Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 animate-pulse-glow">
            <Flame className="w-4 h-4 mr-1.5" />
            7 Day Streak!
          </Badge>
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">2,450 XP</span> earned this week
          </div>
        </div>
      </div>

      {/* Quick Stats - Horizontal */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-green-500" />
            <span className="text-sm text-muted-foreground">This Week</span>
          </div>
          <p className="text-3xl font-bold">12 Projects</p>
        </Card>
        <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            <span className="text-sm text-muted-foreground">XP Earned</span>
          </div>
          <p className="text-3xl font-bold">2,450</p>
        </Card>
        <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-blue-500" />
            <span className="text-sm text-muted-foreground">Collaborations</span>
          </div>
          <p className="text-3xl font-bold">8 Active</p>
        </Card>
        <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-6 h-6 text-purple-500" />
            <span className="text-sm text-muted-foreground">Achievements</span>
          </div>
          <p className="text-3xl font-bold">24/50</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Quests */}
        <Card className="lg:col-span-2 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-7 h-7 text-primary" />
            <h2 className="text-2xl font-bold">Daily Quests</h2>
            <Badge variant="outline" className="ml-auto">
              <Clock className="w-3 h-3 mr-1" />
              Resets in 8h
            </Badge>
          </div>

            <div className="space-y-5">
              {dailyQuests.map((quest, index) => {
                const QuestIcon = quest.icon;
                const progressPercent = (quest.progress / quest.target) * 100;
                
                return (
                  <div 
                    key={index}
                    className="p-5 rounded-xl bg-muted/50 hover:bg-muted transition-all duration-300 hover:scale-[1.02] animate-slide-up-fade"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <QuestIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{quest.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {quest.progress} / {quest.target} complete
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 px-3 py-1.5">
                        <Zap className="w-4 h-4 mr-1" />
                        {quest.xp} XP
                      </Badge>
                    </div>
                    <Progress value={progressPercent} className="h-3" />
                  </div>
                );
              })}
            </div>
        </Card>

        {/* Live Activity Globe */}
        <Card className="p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-7 h-7 text-primary animate-pulse" />
              <h2 className="text-2xl font-bold">Live Activity</h2>
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
