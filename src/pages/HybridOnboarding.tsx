import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Mic2, Headphones, Sparkles, CheckCircle2 } from "lucide-react";

const STEPS = [
  { id: 1, title: "Choose Primary Role", description: "Which role will you use most?" },
  { id: 2, title: "Artist Profile", description: "Set up your creative identity" },
  { id: 3, title: "Engineer Profile", description: "Showcase your technical skills" },
  { id: 4, title: "Preferences", description: "Customize your experience" },
  { id: 5, title: "Complete", description: "You're all set!" },
];

export default function HybridOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [primaryRole, setPrimaryRole] = useState<'client' | 'engineer'>('client');
  const [artistName, setArtistName] = useState("");
  const [artistBio, setArtistBio] = useState("");
  const [genres, setGenres] = useState("");
  const [engineerName, setEngineerName] = useState("");
  const [engineerBio, setEngineerBio] = useState("");
  const [specializations, setSpecializations] = useState("");
  const [mixingRate, setMixingRate] = useState("");
  const [defaultDashboard, setDefaultDashboard] = useState<'artist' | 'engineer' | 'unified'>('unified');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Create hybrid user preference
      await supabase.from('hybrid_user_preferences').upsert({
        user_id: user.id,
        primary_role: primaryRole,
        default_dashboard: defaultDashboard,
        show_role_switcher: true,
      });

      // Update onboarding profile
      await supabase.from('onboarding_profiles').upsert({
        user_id: user.id,
        user_type: primaryRole,
        is_hybrid_user: true,
        secondary_user_type: primaryRole === 'client' ? 'engineer' : 'client',
        stage_name: artistName,
        bio: artistBio,
        genres: genres.split(',').map(g => g.trim()),
      });

      // Create artist profile
      await supabase.from('profiles').update({
        full_name: artistName,
        role: primaryRole,
      }).eq('id', user.id);

      // Create engineer profile
      await supabase.from('engineer_profiles').upsert({
        user_id: user.id,
        stage_name: engineerName,
        bio: engineerBio,
        specializations: specializations.split(',').map(s => s.trim()),
        mixing_rate: parseFloat(mixingRate) || 0,
      });

      // Insert both roles into user_roles
      await supabase.from('user_roles').insert([
        { user_id: user.id, role: 'client' },
        { user_id: user.id, role: 'engineer' },
      ]);

      toast({
        title: "Welcome to MixClub! 🎉",
        description: "Your hybrid account is ready. You can switch between roles anytime.",
      });

      // Navigate to unified dashboard
      navigate('/artist-crm');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <CardTitle className="text-2xl">Hybrid Creator Setup</CardTitle>
            </div>
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {STEPS.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {STEPS[currentStep - 1].description}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Choose Primary Role */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <Label>Which role will you use most often?</Label>
              <RadioGroup value={primaryRole} onValueChange={(v) => setPrimaryRole(v as 'client' | 'engineer')}>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value="client" id="artist" />
                  <Label htmlFor="artist" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Mic2 className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold">Artist</p>
                      <p className="text-sm text-muted-foreground">Focus on creating music</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value="engineer" id="engineer" />
                  <Label htmlFor="engineer" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Headphones className="w-5 h-5 text-accent-blue" />
                    <div>
                      <p className="font-semibold">Engineer</p>
                      <p className="text-sm text-muted-foreground">Focus on mixing & mastering</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 2: Artist Profile */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="artistName">Artist/Stage Name</Label>
                <Input
                  id="artistName"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  placeholder="Your creative name"
                />
              </div>
              <div>
                <Label htmlFor="artistBio">Bio</Label>
                <Textarea
                  id="artistBio"
                  value={artistBio}
                  onChange={(e) => setArtistBio(e.target.value)}
                  placeholder="Tell us about your music journey..."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="genres">Genres (comma-separated)</Label>
                <Input
                  id="genres"
                  value={genres}
                  onChange={(e) => setGenres(e.target.value)}
                  placeholder="Hip-Hop, R&B, Pop"
                />
              </div>
            </div>
          )}

          {/* Step 3: Engineer Profile */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="engineerName">Engineer Name</Label>
                <Input
                  id="engineerName"
                  value={engineerName}
                  onChange={(e) => setEngineerName(e.target.value)}
                  placeholder="Your professional name"
                />
              </div>
              <div>
                <Label htmlFor="engineerBio">Professional Bio</Label>
                <Textarea
                  id="engineerBio"
                  value={engineerBio}
                  onChange={(e) => setEngineerBio(e.target.value)}
                  placeholder="Your experience and expertise..."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="specializations">Specializations (comma-separated)</Label>
                <Input
                  id="specializations"
                  value={specializations}
                  onChange={(e) => setSpecializations(e.target.value)}
                  placeholder="Mixing, Mastering, Vocal Production"
                />
              </div>
              <div>
                <Label htmlFor="mixingRate">Mixing Rate (per track)</Label>
                <Input
                  id="mixingRate"
                  type="number"
                  value={mixingRate}
                  onChange={(e) => setMixingRate(e.target.value)}
                  placeholder="150"
                />
              </div>
            </div>
          )}

          {/* Step 4: Preferences */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <Label>Default Dashboard View</Label>
              <RadioGroup value={defaultDashboard} onValueChange={(v) => setDefaultDashboard(v as any)}>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value="unified" id="unified" />
                  <Label htmlFor="unified" className="cursor-pointer flex-1">
                    <p className="font-semibold">Unified Dashboard</p>
                    <p className="text-sm text-muted-foreground">See both artist & engineer views</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value="artist" id="artist-dash" />
                  <Label htmlFor="artist-dash" className="cursor-pointer flex-1">
                    <p className="font-semibold">Artist Dashboard</p>
                    <p className="text-sm text-muted-foreground">Start as artist</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value="engineer" id="engineer-dash" />
                  <Label htmlFor="engineer-dash" className="cursor-pointer flex-1">
                    <p className="font-semibold">Engineer Dashboard</p>
                    <p className="text-sm text-muted-foreground">Start as engineer</p>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 5: Complete */}
          {currentStep === 5 && (
            <div className="text-center space-y-4 py-8">
              <CheckCircle2 className="w-16 h-16 text-success mx-auto" />
              <h3 className="text-2xl font-bold">You're All Set!</h3>
              <p className="text-muted-foreground">
                Your hybrid account is configured. You can switch between roles anytime using the role switcher.
              </p>
              <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-left">
                <p className="text-sm font-semibold">What's next?</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Complete your profiles</li>
                  <li>• Upload your first project or apply to jobs</li>
                  <li>• Start earning 1.5x bonus XP</li>
                  <li>• Get 25% off when using both sides</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-4">
            {currentStep > 1 && currentStep < 5 && (
              <Button onClick={handleBack} variant="outline" className="flex-1">
                Back
              </Button>
            )}
            {currentStep < 5 ? (
              <Button onClick={handleNext} className="flex-1">
                Next
              </Button>
            ) : (
              <Button onClick={completeOnboarding} disabled={loading} className="w-full">
                {loading ? "Setting up..." : "Complete Setup"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
