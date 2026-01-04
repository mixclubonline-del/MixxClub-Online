import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { 
  User, Settings, DollarSign, CheckCircle, ArrowRight, ArrowLeft,
  Mic2, Headphones, Sliders, AudioWaveform, AtSign, Loader2, Check, X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useUsernameValidation } from '@/hooks/useUsernameValidation';

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
  { value: 1, label: '0-2 years', description: 'Getting started' },
  { value: 3, label: '3-5 years', description: 'Building experience' },
  { value: 6, label: '6-10 years', description: 'Established professional' },
  { value: 10, label: '10+ years', description: 'Industry veteran' },
];

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: typeof User;
}

const steps: WizardStep[] = [
  { id: 'profile', title: 'Your Profile', description: 'Professional details', icon: User },
  { id: 'skills', title: 'Your Skills', description: 'Specializations & genres', icon: Settings },
  { id: 'rates', title: 'Your Rates', description: 'Set your pricing', icon: DollarSign },
];

export function EngineerOnboardingWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [yearsExperience, setYearsExperience] = useState(3);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState(100);

  // Username validation
  const { username, setUsername, isChecking, isAvailable, error: usernameError, isValid: isUsernameValid } = useUsernameValidation();

  const progress = ((currentStep + 1) / steps.length) * 100;

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
      // Update profile with username
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          username: username,
          bio: bio,
          role: 'engineer'
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Create or update engineer profile
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

      // Award XP for completing onboarding
      await supabase.rpc('award_points', {
        p_user_id: user.id,
        p_points: 150,
        p_action_type: 'engineer_onboarding_complete',
        p_action_description: 'Completed engineer onboarding'
      });

      // Trigger confetti
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347']
      });

      toast.success('Welcome to the MIXXCLUB Engineer Network! 🎛️', {
        description: '+150 XP earned! Your profile is now live.'
      });

      // Navigate to engineer CRM
      setTimeout(() => {
        navigate('/engineer-crm');
      }, 1500);

    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    toast.info('You can complete your profile later from Settings');
    navigate('/engineer-crm');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl -z-10" />
        
        {/* Header badge */}
        <div className="flex justify-center mb-4">
          <Badge variant="secondary" className="gap-2">
            <AudioWaveform className="w-3 h-3" />
            Engineer Application
          </Badge>
        </div>

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
            className="min-h-[350px]"
          >
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Join the Engineer Network</h2>
                  <p className="text-muted-foreground">Set up your professional profile</p>
                </div>
                
                <div className="space-y-4">
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
                    <Label htmlFor="bio">Professional Bio * (min 20 characters)</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell artists about your experience, style, and what makes you unique..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="mt-1 resize-none"
                      rows={4}
                    />
                    <span className="text-xs text-muted-foreground">
                      {bio.length}/20 minimum characters
                    </span>
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
                    <Label>Years of Experience</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                      {EXPERIENCE_LEVELS.map(level => (
                        <button
                          key={level.value}
                          onClick={() => setYearsExperience(level.value)}
                          className={`p-3 rounded-lg border text-center transition-all ${
                            yearsExperience === level.value
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="font-medium text-sm">{level.label}</div>
                          <div className="text-xs text-muted-foreground">{level.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Your Expertise</h2>
                  <p className="text-muted-foreground">What services do you offer?</p>
                </div>
                
                <div>
                  <Label className="mb-2 block">Specializations *</Label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALTIES.map(specialty => (
                      <Badge
                        key={specialty}
                        variant={selectedSpecialties.includes(specialty) ? 'default' : 'outline'}
                        className={`cursor-pointer py-2 px-3 transition-all ${
                          selectedSpecialties.includes(specialty) 
                            ? 'bg-primary hover:bg-primary/90' 
                            : 'hover:bg-primary/10'
                        }`}
                        onClick={() => toggleSpecialty(specialty)}
                      >
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Genres You Work With *</Label>
                  <div className="flex flex-wrap gap-2">
                    {GENRES.map(genre => (
                      <Badge
                        key={genre}
                        variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                        className={`cursor-pointer py-1.5 px-2 text-xs transition-all ${
                          selectedGenres.includes(genre) 
                            ? 'bg-accent hover:bg-accent/90' 
                            : 'hover:bg-accent/10'
                        }`}
                        onClick={() => toggleGenre(genre)}
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <p className="text-center text-sm text-muted-foreground">
                  {selectedSpecialties.length} specialties, {selectedGenres.length} genres selected
                </p>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Set Your Rates</h2>
                  <p className="text-muted-foreground">You can adjust these anytime</p>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-6 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    ${hourlyRate}
                  </div>
                  <div className="text-muted-foreground">per hour</div>
                </div>

                <div className="px-4">
                  <Slider
                    value={[hourlyRate]}
                    onValueChange={(value) => setHourlyRate(value[0])}
                    min={25}
                    max={500}
                    step={5}
                    className="my-6"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>$25</span>
                    <span>$500</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="font-medium">${hourlyRate * 2}</div>
                    <div className="text-muted-foreground text-xs">2-hour session</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="font-medium">${hourlyRate * 4}</div>
                    <div className="text-muted-foreground text-xs">Half day</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="font-medium">${hourlyRate * 8}</div>
                    <div className="text-muted-foreground text-xs">Full day</div>
                  </div>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                  MIXXCLUB takes a 10% platform fee on completed projects
                </p>
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
              isSubmitting ? 'Creating Profile...' : 'Launch My Profile'
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
