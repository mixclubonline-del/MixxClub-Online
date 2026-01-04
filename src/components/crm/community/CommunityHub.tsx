import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Users, MessageSquare, Trophy, Flame, Sparkles, Radio } from 'lucide-react';
import { CommunityStats } from './CommunityStats';
import { SocialFeed } from './SocialFeed';
import { NetworkingSection } from './NetworkingSection';
import { CommunityLeaderboard } from './CommunityLeaderboard';
import { CommunityChallenges } from './CommunityChallenges';
import { ReferralWidget } from './ReferralWidget';
import { LiveFeed } from '@/components/live/LiveFeed';
import { WhoToFollowWidget } from '@/components/social/WhoToFollowWidget';

interface CommunityHubProps {
  userType: 'artist' | 'engineer';
}

export const CommunityHub: React.FC<CommunityHubProps> = ({ userType }) => {
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Flame className="w-8 h-8 text-orange-500" />
            Community Hub
          </h2>
          <p className="text-muted-foreground mt-1">
            Connect, share, and grow with the MixClub community
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search community..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64 bg-background/50"
            />
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Post
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <CommunityStats userType={userType} />

      {/* Live Now Section */}
      <LiveFeed limit={3} showHeader={true} compact={false} />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-background/50 border border-border/50 p-1">
          <TabsTrigger value="feed" className="gap-2 data-[state=active]:bg-primary/20">
            <MessageSquare className="w-4 h-4" />
            Feed
          </TabsTrigger>
          <TabsTrigger value="live" className="gap-2 data-[state=active]:bg-destructive/20">
            <Radio className="w-4 h-4" />
            Live
          </TabsTrigger>
          <TabsTrigger value="network" className="gap-2 data-[state=active]:bg-primary/20">
            <Users className="w-4 h-4" />
            Network
          </TabsTrigger>
          <TabsTrigger value="challenges" className="gap-2 data-[state=active]:bg-primary/20">
            <Sparkles className="w-4 h-4" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="gap-2 data-[state=active]:bg-primary/20">
            <Trophy className="w-4 h-4" />
            Leaderboard
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="feed" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SocialFeed userType={userType} searchQuery={searchQuery} />
              </div>
              <div className="space-y-6">
                <WhoToFollowWidget limit={5} />
                <ReferralWidget />
                <CommunityChallenges compact />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="live" className="mt-0">
            <LiveFeed limit={12} showHeader={false} />
          </TabsContent>

          <TabsContent value="network" className="mt-0">
            <NetworkingSection userType={userType} searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="challenges" className="mt-0">
            <CommunityChallenges />
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-0">
            <CommunityLeaderboard userType={userType} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default CommunityHub;
