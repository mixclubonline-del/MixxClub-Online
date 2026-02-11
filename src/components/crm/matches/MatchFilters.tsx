import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatchFiltersProps {
  filters: {
    minScore: number;
    genres: string[];
    specialties: string[];
    minRating: number;
    maxRate: number;
  };
  onChange: (filters: any) => void;
  userType: 'artist' | 'engineer' | 'producer';
}

const GENRES = ['Hip-Hop', 'R&B', 'Pop', 'EDM', 'Trap', 'Soul', 'Rock', 'Jazz', 'Latin', 'Afrobeat'];
const SPECIALTIES = ['Mixing', 'Mastering', 'Vocal Production', 'Beat Making', 'Sound Design', 'Recording', 'Arrangement'];

export const MatchFilters = ({ filters, onChange, userType }: MatchFiltersProps) => {
  const toggleGenre = (genre: string) => {
    const newGenres = filters.genres.includes(genre)
      ? filters.genres.filter(g => g !== genre)
      : [...filters.genres, genre];
    onChange({ ...filters, genres: newGenres });
  };

  const toggleSpecialty = (specialty: string) => {
    const newSpecialties = filters.specialties.includes(specialty)
      ? filters.specialties.filter(s => s !== specialty)
      : [...filters.specialties, specialty];
    onChange({ ...filters, specialties: newSpecialties });
  };

  const clearFilters = () => {
    onChange({
      minScore: 0,
      genres: [],
      specialties: [],
      minRating: 0,
      maxRate: 1000,
    });
  };

  const hasActiveFilters =
    filters.minScore > 0 ||
    filters.genres.length > 0 ||
    filters.specialties.length > 0 ||
    filters.minRating > 0 ||
    filters.maxRate < 1000;

  return (
    <Card className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Filter Matches</h4>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Match Score */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Minimum Match Score</Label>
          <span className="text-sm font-medium">{filters.minScore}%+</span>
        </div>
        <Slider
          value={[filters.minScore]}
          onValueChange={([value]) => onChange({ ...filters, minScore: value })}
          max={100}
          step={5}
        />
      </div>

      {/* Rating */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Minimum Rating</Label>
          <span className="text-sm font-medium">{filters.minRating > 0 ? `${filters.minRating}+ stars` : 'Any'}</span>
        </div>
        <Slider
          value={[filters.minRating]}
          onValueChange={([value]) => onChange({ ...filters, minRating: value })}
          max={5}
          step={0.5}
        />
      </div>

      {/* Max Rate */}
      {userType === 'artist' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Max Rate per Track</Label>
            <span className="text-sm font-medium">{filters.maxRate >= 1000 ? 'Any' : `$${filters.maxRate}`}</span>
          </div>
          <Slider
            value={[filters.maxRate]}
            onValueChange={([value]) => onChange({ ...filters, maxRate: value })}
            min={25}
            max={1000}
            step={25}
          />
        </div>
      )}

      {/* Genres */}
      <div className="space-y-3">
        <Label>Genres</Label>
        <div className="flex flex-wrap gap-2">
          {GENRES.map(genre => (
            <Badge
              key={genre}
              variant={filters.genres.includes(genre) ? 'default' : 'outline'}
              className={cn(
                "cursor-pointer transition-colors",
                filters.genres.includes(genre) && "bg-primary"
              )}
              onClick={() => toggleGenre(genre)}
            >
              {genre}
            </Badge>
          ))}
        </div>
      </div>

      {/* Specialties */}
      <div className="space-y-3">
        <Label>Specialties</Label>
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES.map(specialty => (
            <Badge
              key={specialty}
              variant={filters.specialties.includes(specialty) ? 'default' : 'outline'}
              className={cn(
                "cursor-pointer transition-colors",
                filters.specialties.includes(specialty) && "bg-primary"
              )}
              onClick={() => toggleSpecialty(specialty)}
            >
              {specialty}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
};
