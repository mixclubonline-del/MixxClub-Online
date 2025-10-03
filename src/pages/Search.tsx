import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { SavedSearches } from '@/components/search/SavedSearches';
import { Search as SearchIcon, Save, History } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useSearchHistory, useClearSearchHistory } from '@/hooks/useSearch';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function Search() {
  const { data: history, isLoading } = useSearchHistory(20);
  const clearHistory = useClearSearchHistory();
  const { toast } = useToast();

  const handleClearHistory = async () => {
    try {
      await clearHistory.mutateAsync();
      toast({
        title: 'History cleared',
        description: 'Your search history has been cleared',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear history',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Search</h1>
        <p className="text-muted-foreground">
          Find profiles, projects, jobs, and more across the platform
        </p>
      </div>

      <Tabs defaultValue="search" className="w-full">
        <TabsList>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <SearchIcon className="w-4 h-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Saved Searches
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="mt-6">
          <GlobalSearch />
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          <SavedSearches />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <History className="w-6 h-6" />
                Search History
              </h2>
              {history && history.length > 0 && (
                <Button 
                  variant="outline" 
                  onClick={handleClearHistory}
                  disabled={clearHistory.isPending}
                >
                  Clear History
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </Card>
                ))}
              </div>
            ) : !history || history.length === 0 ? (
              <Card className="p-8 text-center">
                <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No search history</h3>
                <p className="text-sm text-muted-foreground">
                  Your recent searches will appear here
                </p>
              </Card>
            ) : (
              <div className="grid gap-2">
                {history.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.search_query}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.results_count} results · {new Date(item.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground capitalize px-2 py-1 bg-muted rounded">
                        {item.search_type}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
