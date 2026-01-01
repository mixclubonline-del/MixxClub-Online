import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

interface Filters {
  genres: string[];
  budgetRange: [number, number];
  urgency: string;
  location: string;
  serviceType: string;
  experienceLevel: string;
}

interface OpportunityFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  userRole: "artist" | "engineer";
}

const GENRES = [
  "Hip Hop", "R&B", "Pop", "Trap", "Drill", "Afrobeats", 
  "Latin", "Rock", "Electronic", "Jazz", "Soul", "Gospel"
];

const SERVICE_TYPES = [
  "Mixing", "Mastering", "Full Production", "Vocal Tuning", 
  "Beat Making", "Sound Design", "Post Production"
];

const EXPERIENCE_LEVELS = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Entry Level" },
  { value: "intermediate", label: "Intermediate" },
  { value: "experienced", label: "Experienced" },
  { value: "expert", label: "Expert" }
];

export const OpportunityFilters = ({ 
  filters, 
  onChange, 
  userRole 
}: OpportunityFiltersProps) => {
  
  const toggleGenre = (genre: string) => {
    const newGenres = filters.genres.includes(genre)
      ? filters.genres.filter(g => g !== genre)
      : [...filters.genres, genre];
    onChange({ ...filters, genres: newGenres });
  };

  const clearFilters = () => {
    onChange({
      genres: [],
      budgetRange: [0, 5000],
      urgency: "all",
      location: "all",
      serviceType: "all",
      experienceLevel: "all"
    });
  };

  const activeFilterCount = 
    filters.genres.length + 
    (filters.urgency !== "all" ? 1 : 0) +
    (filters.location !== "all" ? 1 : 0) +
    (filters.serviceType !== "all" ? 1 : 0) +
    (filters.experienceLevel !== "all" ? 1 : 0) +
    (filters.budgetRange[0] > 0 || filters.budgetRange[1] < 5000 ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
          </span>
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="w-3 h-3" />
            Clear all
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Genres */}
        <div className="space-y-2 md:col-span-2 lg:col-span-3">
          <Label>Genres</Label>
          <div className="flex flex-wrap gap-2">
            {GENRES.map(genre => (
              <Badge
                key={genre}
                variant={filters.genres.includes(genre) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/80 transition-colors"
                onClick={() => toggleGenre(genre)}
              >
                {genre}
              </Badge>
            ))}
          </div>
        </div>

        {/* Budget Range */}
        <div className="space-y-3">
          <Label>Budget Range</Label>
          <div className="px-2">
            <Slider
              value={filters.budgetRange}
              min={0}
              max={5000}
              step={100}
              onValueChange={(value) => 
                onChange({ ...filters, budgetRange: value as [number, number] })
              }
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>${filters.budgetRange[0]}</span>
              <span>${filters.budgetRange[1]}+</span>
            </div>
          </div>
        </div>

        {/* Service Type */}
        <div className="space-y-2">
          <Label>Service Type</Label>
          <Select
            value={filters.serviceType}
            onValueChange={(value) => onChange({ ...filters, serviceType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              {SERVICE_TYPES.map(type => (
                <SelectItem key={type} value={type.toLowerCase()}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Urgency */}
        <div className="space-y-2">
          <Label>Urgency</Label>
          <Select
            value={filters.urgency}
            onValueChange={(value) => onChange({ ...filters, urgency: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Priority</SelectItem>
              <SelectItem value="high">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  High Priority
                </span>
              </SelectItem>
              <SelectItem value="medium">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  Medium Priority
                </span>
              </SelectItem>
              <SelectItem value="low">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Low Priority
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label>Location</Label>
          <Select
            value={filters.location}
            onValueChange={(value) => onChange({ ...filters, location: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Location</SelectItem>
              <SelectItem value="remote">Remote Only</SelectItem>
              <SelectItem value="local">Local Only</SelectItem>
              <SelectItem value="us">United States</SelectItem>
              <SelectItem value="uk">United Kingdom</SelectItem>
              <SelectItem value="eu">Europe</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Experience Level */}
        <div className="space-y-2">
          <Label>Experience Level</Label>
          <Select
            value={filters.experienceLevel}
            onValueChange={(value) => onChange({ ...filters, experienceLevel: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              {EXPERIENCE_LEVELS.map(level => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
