 import { useState, useEffect } from 'react';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Badge } from '@/components/ui/badge';
 import { 
   User, Music, Heart, Sparkles,
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
 import fanPathImage from '@/assets/onboarding-artist-path.jpg'; // Reuse artist path for now
 
 const GENRES = [
   'Hip-Hop', 'R&B', 'Pop', 'Trap', 'Drill', 'Electronic', 
   'Rock', 'Jazz', 'Soul', 'Afrobeats', 'Latin', 'Indie', 'Lo-Fi'
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
   { id: 'interests', title: 'Interests', description: 'What music do you love?', icon: Music },
 ];
 
 export function FanOnboardingWizard() {
   const navigate = useNavigate();
   const [searchParams] = useSearchParams();
   const { user, refreshRoles } = useAuth();
   const [currentStep, setCurrentStep] = useState(0);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [isCompleting, setIsCompleting] = useState(false);
   
   // Pre-fill from URL params
   const nameFromUrl = searchParams.get('name');
   
   // Form state
   const [displayName, setDisplayName] = useState(nameFromUrl || '');
   const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
   
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
         navigate('/fan-hub');
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
 
   const canProceed = () => {
     switch (currentStep) {
       case 0: return displayName.trim().length > 0 && isUsernameValid;
       case 1: return selectedGenres.length > 0;
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
            full_name: displayName,
            username: username,
            bio: `Music lover on MIXXCLUB`,
            genre_specialties: selectedGenres,
            role: 'fan',
            onboarding_completed: true,
            onboarding_completed_at: new Date().toISOString()
          }, { onConflict: 'id' });
  
        if (error) throw error;
 
       await supabase.rpc('award_points', {
         p_user_id: user.id,
         p_points: 50,
         p_action_type: 'onboarding_complete',
         p_action_description: 'Completed fan onboarding'
       });

       await refreshRoles();

       toast.success('Welcome to MIXXCLUB! 💜', {
         description: '+50 XP earned for joining the community!'
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
         <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
       </div>
     );
   }
 
   return (
     <OnboardingPortal
       role="fan"
       backgroundImage={fanPathImage}
       currentStep={currentStep}
       totalSteps={steps.length}
       isCompleting={isCompleting}
       destinationPath="/fan-hub"
     >
       {/* Nova Character Guide */}
       <OnboardingCharacterGuide
         characterId="nova"
         step={currentStep}
         totalSteps={steps.length}
       />
 
       {/* Waypoints */}
       <OnboardingWaypoints 
         steps={steps} 
         currentStep={currentStep}
         variant="fan"
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
         variant="fan"
         destinationPath="/fan-hub"
       >
         {currentStep === 0 && (
           <div className="space-y-5">
             <div className="text-center mb-6">
               <h2 className="text-2xl font-bold mb-1">Welcome to the Culture</h2>
               <p className="text-muted-foreground text-sm">Let's set up your profile</p>
             </div>
             
             <div className="space-y-4">
               <div>
                 <Label htmlFor="displayName">Display Name *</Label>
                 <Input
                   id="displayName"
                   placeholder="What should we call you?"
                   value={displayName}
                   onChange={(e) => setDisplayName(e.target.value)}
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
             </div>
           </div>
         )}
 
         {currentStep === 1 && (
           <div className="space-y-6">
             <div className="text-center mb-6">
               <h2 className="text-2xl font-bold mb-1">What Music Do You Love?</h2>
               <p className="text-muted-foreground text-sm">Select genres you enjoy</p>
             </div>
             
             <div className="flex flex-wrap gap-2 justify-center">
               {GENRES.map(genre => (
                 <Badge
                   key={genre}
                   variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                   className={`cursor-pointer text-sm py-2 px-4 transition-all ${
                     selectedGenres.includes(genre) 
                       ? 'bg-pink-500 hover:bg-pink-500/90' 
                       : 'hover:bg-pink-500/10 border-white/20'
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
       </OnboardingPanel>
     </OnboardingPortal>
   );
 }