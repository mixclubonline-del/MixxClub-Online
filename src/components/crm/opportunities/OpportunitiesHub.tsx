import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Briefcase,
  Search,
  Filter,
  Sparkles,
  TrendingUp,
  Star,
  Clock,
  Bookmark,
  Bell,
  Grid3X3,
  List
} from "lucide-react";
import { OpportunityCard } from "./OpportunityCard";
import { OpportunityFilters } from "./OpportunityFilters";
import { SavedSearches } from "./SavedSearches";
import { RecommendedOpportunities } from "./RecommendedOpportunities";
import { OpportunityStats } from "./OpportunityStats";
import { useOpportunities, useMatchAnalytics } from "@/hooks/useOpportunities";
import { useIsMobile } from "@/hooks/use-mobile";
import { GlassPanel, HubHeader, HubSkeleton, EmptyState } from "../design";

interface OpportunitiesHubProps {
  userRole: "client" | "engineer";
}

export const OpportunitiesHub = ({ userRole }: OpportunitiesHubProps) => {
  const isMobile = useIsMobile();
  const mappedRole = userRole === 'client' ? 'artist' : 'engineer';

  const [activeTab, setActiveTab] = useState("discover");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    genres: [] as string[],
    budgetRange: [0, 5000] as [number, number],
    urgency: "all",
    location: "all",
    serviceType: "all",
    experienceLevel: "all"
  });

  const { data: opportunities = [], isLoading } = useOpportunities(mappedRole);
  const { data: analytics } = useMatchAnalytics(mappedRole);

  // Filter opportunities based on search and filters
  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = searchQuery === "" ||
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Categorize opportunities
  const aiRecommended = filteredOpportunities.filter(o => o.matchScore >= 85);
  const newOpportunities = filteredOpportunities.slice(0, 5);
  const urgentOpportunities = filteredOpportunities.filter(o => o.urgency === 'High');

  return (
    <div className="space-y-6">
      {/* Header */}
      <HubHeader
        icon={<Briefcase className="w-5 h-5 text-orange-400" />}
        title="Opportunities Hub"
        subtitle={mappedRole === 'engineer'
          ? 'Discover jobs that match your skills and style'
          : 'Find engineers for your next project'}
        accent="rgba(249, 115, 22, 0.5)"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 border-white/10">
              <Bell className="w-4 h-4" />
              Alerts
            </Button>
            <Button variant="outline" size="sm" className="gap-2 border-white/10">
              <Bookmark className="w-4 h-4" />
              Saved
            </Button>
          </div>
        }
      />

      {/* Stats Overview */}
      <OpportunityStats
        analytics={analytics}
        totalOpportunities={opportunities.length}
        aiMatches={aiRecommended.length}
      />

      {/* Search and Filters Bar */}
      <GlassPanel padding="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, artist, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 border-white/10"
            >
              <Filter className="w-4 h-4" />
              Filters
              {(filters.genres.length > 0 || filters.urgency !== "all") && (
                <Badge variant="secondary" className="ml-1">
                  {filters.genres.length + (filters.urgency !== "all" ? 1 : 0)}
                </Badge>
              )}
            </Button>

            {!isMobile && (
              <div className="flex items-center border border-white/10 rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-white/8">
            <OpportunityFilters
              filters={filters}
              onChange={setFilters}
              userRole={mappedRole}
            />
          </div>
        )}
      </GlassPanel>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="discover" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Discover
          </TabsTrigger>
          <TabsTrigger value="ai-matched" className="gap-2">
            <Star className="w-4 h-4" />
            AI Matched
            {aiRecommended.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {aiRecommended.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="new" className="gap-2">
            <Clock className="w-4 h-4" />
            New
          </TabsTrigger>
          <TabsTrigger value="urgent" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Urgent
            {urgentOpportunities.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {urgentOpportunities.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="saved" className="gap-2">
            <Bookmark className="w-4 h-4" />
            Saved
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="mt-6">
          {isLoading ? (
            <HubSkeleton variant="cards" count={6} />
          ) : filteredOpportunities.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No opportunities found"
              description="Try adjusting your filters or check back later"
            />
          ) : (
            <div className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-4"
            }>
              {filteredOpportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  userRole={mappedRole}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ai-matched" className="mt-6">
          <RecommendedOpportunities
            opportunities={aiRecommended}
            userRole={mappedRole}
            viewMode={viewMode}
          />
        </TabsContent>

        <TabsContent value="new" className="mt-6">
          {newOpportunities.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No new opportunities"
              description="Check back soon for fresh listings"
            />
          ) : (
            <div className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-4"
            }>
              {newOpportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  userRole={mappedRole}
                  viewMode={viewMode}
                  isNew
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="urgent" className="mt-6">
          {urgentOpportunities.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No urgent opportunities"
              description="All current listings have standard timelines"
            />
          ) : (
            <div className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-4"
            }>
              {urgentOpportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  userRole={mappedRole}
                  viewMode={viewMode}
                  isUrgent
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          <SavedSearches userRole={mappedRole} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
