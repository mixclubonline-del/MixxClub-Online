import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Search, User, FolderKanban, Briefcase, Clock, TrendingUp } from 'lucide-react';
import { useGlobalSearch, useRecordSearch, useSearchHistory, usePopularSearches } from '@/hooks/useSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

export function GlobalSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  const { data: results, isLoading } = useGlobalSearch(debouncedQuery);
  const { data: history } = useSearchHistory(5);
  const { data: popular } = usePopularSearches();
  const recordSearch = useRecordSearch();

  useEffect(() => {
    if (results && results.length > 0 && debouncedQuery) {
      recordSearch.mutate({
        search_query: debouncedQuery,
        search_type: 'global',
        results_count: results.length,
      });
    }
  }, [results, debouncedQuery]);

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'profile':
        return <User className="w-4 h-4" />;
      case 'project':
        return <FolderKanban className="w-4 h-4" />;
      case 'job':
        return <Briefcase className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getResultTypeBadge = (type: string) => {
    const colors = {
      profile: 'bg-blue-500/10 text-blue-500',
      project: 'bg-green-500/10 text-green-500',
      job: 'bg-purple-500/10 text-purple-500',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500/10 text-gray-500';
  };

  const showSuggestions = !searchQuery && (history?.length || popular?.length);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search profiles, projects, jobs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 text-lg"
        />
      </div>

      {/* Search Suggestions */}
      {showSuggestions && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Recent Searches */}
          {history && history.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Recent Searches</h3>
              </div>
              <div className="space-y-2">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSearchQuery(item.search_query)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                  >
                    {item.search_query}
                    <span className="text-xs text-muted-foreground ml-2">
                      ({item.results_count} results)
                    </span>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Popular Searches */}
          {popular && popular.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Trending Searches</h3>
              </div>
              <div className="space-y-2">
                {popular.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSearchQuery(item.search_query)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                  >
                    {item.search_query}
                    <span className="text-xs text-muted-foreground ml-2">
                      ({item.search_count} searches)
                    </span>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && debouncedQuery && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </Card>
          ))}
        </div>
      )}

      {/* Search Results */}
      {!isLoading && results && results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground px-1">
            Found {results.length} results for "{debouncedQuery}"
          </p>
          {results.map((result) => (
            <Card key={result.result_id} className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex items-start gap-3">
                <div className={cn(
                  'p-2 rounded-lg',
                  getResultTypeBadge(result.result_type)
                )}>
                  {getResultIcon(result.result_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{result.result_title}</h3>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {result.result_type}
                    </Badge>
                  </div>
                  {result.result_description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {result.result_description}
                    </p>
                  )}
                  {result.result_metadata && Object.keys(result.result_metadata).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(result.result_metadata).map(([key, value]) => (
                        <span key={key} className="text-xs text-muted-foreground">
                          {key}: {String(value)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {(result.relevance * 100).toFixed(0)}% match
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {!isLoading && debouncedQuery && results?.length === 0 && (
        <Card className="p-8 text-center">
          <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">No results found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search terms or browse our categories
          </p>
        </Card>
      )}
    </div>
  );
}
