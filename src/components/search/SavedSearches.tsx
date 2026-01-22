import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSavedSearches, useSaveSearch, useDeleteSavedSearch } from '@/hooks/useSearch';
import { Save, Trash2, Star, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { CharacterEmptyState } from '@/components/characters/CharacterEmptyState';

export function SavedSearches() {
  const { data: searches, isLoading } = useSavedSearches();
  const saveSearch = useSaveSearch();
  const deleteSearch = useDeleteSavedSearch();
  const { toast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [newSearch, setNewSearch] = useState({
    search_name: '',
    search_type: 'global',
    search_query: '',
    is_favorite: false,
  });

  const handleSave = async () => {
    try {
      await saveSearch.mutateAsync(newSearch);
      toast({
        title: 'Search saved',
        description: 'Your search has been saved successfully',
      });
      setOpen(false);
      setNewSearch({
        search_name: '',
        search_type: 'global',
        search_query: '',
        is_favorite: false,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save search',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSearch.mutateAsync(id);
      toast({
        title: 'Search deleted',
        description: 'Your saved search has been removed',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete search',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Save className="w-6 h-6" />
          Saved Searches
        </h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Save New Search
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Search</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Search Name</Label>
                <Input
                  id="name"
                  placeholder="My Search"
                  value={newSearch.search_name}
                  onChange={(e) => setNewSearch({ ...newSearch, search_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="query">Search Query</Label>
                <Input
                  id="query"
                  placeholder="Enter search terms"
                  value={newSearch.search_query}
                  onChange={(e) => setNewSearch({ ...newSearch, search_query: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Search Type</Label>
                <Select
                  value={newSearch.search_type}
                  onValueChange={(value) => setNewSearch({ ...newSearch, search_type: value })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="profiles">Profiles</SelectItem>
                    <SelectItem value="projects">Projects</SelectItem>
                    <SelectItem value="jobs">Jobs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full" disabled={saveSearch.isPending}>
                {saveSearch.isPending ? 'Saving...' : 'Save Search'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!searches || searches.length === 0 ? (
        <CharacterEmptyState
          type="saved-items"
          title="No saved searches yet"
          actionLabel="Create Your First Search"
          onAction={() => setOpen(true)}
        />
      ) : (
        <div className="grid gap-4">
          {searches.map((search) => (
            <Card key={search.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {search.is_favorite && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                    <h3 className="font-semibold">{search.search_name}</h3>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {search.search_type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{search.search_query}</p>
                  <p className="text-xs text-muted-foreground">
                    Saved {new Date(search.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(search.id)}
                  disabled={deleteSearch.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
