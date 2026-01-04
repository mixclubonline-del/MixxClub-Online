import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, Music, Upload, CheckCircle, ArrowRight, ArrowLeft, 
  Sparkles, Mic2, Headphones, Zap, AtSign, Loader2, Check, X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useUsernameValidation } from '@/hooks/useUsernameValidation';

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
  { id: 'profile', title: 'Your Profile', description: 'Tell us about yourself', icon: User },
  { id: 'preferences', title: 'Your Sound', description: 'What genres do you create?', icon: Music },
  { id: 'goals', title: 'Your Goals', description: 'What brings you to MIXXCLUB?', icon: CheckCircle },
];

export function ArtistOnboardingWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  
  // Username validation
  const { username, setUsername, isChecking, isAvailable, error: usernameError, isValid: isUsernameValid } = useUsernameValidation();

  const progress = ((currentStep + 1) / steps.length) * 100;

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
      // Update profile with username
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          username: username,
          bio: bio || `${artistName ? `${artistName} - ` : ''}Artist on MIXXCLUB`,
          genre_specialties: selectedGenres,
          role: 'artist'
        })
        .eq('id', user.id);

      if (error) throw error;

      // Award XP for completing onboarding
      await supabase.rpc('award_points', {
        p_user_id: user.id,
        p_points: 100,
        p_action_type: 'onboarding_complete',
        p_action_description: 'Completed artist onboarding'
      });

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast.success('Welcome to MIXXCLUB! 🎉', {
        description: '+100 XP earned for completing your profile!'
      });

      // Navigate to artist CRM
      setTimeout(() => {
        navigate('/artist-crm');
      }, 1500);

    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    toast.info('You can complete your profile later');
    navigate('/artist-crm');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
        
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Skip for now
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-8 mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isComplete = index < currentStep;
            
            return (
              <div 
                key={step.id}
                className={`flex flex-col items-center gap-2 transition-all ${
                  isActive ? 'opacity-100' : 'opacity-50'
                }`}
              >
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all
                  ${isComplete ? 'bg-primary text-primary-foreground' : 
                    isActive ? 'bg-primary/20 text-primary border-2 border-primary' : 
                    'bg-muted text-muted-foreground'}
                `}>
                  {isComplete ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                </div>
                <span className="text-xs font-medium hidden sm:block">{step.title}</span>
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-[300px]"
          >
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Welcome to MIXXCLUB</h2>
                  <p className="text-muted-foreground">Let's set up your artist profile</p>
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
                        Your profile URL: /u/{username || '...'}
                      </p>
                      {usernameError && (
                        <p className="text-xs text-destructive">{usernameError}</p>
                      )}
                      {!usernameError && isAvailable === false && (
                        <p className="text-xs text-destructive">Username taken</p>
                      )}
                      {!usernameError && isAvailable === true && (
                        <p className="text-xs text-green-500">Available!</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="artistName">Artist/Stage Name (optional)</Label>
                    <Input
                      id="artistName"
                      placeholder="Your stage name"
                      value={artistName}
                      onChange={(e) => setArtistName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">Short Bio (optional)</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell engineers about your sound..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="mt-1 resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">What's Your Sound?</h2>
                  <p className="text-muted-foreground">Select genres that match your style</p>
                </div>
                
                <div className="flex flex-wrap gap-2 justify-center">
                  {GENRES.map(genre => (
                    <Badge
                      key={genre}
                      variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                      className={`cursor-pointer text-sm py-2 px-4 transition-all ${
                        selectedGenres.includes(genre) 
                          ? 'bg-primary hover:bg-primary/90' 
                          : 'hover:bg-primary/10'
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
                  <h2 className="text-2xl font-bold mb-2">What Brings You Here?</h2>
                  <p className="text-muted-foreground">Select your goals (pick all that apply)</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            : 'border-border hover:border-primary/50'}
                        `}
                      >
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center
                          ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}
                        `}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium">{goal.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className="gap-2"
          >
            {currentStep === steps.length - 1 ? (
              isSubmitting ? 'Setting up...' : 'Complete Setup'
            ) : (
              'Continue'
            )}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
