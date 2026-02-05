import { useState } from 'react';
import { useCuratorProfile } from '@/hooks/useCuratorProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Headphones, 
  Sparkles, 
  Music,
  ArrowRight,
  Coins,
  CheckCircle2
} from 'lucide-react';

const GENRE_OPTIONS = [
  'Hip-Hop', 'R&B', 'Pop', 'Electronic', 'Rock', 'Jazz', 'Soul', 
  'Trap', 'Lo-Fi', 'Indie', 'Alternative', 'Latin', 'Afrobeats'
];

export const CuratorOnboarding = () => {
  const { createProfile, isCreating } = useCuratorProfile();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    curator_name: '',
    bio: '',
    genres: [] as string[],
    minimum_payment: 50,
  });

  const toggleGenre = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  const handleSubmit = async () => {
    await createProfile(formData);
  };

  return (
    <Card variant="glass" className="max-w-2xl mx-auto">
      <CardHeader className="text-center pb-2">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
          <Headphones className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Become a Curator</CardTitle>
        <CardDescription>
          Set up your curator profile and start earning from artist promotions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                s === step
                  ? 'bg-primary text-primary-foreground'
                  : s < step
                  ? 'bg-green-500 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {s < step ? <CheckCircle2 className="w-4 h-4" /> : s}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="curator_name">Curator Name</Label>
              <Input
                id="curator_name"
                placeholder="DJ Beats, The Playlist Guru, etc."
                value={formData.curator_name}
                onChange={(e) => setFormData(prev => ({ ...prev, curator_name: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                This is how artists will see you
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell artists about your curation style and what makes your playlists special..."
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={() => setStep(2)}
              disabled={!formData.curator_name.trim()}
            >
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 2: Genres */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Your Genres</Label>
              <p className="text-sm text-muted-foreground">
                Select the genres you specialize in (helps artists find you)
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {GENRE_OPTIONS.map((genre) => (
                <Badge
                  key={genre}
                  variant={formData.genres.includes(genre) ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all ${
                    formData.genres.includes(genre)
                      ? 'bg-primary hover:bg-primary/90'
                      : 'hover:bg-primary/20'
                  }`}
                  onClick={() => toggleGenre(genre)}
                >
                  <Music className="w-3 h-3 mr-1" />
                  {genre}
                </Badge>
              ))}
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)} 
                disabled={formData.genres.length === 0}
                className="flex-1"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Pricing */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="minimum_payment">Minimum Payment (MixxCoinz)</Label>
              <div className="relative">
                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                <Input
                  id="minimum_payment"
                  type="number"
                  min={10}
                  max={1000}
                  className="pl-10"
                  value={formData.minimum_payment}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    minimum_payment: parseInt(e.target.value) || 50 
                  }))}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Artists must pay at least this amount to request promotion
              </p>
            </div>

            <Card className="bg-muted/50 border-dashed">
              <CardContent className="pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform fee</span>
                  <span className="font-medium text-green-400">0%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">You keep</span>
                  <span className="font-medium">100% of payments</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isCreating}
                className="flex-1"
              >
                {isCreating ? 'Creating...' : 'Launch Curator Profile'}
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
