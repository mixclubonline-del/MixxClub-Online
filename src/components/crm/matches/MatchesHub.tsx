import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, Filter } from 'lucide-react';
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
  const [filters, setFilters] = useState({
    minScore: 0,
    genres: [] as string[],
    specialties: [] as string[],
    minRating: 0,
    maxRate: 1000,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Match Discovery
          </h2>
          <p className="text-muted-foreground">
            {userType === 'artist' 
              ? 'Find the perfect engineer for your sound'
              : 'Discover artists looking for your skills'}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={userType === 'artist' ? 'Search engineers...' : 'Search artists...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <MatchStats userType={userType} />

      {showFilters && <MatchFilters userType={userType} filters={filters} onChange={setFilters} />}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
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
    </div>
  );
};
