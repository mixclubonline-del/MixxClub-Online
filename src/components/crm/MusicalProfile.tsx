import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Music, Save, X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface MusicalProfileData {
  id: string;
  user_id: string;
  primary_genre: string | null;
  secondary_genres: string[] | null;
  influences: string[] | null;
  instruments: string[] | null;
  production_style: string | null;
  preferred_bpm_min: number | null;
  preferred_bpm_max: number | null;
  vocal_range: string | null;
  years_experience: number | null;
  bio: string | null;
}

const GENRES = ['Hip-Hop', 'R&B', 'Pop', 'Rock', 'Electronic', 'Jazz', 'Classical', 'Country', 'Latin', 'Afrobeats', 'Dancehall', 'Trap', 'Lo-Fi', 'Indie'];
const INSTRUMENTS = ['Vocals', 'Guitar', 'Bass', 'Drums', 'Piano', 'Keyboard', 'Violin', 'Saxophone', 'Trumpet', 'Flute', 'DJ/Turntables', 'Beat Machine'];
const VOCAL_RANGES = ['Soprano', 'Mezzo-Soprano', 'Alto', 'Tenor', 'Baritone', 'Bass', 'N/A'];

export const MusicalProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newInfluence, setNewInfluence] = useState('');
  const [formData, setFormData] = useState<Partial<MusicalProfileData>>({
    primary_genre: '',
    secondary_genres: [],
    influences: [],
    instruments: [],
    production_style: '',
    preferred_bpm_min: 80,
    preferred_bpm_max: 140,
    vocal_range: '',
    years_experience: 0,
    bio: '',
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['musical-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('musical_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data as MusicalProfileData | null;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        primary_genre: profile.primary_genre || '',
        secondary_genres: profile.secondary_genres || [],
        influences: profile.influences || [],
        instruments: profile.instruments || [],
        production_style: profile.production_style || '',
        preferred_bpm_min: profile.preferred_bpm_min || 80,
        preferred_bpm_max: profile.preferred_bpm_max || 140,
        vocal_range: profile.vocal_range || '',
        years_experience: profile.years_experience || 0,
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const payload = {
        user_id: user.id,
        ...formData,
      };

      if (profile?.id) {
        const { error } = await supabase
          .from('musical_profiles')
          .update(payload)
          .eq('id', profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('musical_profiles')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['musical-profile'] });
      toast.success('Profile saved');
    },
    onError: () => toast.error('Failed to save profile'),
  });

  const toggleGenre = (genre: string) => {
    const current = formData.secondary_genres || [];
    if (current.includes(genre)) {
      setFormData({ ...formData, secondary_genres: current.filter(g => g !== genre) });
    } else if (current.length < 5) {
      setFormData({ ...formData, secondary_genres: [...current, genre] });
    }
  };

  const toggleInstrument = (instrument: string) => {
    const current = formData.instruments || [];
    if (current.includes(instrument)) {
      setFormData({ ...formData, instruments: current.filter(i => i !== instrument) });
    } else {
      setFormData({ ...formData, instruments: [...current, instrument] });
    }
  };

  const addInfluence = () => {
    if (newInfluence.trim() && !(formData.influences || []).includes(newInfluence.trim())) {
      setFormData({ ...formData, influences: [...(formData.influences || []), newInfluence.trim()] });
      setNewInfluence('');
    }
  };

  const removeInfluence = (influence: string) => {
    setFormData({ ...formData, influences: (formData.influences || []).filter(i => i !== influence) });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Musical Profile
        </CardTitle>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Genre */}
        <div className="space-y-2">
          <Label>Primary Genre</Label>
          <Select 
            value={formData.primary_genre || ''} 
            onValueChange={(v) => setFormData({ ...formData, primary_genre: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your main genre" />
            </SelectTrigger>
            <SelectContent>
              {GENRES.map(g => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Secondary Genres */}
        <div className="space-y-2">
          <Label>Secondary Genres (up to 5)</Label>
          <div className="flex flex-wrap gap-2">
            {GENRES.filter(g => g !== formData.primary_genre).map(genre => (
              <Badge
                key={genre}
                variant={(formData.secondary_genres || []).includes(genre) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleGenre(genre)}
              >
                {genre}
              </Badge>
            ))}
          </div>
        </div>

        {/* Influences */}
        <div className="space-y-2">
          <Label>Influences</Label>
          <div className="flex gap-2">
            <Input
              value={newInfluence}
              onChange={(e) => setNewInfluence(e.target.value)}
              placeholder="Add an influence..."
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInfluence())}
            />
            <Button variant="outline" size="icon" onClick={addInfluence}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(formData.influences || []).map(inf => (
              <Badge key={inf} variant="secondary" className="gap-1">
                {inf}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeInfluence(inf)} />
              </Badge>
            ))}
          </div>
        </div>

        {/* Instruments */}
        <div className="space-y-2">
          <Label>Instruments</Label>
          <div className="grid grid-cols-3 gap-2">
            {INSTRUMENTS.map(inst => (
              <Badge
                key={inst}
                variant={(formData.instruments || []).includes(inst) ? 'default' : 'outline'}
                className="cursor-pointer justify-center py-2"
                onClick={() => toggleInstrument(inst)}
              >
                {inst}
              </Badge>
            ))}
          </div>
        </div>

        {/* BPM Range */}
        <div className="space-y-2">
          <Label>Preferred BPM Range: {formData.preferred_bpm_min} - {formData.preferred_bpm_max}</Label>
          <div className="px-2">
            <Slider
              min={60}
              max={200}
              step={5}
              value={[formData.preferred_bpm_min || 80, formData.preferred_bpm_max || 140]}
              onValueChange={([min, max]) => setFormData({ ...formData, preferred_bpm_min: min, preferred_bpm_max: max })}
            />
          </div>
        </div>

        {/* Vocal Range & Experience */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Vocal Range</Label>
            <Select 
              value={formData.vocal_range || ''} 
              onValueChange={(v) => setFormData({ ...formData, vocal_range: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {VOCAL_RANGES.map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Years Experience</Label>
            <Input
              type="number"
              min={0}
              max={50}
              value={formData.years_experience || 0}
              onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        {/* Production Style */}
        <div className="space-y-2">
          <Label>Production Style</Label>
          <Input
            value={formData.production_style || ''}
            onChange={(e) => setFormData({ ...formData, production_style: e.target.value })}
            placeholder="e.g., Minimalist, Orchestral, Lo-Fi, Experimental..."
          />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label>Bio</Label>
          <Textarea
            value={formData.bio || ''}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell us about your musical journey..."
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
};
