import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, Music, CheckCircle, Sparkles, Mic2, Headphones, Zap, 
  AtSign, Loader2, Check, X, Camera
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
import { AvatarUploadStep } from './AvatarUploadStep';
import artistPathImage from '@/assets/onboarding-artist-path.jpg';

const GENRES = [
  'Hip-Hop', 'R&B', 'Pop', 'Trap', 'Drill', 'Electronic', 
  'Rock', 'Jazz', 'Soul', 'Afrobeats', 'Latin', 'Indie'
];

const GOALS = [
  { id: 'mixing', label: 'Get my tracks mixed', icon: Headphones },
  { id: 'mastering', label: 'Master for streaming', icon: Zap },
  { id: 'collab', label: 'Find collaborators', icon: Mic2 },
  { id: 'learn', label: 'Learn production', icon: Sparkles },
];

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: typeof User;
}

const steps: WizardStep[] = [
  { id: 'profile', title: 'Profile', description: 'Tell us about yourself', icon: User },
  { id: 'avatar', title: 'Photo', description: 'Profile picture', icon: Camera },
  { id: 'preferences', title: 'Sound', description: 'What genres do you create?', icon: Music },
  { id: 'goals', title: 'Goals', description: 'What brings you here?', icon: CheckCircle },
];

export function ArtistOnboardingWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, refreshRoles } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Pre-fill from URL params
  const nameFromUrl = searchParams.get('name');
  
  // Form state
  const [fullName, setFullName] = useState(nameFromUrl || '');
  const [artistName, setArtistName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  
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
        .maybeSingle();
      
      if (profile?.onboarding_completed || profile?.username) {
        // Already completed, redirect to CRM
        navigate('/artist-crm');
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
        .upsert({
          id: user.id,
          full_name: fullName,
          username: username,
          bio: bio || `${artistName ? `${artistName} - ` : ''}Artist on MIXXCLUB`,
          genre_specialties: selectedGenres,
          role: 'artist',
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) throw error;

      await supabase.rpc('award_points', {
        p_user_id: user.id,
        p_points: 100,
        p_action_type: 'onboarding_complete',
        p_action_description: 'Completed artist onboarding'
      });

      // Refresh auth context so CRM dashboard has correct role
      await refreshRoles();

      toast.success('Welcome to MIXXCLUB! 🎉', {
        description: '+100 XP earned for completing your profile!'
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <OnboardingPortal
      role="artist"
      backgroundImage={artistPathImage}
      currentStep={currentStep}
      totalSteps={steps.length}
      isCompleting={isCompleting}
      destinationPath="/artist-crm"
    >
      {/* Jax Character Guide */}
      <OnboardingCharacterGuide
        characterId="jax"
        step={currentStep}
        totalSteps={steps.length}
      />

      {/* Waypoints */}
      <OnboardingWaypoints 
        steps={steps} 
        currentStep={currentStep}
        variant="artist"
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
        variant="artist"
        destinationPath="/artist-crm"
      >
        {currentStep === 0 && (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-1">Welcome to MIXXCLUB</h2>
              <p className="text-muted-foreground text-sm">Let's set up your artist profile</p>
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
                <Label htmlFor="artistName">Artist Name (optional)</Label>
                <Input
                  id="artistName"
                  placeholder="Your stage name"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="bio">Bio (optional)</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell engineers about your sound..."
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
              <h2 className="text-2xl font-bold mb-1">What's Your Sound?</h2>
              <p className="text-muted-foreground text-sm">Select genres that match your style</p>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {GENRES.map(genre => (
                <Badge
                  key={genre}
                  variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                  className={`cursor-pointer text-sm py-2 px-4 transition-all ${
                    selectedGenres.includes(genre) 
                      ? 'bg-primary hover:bg-primary/90' 
                      : 'hover:bg-primary/10 border-white/20'
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
              <h2 className="text-2xl font-bold mb-1">What Brings You Here?</h2>
              <p className="text-muted-foreground text-sm">Select your goals</p>
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
                        ? 'border-primary bg-primary/10' 
                        : 'border-white/10 hover:border-primary/50 bg-white/5'}
                    `}
                  >
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center shrink-0
                      ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-white/10'}
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
