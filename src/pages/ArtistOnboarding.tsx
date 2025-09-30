import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Mic2, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";
import mixclub3DLogo from "@/assets/mixclub-3d-logo.png";

const STEPS = [
  { id: 1, title: "Welcome", description: "Terms & Agreements" },
  { id: 2, title: "Profile", description: "Tell us about yourself" },
  { id: 3, title: "Preferences", description: "Your music style" },
  { id: 4, title: "Complete", description: "You're all set!" },
];

const ArtistOnboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [artistEngineerAgreementAccepted, setArtistEngineerAgreementAccepted] = useState(false);
  const [stageName, setStageName] = useState("");
  const [bio, setBio] = useState("");
  const [genre, setGenre] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/auth?mode=signup");
    }
  }, [user, navigate]);

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!termsAccepted || !artistEngineerAgreementAccepted) {
        toast.error("Please accept all agreements to continue");
        return;
      }
    }

    if (currentStep === STEPS.length) {
      await completeOnboarding();
      return;
    }

    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const completeOnboarding = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('onboarding_profiles')
        .upsert({
          user_id: user.id,
          user_type: 'client',
          stage_name: stageName,
          bio,
          genre,
          terms_accepted: termsAccepted,
          terms_accepted_at: new Date().toISOString(),
          artist_engineer_agreement_accepted: artistEngineerAgreementAccepted,
          artist_engineer_agreement_accepted_at: new Date().toISOString(),
          onboarding_completed: true,
          current_step: STEPS.length,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success("Welcome to MixClub! Your profile is complete.");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-[32rem] h-[32rem] bg-primary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <Card className="relative z-10 w-full max-w-2xl p-8 bg-card/80 backdrop-blur-sm border-primary/20 shadow-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={mixclub3DLogo} alt="MixClub Logo" className="w-16 h-12 object-contain" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Artist Onboarding
            </span>
          </h1>
          <p className="text-muted-foreground">Let's get your profile set up</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {STEPS.map((step) => (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                  step.id < currentStep ? "bg-primary text-primary-foreground" :
                  step.id === currentStep ? "bg-primary/20 text-primary border-2 border-primary" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {step.id < currentStep ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                </div>
                <p className="text-xs font-medium text-center">{step.title}</p>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Mic2 className="w-5 h-5 text-primary" />
                  Terms of Service
                </h3>
                <div className="prose prose-sm text-muted-foreground max-h-40 overflow-y-auto space-y-2">
                  <p>By using MixClub Online, you agree to:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Provide accurate and complete information</li>
                    <li>Use the platform for lawful purposes only</li>
                    <li>Respect intellectual property rights</li>
                    <li>Maintain the confidentiality of your account</li>
                    <li>Pay for services as agreed upon with engineers</li>
                  </ul>
                </div>
                <div className="flex items-start gap-3 mt-4">
                  <Checkbox 
                    id="terms" 
                    checked={termsAccepted} 
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm cursor-pointer">
                    I accept the Terms of Service and Privacy Policy
                  </Label>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Artist-Engineer Agreement</h3>
                <div className="prose prose-sm text-muted-foreground max-h-40 overflow-y-auto space-y-2">
                  <p>This agreement covers your collaboration with engineers:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Project scope and deliverables will be defined before work begins</li>
                    <li>You'll receive up to 3 rounds of revisions per project</li>
                    <li>Turnaround times will be agreed upon before starting</li>
                    <li>Payment is required before final file delivery</li>
                    <li>You retain all rights to your original recordings</li>
                    <li>Engineers may showcase work in their portfolio with your permission</li>
                  </ul>
                </div>
                <div className="flex items-start gap-3 mt-4">
                  <Checkbox 
                    id="artist-agreement" 
                    checked={artistEngineerAgreementAccepted} 
                    onCheckedChange={(checked) => setArtistEngineerAgreementAccepted(checked as boolean)}
                  />
                  <Label htmlFor="artist-agreement" className="text-sm cursor-pointer">
                    I accept the Artist-Engineer Agreement
                  </Label>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="stageName">Stage Name / Artist Name *</Label>
                <Input
                  id="stageName"
                  placeholder="Enter your artist name"
                  value={stageName}
                  onChange={(e) => setStageName(e.target.value)}
                  className="bg-background/50 border-primary/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about your music and what you're looking for..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="bg-background/50 border-primary/20 min-h-32"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="genre">Primary Genre</Label>
                <Input
                  id="genre"
                  placeholder="e.g., Hip-Hop, Pop, Rock, Electronic"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="bg-background/50 border-primary/20"
                />
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">What You'll Get</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                    <span className="text-sm">Access to professional mixing and mastering engineers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                    <span className="text-sm">Real-time collaboration tools and feedback</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                    <span className="text-sm">Secure project management and file sharing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                    <span className="text-sm">Quality guaranteed with revision rounds</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="text-center py-8 animate-fade-in">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3">You're All Set!</h2>
              <p className="text-muted-foreground mb-6">
                Your artist profile is complete. Let's start making amazing music together!
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || loading}
            className="border-primary/20"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={loading || (currentStep === 1 && (!termsAccepted || !artistEngineerAgreementAccepted))}
            className="bg-gradient-to-r from-primary to-primary/90"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : currentStep === STEPS.length ? (
              "Complete"
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ArtistOnboarding;