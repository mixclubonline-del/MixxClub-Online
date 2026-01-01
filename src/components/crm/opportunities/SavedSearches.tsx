import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Bookmark, 
  Bell, 
  Trash2, 
  Search, 
  Plus,
  Clock,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SavedSearch {
  id: string;
  name: string;
  filters: {
    genres?: string[];
    budget?: string;
    location?: string;
  };
  alertsEnabled: boolean;
  matchCount: number;
  lastUpdated: string;
}

interface SavedSearchesProps {
  userRole: "artist" | "engineer";
}

export const SavedSearches = ({ userRole }: SavedSearchesProps) => {
  const { toast } = useToast();
  const [showAddNew, setShowAddNew] = useState(false);
  const [newSearchName, setNewSearchName] = useState("");

  // Mock saved searches - in production these would come from the database
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([
    {
      id: "1",
      name: "Hip Hop Mixing Jobs",
      filters: { genres: ["Hip Hop", "Trap"], budget: "$500+", location: "Remote" },
      alertsEnabled: true,
      matchCount: 12,
      lastUpdated: "2 hours ago"
    },
    {
      id: "2", 
      name: "High Budget Projects",
      filters: { budget: "$1000+", location: "Any" },
      alertsEnabled: false,
      matchCount: 5,
      lastUpdated: "1 day ago"
    }
  ]);

  const toggleAlerts = (id: string) => {
    setSavedSearches(prev => prev.map(search => 
      search.id === id 
        ? { ...search, alertsEnabled: !search.alertsEnabled }
        : search
    ));
    toast({
      title: "Alerts Updated",
      description: "Your notification preferences have been saved"
    });
  };

  const deleteSearch = (id: string) => {
    setSavedSearches(prev => prev.filter(search => search.id !== id));
    toast({
      title: "Search Deleted",
      description: "Your saved search has been removed"
    });
  };

  const addNewSearch = () => {
    if (!newSearchName.trim()) return;
    
    setSavedSearches(prev => [...prev, {
      id: Date.now().toString(),
      name: newSearchName,
      filters: {},
      alertsEnabled: false,
      matchCount: 0,
      lastUpdated: "Just now"
    }]);
    setNewSearchName("");
    setShowAddNew(false);
    toast({
      title: "Search Saved",
      description: "Your search has been saved successfully"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Saved Searches</h3>
          <p className="text-sm text-muted-foreground">
            Get notified when new opportunities match your criteria
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowAddNew(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Save Current Search
        </Button>
      </div>

      {/* Add New Search */}
      {showAddNew && (
        <Card className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Name your search..."
              value={newSearchName}
              onChange={(e) => setNewSearchName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={addNewSearch}>Save</Button>
            <Button variant="ghost" onClick={() => setShowAddNew(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Saved Searches List */}
      {savedSearches.length === 0 ? (
        <Card className="p-12 text-center">
          <Bookmark className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Saved Searches</h3>
          <p className="text-muted-foreground mb-4">
            Save your search filters to get notified about matching opportunities
          </p>
          <Button onClick={() => setShowAddNew(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Search
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {savedSearches.map((search) => (
            <Card key={search.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold">{search.name}</h4>
                    {search.matchCount > 0 && (
                      <Badge variant="secondary">
                        {search.matchCount} matches
                      </Badge>
                    )}
                  </div>
                  
                  {/* Filter Tags */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {search.filters.genres?.map(genre => (
                      <Badge key={genre} variant="outline" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                    {search.filters.budget && (
                      <Badge variant="outline" className="text-xs">
                        {search.filters.budget}
                      </Badge>
                    )}
                    {search.filters.location && (
                      <Badge variant="outline" className="text-xs">
                        {search.filters.location}
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Updated {search.lastUpdated}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={search.alertsEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleAlerts(search.id)}
                    className="gap-1"
                  >
                    <Bell className="w-4 h-4" />
                    {search.alertsEnabled ? "On" : "Off"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteSearch(search.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tips */}
      <Card className="p-4 bg-muted/50">
        <div className="flex items-start gap-3">
          <Filter className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium">Pro Tip</p>
            <p className="text-sm text-muted-foreground">
              Enable alerts on your saved searches to receive instant notifications 
              when new opportunities matching your criteria are posted.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
