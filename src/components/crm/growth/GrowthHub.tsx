import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Target, TrendingUp, BookOpen, Sparkles, Brain } from 'lucide-react';
import { GrowthStats } from './GrowthStats';
import { GoalTracker } from './GoalTracker';
import { SkillDevelopment } from './SkillDevelopment';
import { AICoachingInsights } from './AICoachingInsights';
import { CareerMilestones } from './CareerMilestones';

interface GrowthHubProps {
  userType: 'artist' | 'engineer';
}

export const GrowthHub: React.FC<GrowthHubProps> = ({ userType }) => {
  const [activeTab, setActiveTab] = useState('goals');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-emerald-500" />
            Growth Hub
          </h2>
          <p className="text-muted-foreground mt-1">
            {userType === 'artist' 
              ? 'Scale your music career with AI-powered insights' 
              : 'Advance your audio engineering career'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search goals & skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64 bg-background/50"
            />
          </div>
          <Button className="gap-2">
            <Target className="w-4 h-4" />
            New Goal
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <GrowthStats userType={userType} />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-background/50 border border-border/50 p-1">
          <TabsTrigger value="goals" className="gap-2 data-[state=active]:bg-primary/20">
            <Target className="w-4 h-4" />
            Goals
          </TabsTrigger>
          <TabsTrigger value="skills" className="gap-2 data-[state=active]:bg-primary/20">
            <BookOpen className="w-4 h-4" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="ai-coach" className="gap-2 data-[state=active]:bg-primary/20">
            <Brain className="w-4 h-4" />
            AI Coach
          </TabsTrigger>
          <TabsTrigger value="milestones" className="gap-2 data-[state=active]:bg-primary/20">
            <Sparkles className="w-4 h-4" />
            Milestones
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="goals" className="mt-0">
            <GoalTracker userType={userType} searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="skills" className="mt-0">
            <SkillDevelopment userType={userType} />
          </TabsContent>

          <TabsContent value="ai-coach" className="mt-0">
            <AICoachingInsights userType={userType} />
          </TabsContent>

          <TabsContent value="milestones" className="mt-0">
            <CareerMilestones userType={userType} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default GrowthHub;
