import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, Filter } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { GlassPanel, HubHeader } from '../design';
import { MatchStats } from './MatchStats';
import { AIMatchRecommendations } from './AIMatchRecommendations';
import { MatchRequests } from './MatchRequests';
import { SavedMatches } from './SavedMatches';
import { MatchFilters } from './MatchFilters';

interface MatchesHubProps {
  userType: 'artist' | 'engineer';
}

export const MatchesHub: React.FC<MatchesHubProps> = ({ userType }) => {
  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const isMobile = useIsMobile();
  const [filters, setFilters] = useState({
    minScore: 0,
    genres: [] as string[],
    specialties: [] as string[],
    minRating: 0,
    maxRate: 1000,
  });

  return (
    <div className="space-y-6">
      <HubHeader
        icon={<Sparkles className="h-5 w-5 text-primary" />}
        title="AI Match Discovery"
        subtitle={userType === 'artist'
          ? 'Find the perfect engineer for your sound'
          : 'Discover artists looking for your skills'}
        accent="rgba(168, 85, 247, 0.5)"
        action={
          <div className="flex gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={userType === 'artist' ? 'Search engineers...' : 'Search artists...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10"
              />
            </div>
            <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)} className="border-white/10">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <MatchStats userType={userType} />

      {showFilters && <MatchFilters userType={userType} filters={filters} onChange={setFilters} />}

      <GlassPanel padding="p-5" glow accent="rgba(168, 85, 247, 0.3)">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid w-full bg-white/5 border border-white/8 ${isMobile ? 'grid-cols-1 gap-1' : 'grid-cols-3'}`}>
            <TabsTrigger value="discover">AI Recommendations</TabsTrigger>
            <TabsTrigger value="requests">Match Requests</TabsTrigger>
            <TabsTrigger value="saved">Saved Matches</TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="mt-6">
            <AIMatchRecommendations userType={userType} searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            <MatchRequests userType={userType} />
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            <SavedMatches userType={userType} searchQuery={searchQuery} />
          </TabsContent>
        </Tabs>
      </GlassPanel>
    </div>
  );
};
