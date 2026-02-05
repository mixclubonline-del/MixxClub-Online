import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { 
  User, Settings, DollarSign, AtSign, Loader2, Check, X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUsernameValidation } from '@/hooks/useUsernameValidation';
import { OnboardingPortal } from './OnboardingPortal';
import { OnboardingWaypoints } from './OnboardingWaypoints';
import { OnboardingPanel } from './OnboardingPanel';
import { OnboardingCharacterGuide } from '@/components/characters';
import engineerPathImage from '@/assets/onboarding-engineer-path.jpg';

const SPECIALTIES = [
  'Mixing', 'Mastering', 'Vocal Production', 'Beat Making',
  'Sound Design', 'Stem Separation', 'Audio Restoration', 'Podcast Production'
];

const GENRES = [
  'Hip-Hop', 'R&B', 'Pop', 'Trap', 'Drill', 'Electronic', 
  'Rock', 'Jazz', 'Soul', 'Afrobeats', 'Latin', 'Indie',
  'Country', 'Metal', 'Classical', 'Ambient'
];

const EXPERIENCE_LEVELS = [
  { value: 1, label: '0-2 yrs', description: 'Getting started' },
  { value: 3, label: '3-5 yrs', description: 'Building' },
  { value: 6, label: '6-10 yrs', description: 'Established' },
  { value: 10, label: '10+ yrs', description: 'Veteran' },
];

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: typeof User;
}

const steps: WizardStep[] = [
  { id: 'profile', title: 'Profile', description: 'Professional details', icon: User },
  { id: 'skills', title: 'Skills', description: 'Specializations', icon: Settings },
  { id: 'rates', title: 'Rates', description: 'Set pricing', icon: DollarSign },
];

export function EngineerOnboardingWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Pre-fill from URL params
  const nameFromUrl = searchParams.get('name');
  
  // Form state
  const [fullName, setFullName] = useState(nameFromUrl || '');
  const [bio, setBio] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [yearsExperience, setYearsExperience] = useState(3);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState(100);

  // Username validation
  const { username, setUsername, isChecking, isAvailable, error: usernameError, isValid: isUsernameValid } = useUsernameValidation();

  // Check if user already completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed, username')
        .eq('id', user.id)
        .single();
      
      if (profile?.onboarding_completed || profile?.username) {
        // Already completed, redirect to CRM
        navigate('/engineer-crm');
      }
    };
    
    checkOnboardingStatus();
  }, [user, navigate]);

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties(prev => 
      prev.includes(specialty) 
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return fullName.trim().length > 0 && bio.trim().length > 20 && isUsernameValid;
      case 1: return selectedSpecialties.length > 0 && selectedGenres.length > 0;
      case 2: return hourlyRate >= 25;
      default: return true;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          username: username,
          bio: bio,
          role: 'engineer',
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      const { error: engError } = await supabase
        .from('engineer_profiles')
        .upsert({
          user_id: user.id,
          specialties: selectedSpecialties,
          genres: selectedGenres,
          hourly_rate: hourlyRate,
          years_experience: yearsExperience,
          portfolio_url: portfolioUrl || null,
          availability_status: 'available',
          rating: 5.0,
          completed_projects: 0
        }, { onConflict: 'user_id' });

      if (engError) throw engError;

      await supabase.rpc('award_points', {
        p_user_id: user.id,
        p_points: 150,
        p_action_type: 'engineer_onboarding_complete',
        p_action_description: 'Completed engineer onboarding'
      });

      toast.success('Welcome to the MIXXCLUB Engineer Network! 🎛️', {
        description: '+150 XP earned! Your profile is now live.'
      });

      setIsCompleting(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Loading state while checking auth
  if (!user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <OnboardingPortal
      role="engineer"
      backgroundImage={engineerPathImage}
      currentStep={currentStep}
      totalSteps={steps.length}
      isCompleting={isCompleting}
      destinationPath="/engineer-crm"
    >
      {/* Rell Character Guide */}
      <OnboardingCharacterGuide
        characterId="rell"
        step={currentStep}
        totalSteps={steps.length}
      />

      {/* Waypoints */}
      <OnboardingWaypoints 
        steps={steps} 
        currentStep={currentStep}
        variant="engineer"
      />
      
      {/* Panel with form content */}
      <OnboardingPanel
        stepKey={currentStep}
        onBack={handleBack}
        onNext={handleNext}
        canProceed={canProceed()}
        isSubmitting={isSubmitting}
        isFirstStep={currentStep === 0}
        isLastStep={currentStep === steps.length - 1}
        variant="engineer"
        destinationPath="/engineer-crm"
      >
        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold mb-1">Join the Engineer Network</h2>
              <p className="text-muted-foreground text-sm">Set up your professional profile</p>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="fullName">Professional Name *</Label>
                <Input
                  id="fullName"
                  placeholder="How clients will see you"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="username">Claim Your Username *</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <AtSign className="h-4 w-4" />
                  </span>
                  <Input
                    id="username"
                    placeholder="yourname"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-9 pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isChecking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    {!isChecking && isAvailable === true && <Check className="h-4 w-4 text-green-500" />}
                    {!isChecking && isAvailable === false && <X className="h-4 w-4 text-destructive" />}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">/u/{username || '...'}</p>
                  {usernameError && <p className="text-xs text-destructive">{usernameError}</p>}
                  {!usernameError && isAvailable === false && <p className="text-xs text-destructive">Taken</p>}
                  {!usernameError && isAvailable === true && <p className="text-xs text-green-500">Available!</p>}
                </div>
              </div>
              
              <div>
                <Label htmlFor="bio">Bio * (min 20 chars)</Label>
                <Textarea
                  id="bio"
                  placeholder="Your experience, style, and what makes you unique..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="mt-1 resize-none"
                  rows={2}
                />
                <span className="text-xs text-muted-foreground">{bio.length}/20</span>
              </div>
              
              <div>
                <Label htmlFor="portfolio">Portfolio URL (optional)</Label>
                <Input
                  id="portfolio"
                  placeholder="https://your-portfolio.com"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Experience</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {EXPERIENCE_LEVELS.map(level => (
                    <button
                      key={level.value}
                      onClick={() => setYearsExperience(level.value)}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        yearsExperience === level.value
                          ? 'border-accent bg-accent/10'
                          : 'border-white/10 hover:border-accent/50 bg-white/5'
                      }`}
                    >
                      <div className="font-medium text-xs">{level.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold mb-1">Your Expertise</h2>
              <p className="text-muted-foreground text-sm">What services do you offer?</p>
            </div>
            
            <div>
              <Label className="mb-2 block text-sm">Specializations *</Label>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map(specialty => (
                  <Badge
                    key={specialty}
                    variant={selectedSpecialties.includes(specialty) ? 'default' : 'outline'}
                    className={`cursor-pointer py-1.5 px-3 text-xs transition-all ${
                      selectedSpecialties.includes(specialty) 
                        ? 'bg-accent hover:bg-accent/90' 
                        : 'hover:bg-accent/10 border-white/20'
                    }`}
                    onClick={() => toggleSpecialty(specialty)}
                  >
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-2 block text-sm">Genres *</Label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {GENRES.map(genre => (
                  <Badge
                    key={genre}
                    variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                    className={`cursor-pointer py-1 px-2 text-xs transition-all ${
                      selectedGenres.includes(genre) 
                        ? 'bg-primary/80 hover:bg-primary/70' 
                        : 'hover:bg-primary/10 border-white/20'
                    }`}
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
            
            <p className="text-center text-xs text-muted-foreground">
              {selectedSpecialties.length} specialties, {selectedGenres.length} genres
            </p>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold mb-1">Set Your Rates</h2>
              <p className="text-muted-foreground text-sm">You can adjust these anytime</p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6 text-center border border-white/10">
              <div className="text-4xl font-bold text-accent mb-1">
                ${hourlyRate}
              </div>
              <div className="text-muted-foreground text-sm">per hour</div>
            </div>

            <div className="px-2">
              <Slider
                value={[hourlyRate]}
                onValueChange={(value) => setHourlyRate(value[0])}
                min={25}
                max={500}
                step={5}
                className="my-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$25</span>
                <span>$500</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="font-semibold">${hourlyRate * 2}</div>
                <div className="text-muted-foreground text-xs">2hr session</div>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="font-semibold">${hourlyRate * 4}</div>
                <div className="text-muted-foreground text-xs">Half day</div>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="font-semibold">${hourlyRate * 8}</div>
                <div className="text-muted-foreground text-xs">Full day</div>
              </div>
            </div>
          </div>
        )}
      </OnboardingPanel>
    </OnboardingPortal>
  );
}
