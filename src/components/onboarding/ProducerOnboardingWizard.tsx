import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  User, Music, CheckCircle, Sparkles, Disc3, DollarSign, Zap,
  AtSign, Loader2, Check, X
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
import producerPathImage from '@/assets/onboarding-engineer-path.jpg'; // Reuse engineer path for now

const GENRES = [
  'Trap', 'Hip-Hop', 'Boom Bap', 'Drill', 'R&B', 'Pop',
  'Afrobeats', 'Electronic', 'Lo-Fi', 'Soul', 'Reggaeton', 'Dancehall'
];

const GOALS = [
  { id: 'sell', label: 'Sell beats to artists', icon: DollarSign },
  { id: 'collab', label: 'Find artists to work with', icon: Sparkles },
  { id: 'license', label: 'License for sync/media', icon: Zap },
  { id: 'grow', label: 'Grow my producer brand', icon: Disc3 },
];

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: typeof User;
}

const steps: WizardStep[] = [
  { id: 'profile', title: 'Profile', description: 'Tell us about yourself', icon: User },
  { id: 'style', title: 'Style', description: 'What genres do you produce?', icon: Music },
  { id: 'goals', title: 'Goals', description: 'What brings you here?', icon: CheckCircle },
];

export function ProducerOnboardingWizard() {
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
  const [producerName, setProducerName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

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
        navigate('/producer-crm');
      }
    };

    checkOnboardingStatus();
  }, [user, navigate]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return fullName.trim().length > 0 && isUsernameValid;
      case 1: return selectedGenres.length > 0;
      case 2: return selectedGoals.length > 0;
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
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          username: username,
          bio: bio || `${producerName ? `${producerName} - ` : ''}Producer on MIXXCLUB`,
          genre_specialties: selectedGenres,
          role: 'producer',
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      await supabase.rpc('award_points', {
        p_user_id: user.id,
        p_points: 125,
        p_action_type: 'onboarding_complete',
        p_action_description: 'Completed producer onboarding'
      });

      toast.success('Welcome to MIXXCLUB! 🎹', {
        description: '+125 XP earned for completing your profile!'
      });

      setIsCompleting(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <OnboardingPortal
      role="producer"
      backgroundImage={producerPathImage}
      currentStep={currentStep}
      totalSteps={steps.length}
      isCompleting={isCompleting}
      destinationPath="/producer-crm"
    >
      {/* Tempo Character Guide */}
      <OnboardingCharacterGuide
        characterId="rell"
        step={currentStep}
        totalSteps={steps.length}
      />

      {/* Waypoints */}
      <OnboardingWaypoints
        steps={steps}
        currentStep={currentStep}
        variant="producer"
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
        variant="producer"
        destinationPath="/producer-crm"
      >
        {currentStep === 0 && (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-1">Welcome to the Beat Forge</h2>
              <p className="text-muted-foreground text-sm">Let's set up your producer profile</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Your Name *</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your name"
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
                  <p className="text-xs text-muted-foreground">
                    Your profile: /u/{username || '...'}
                  </p>
                  {usernameError && <p className="text-xs text-destructive">{usernameError}</p>}
                  {!usernameError && isAvailable === false && <p className="text-xs text-destructive">Taken</p>}
                  {!usernameError && isAvailable === true && <p className="text-xs text-green-500">Available!</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="producerName">Producer Tag (optional)</Label>
                <Input
                  id="producerName"
                  placeholder="Your producer tag"
                  value={producerName}
                  onChange={(e) => setProducerName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio (optional)</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell artists about your sound..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="mt-1 resize-none"
                  rows={2}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-1">What's Your Production Style?</h2>
              <p className="text-muted-foreground text-sm">Select genres you specialize in</p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {GENRES.map(genre => (
                <Badge
                  key={genre}
                  variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                  className={`cursor-pointer text-sm py-2 px-4 transition-all ${selectedGenres.includes(genre)
                      ? 'bg-amber-500 hover:bg-amber-500/90 text-black'
                      : 'hover:bg-amber-500/10 border-white/20'
                    }`}
                  onClick={() => toggleGenre(genre)}
                >
                  {genre}
                </Badge>
              ))}
            </div>

            {selectedGenres.length > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                {selectedGenres.length} genre{selectedGenres.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-1">What's Your Goal?</h2>
              <p className="text-muted-foreground text-sm">Select what brings you to MIXXCLUB</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GOALS.map(goal => {
                const Icon = goal.icon;
                const isSelected = selectedGoals.includes(goal.id);

                return (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`
                       p-4 rounded-lg border-2 transition-all text-left flex items-center gap-3
                       ${isSelected
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-white/10 hover:border-amber-500/50 bg-white/5'}
                     `}
                  >
                    <div className={`
                       w-10 h-10 rounded-full flex items-center justify-center shrink-0
                       ${isSelected ? 'bg-amber-500 text-black' : 'bg-white/10'}
                     `}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-sm">{goal.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </OnboardingPanel>
    </OnboardingPortal>
  );
}