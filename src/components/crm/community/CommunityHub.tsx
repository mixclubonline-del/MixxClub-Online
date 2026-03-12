import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Users, MessageSquare, Trophy, Flame, Sparkles, Radio, Heart } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CommunityStats } from './CommunityStats';
import { SocialFeed } from './SocialFeed';
import { NetworkingSection } from './NetworkingSection';
import { CommunityLeaderboard } from './CommunityLeaderboard';
import { CommunityChallenges } from './CommunityChallenges';
import { ReferralWidget } from './ReferralWidget';
import { LiveFeed } from '@/components/live/LiveFeed';
import { WhoToFollowWidget } from '@/components/social/WhoToFollowWidget';
import { FanEngagementHub } from '@/components/community/FanEngagementHub';
import { ChallengesHub } from '@/components/community/ChallengesHub';

interface CommunityHubProps {
  userType: 'artist' | 'engineer';
}

export const CommunityHub: React.FC<CommunityHubProps> = ({ userType }) => {
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mixxclub Community</h1>
          <p className="text-muted-foreground">
            Connect with other {userType === 'artist' ? 'artists' : 'engineers'} and grow your network on Mixxclub
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search community..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <CommunityStats userType={userType} />
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-4">
              {isMobile ? (
                <Select value={activeTab} onValueChange={setActiveTab}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feed">Feed</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="challenges">Challenges</SelectItem>
                    <SelectItem value="leaderboard">Leaderboard</SelectItem>
                    <SelectItem value="fans">Fan Hub</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <TabsList>
                  <TabsTrigger value="feed" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Feed
                  </TabsTrigger>
                  <TabsTrigger value="live" className="flex items-center gap-2">
                    <Radio className="h-4 w-4" />
                    Live
                  </TabsTrigger>
                  <TabsTrigger value="networking" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Networking
                  </TabsTrigger>
                  <TabsTrigger value="challenges" className="flex items-center gap-2">
                    <Flame className="h-4 w-4" />
                    Challenges
                  </TabsTrigger>
                  <TabsTrigger value="leaderboard" className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Leaderboard
                  </TabsTrigger>
                </TabsList>
              )}
            </div>

            <TabsContent value="feed" className="mt-0">
              <SocialFeed userType={userType} searchQuery={searchQuery} />
            </TabsContent>
            
            <TabsContent value="live" className="mt-0">
              <LiveFeed />
            </TabsContent>
            
            <TabsContent value="networking" className="mt-0">
              <NetworkingSection searchQuery={searchQuery} userType={userType} />
            </TabsContent>
            
            <TabsContent value="challenges" className="mt-0">
              <CommunityChallenges />
            </TabsContent>
            
            <TabsContent value="leaderboard" className="mt-0">
              <CommunityLeaderboard userType={userType} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <ReferralWidget />
          <WhoToFollowWidget />
          
          <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-xl p-6 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-bold">Pro Tip</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Engaging with the community earns you XP and unlocks exclusive badges. Comment on 5 posts today to start a streak!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};