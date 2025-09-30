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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Headphones, CheckCircle2, ChevronRight, ChevronLeft, DollarSign } from "lucide-react";
import mixclub3DLogo from "@/assets/mixclub-3d-logo.png";

const STEPS = [
  { id: 1, title: "Welcome", description: "Terms & Agreements" },
  { id: 2, title: "Profile", description: "Professional info" },
  { id: 3, title: "Experience", description: "Portfolio & rates" },
  { id: 4, title: "Financial", description: "Payment terms" },
  { id: 5, title: "Complete", description: "You're all set!" },
];

const EngineerOnboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [artistEngineerAgreementAccepted, setArtistEngineerAgreementAccepted] = useState(false);
  const [financialAgreementAccepted, setFinancialAgreementAccepted] = useState(false);
  const [stageName, setStageName] = useState("");
  const [bio, setBio] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [mixingRate, setMixingRate] = useState("");
  const [masteringRate, setMasteringRate] = useState("");
  const [payoutPreference, setPayoutPreference] = useState("monthly");

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

    if (currentStep === 4) {
      if (!financialAgreementAccepted) {
        toast.error("Please accept the financial agreement to continue");
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
      // Create onboarding profile
      const { error: onboardingError } = await supabase
        .from('onboarding_profiles')
        .upsert({
          user_id: user.id,
          user_type: 'engineer',
          stage_name: stageName,
          bio,
          experience_level: experienceLevel,
          terms_accepted: termsAccepted,
          terms_accepted_at: new Date().toISOString(),
          artist_engineer_agreement_accepted: artistEngineerAgreementAccepted,
          artist_engineer_agreement_accepted_at: new Date().toISOString(),
          financial_agreement_accepted: financialAgreementAccepted,
          financial_agreement_accepted_at: new Date().toISOString(),
          revenue_split_percentage: 70,
          payout_preference: payoutPreference,
          onboarding_completed: true,
          current_step: STEPS.length,
          updated_at: new Date().toISOString(),
        });

      if (onboardingError) throw onboardingError;

      // Create engineer profile
      const { error: profileError } = await supabase
        .from('engineer_profiles')
        .upsert({
          user_id: user.id,
          years_experience: parseInt(yearsExperience) || 0,
          mixing_rate_per_song: parseFloat(mixingRate) || 0,
          mastering_rate_per_song: parseFloat(masteringRate) || 0,
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      toast.success("Welcome to MixClub! Your engineer profile is complete.");
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
              Engineer Onboarding
            </span>
          </h1>
          <p className="text-muted-foreground">Join our network of professional engineers</p>
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
                  <Headphones className="w-5 h-5 text-primary" />
                  Terms of Service
                </h3>
                <div className="prose prose-sm text-muted-foreground max-h-40 overflow-y-auto space-y-2">
                  <p>By joining as an engineer, you agree to:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Provide professional quality mixing and mastering services</li>
                    <li>Maintain clear communication with artists</li>
                    <li>Deliver projects within agreed timeframes</li>
                    <li>Honor revision requests as per project agreements</li>
                    <li>Respect artist intellectual property rights</li>
                    <li>Maintain professional standards and ethics</li>
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
                  <p>This agreement defines your professional relationship with artists:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>You'll define project scope and deliverables before starting work</li>
                    <li>You'll provide up to 3 rounds of revisions per project</li>
                    <li>You'll communicate realistic turnaround times</li>
                    <li>You'll deliver professional quality work consistently</li>
                    <li>Artists retain all rights to original recordings</li>
                    <li>You may showcase work in portfolio with artist permission</li>
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
                <Label htmlFor="stageName">Professional Name *</Label>
                <Input
                  id="stageName"
                  placeholder="Enter your professional name"
                  value={stageName}
                  onChange={(e) => setStageName(e.target.value)}
                  className="bg-background/50 border-primary/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio *</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about your experience, specialties, and what makes you unique..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="bg-background/50 border-primary/20 min-h-32"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Experience Level *</Label>
                <RadioGroup value={experienceLevel} onValueChange={setExperienceLevel}>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="beginner" id="beginner" />
                      <Label htmlFor="beginner" className="cursor-pointer">Beginner (0-2 years)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="intermediate" id="intermediate" />
                      <Label htmlFor="intermediate" className="cursor-pointer">Intermediate (3-5 years)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="professional" id="professional" />
                      <Label htmlFor="professional" className="cursor-pointer">Professional (6-10 years)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="expert" id="expert" />
                      <Label htmlFor="expert" className="cursor-pointer">Expert (10+ years)</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Years of Experience</Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  placeholder="e.g., 5"
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                  className="bg-background/50 border-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mixingRate">Mixing Rate (per song)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="mixingRate"
                      type="number"
                      placeholder="0.00"
                      value={mixingRate}
                      onChange={(e) => setMixingRate(e.target.value)}
                      className="bg-background/50 border-primary/20 pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="masteringRate">Mastering Rate (per song)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="masteringRate"
                      type="number"
                      placeholder="0.00"
                      value={masteringRate}
                      onChange={(e) => setMasteringRate(e.target.value)}
                      className="bg-background/50 border-primary/20 pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  💡 <strong>Tip:</strong> Competitive rates help you get more projects. You can always adjust these later in your profile settings.
                </p>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Financial Agreement
                </h3>
                <div className="prose prose-sm text-muted-foreground space-y-3">
                  <div className="bg-background/50 rounded-lg p-4 border border-primary/10">
                    <h4 className="font-semibold text-foreground mb-2">Revenue Split</h4>
                    <p>You receive <strong className="text-primary">70%</strong> of project payments</p>
                    <p>MixClub platform fee: <strong>30%</strong></p>
                  </div>
                  
                  <div className="bg-background/50 rounded-lg p-4 border border-primary/10">
                    <h4 className="font-semibold text-foreground mb-2">Payment Terms</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Payments are processed after project completion and artist approval</li>
                      <li>Platform fee is deducted automatically</li>
                      <li>Bonus earnings for 5-star ratings</li>
                      <li>Payouts processed according to your schedule preference</li>
                      <li>Minimum payout threshold: $50</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label>Payout Preference</Label>
                    <RadioGroup value={payoutPreference} onValueChange={setPayoutPreference}>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="weekly" id="weekly" />
                          <Label htmlFor="weekly" className="cursor-pointer">Weekly (every Friday)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="bi-weekly" id="bi-weekly" />
                          <Label htmlFor="bi-weekly" className="cursor-pointer">Bi-weekly (1st & 15th)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="monthly" id="monthly" />
                          <Label htmlFor="monthly" className="cursor-pointer">Monthly (1st of month)</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox 
                      id="financial-agreement" 
                      checked={financialAgreementAccepted} 
                      onCheckedChange={(checked) => setFinancialAgreementAccepted(checked as boolean)}
                    />
                    <Label htmlFor="financial-agreement" className="text-sm cursor-pointer">
                      I accept the Financial Agreement and understand the payment terms, revenue split (70/30), and payout schedule
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="text-center py-8 animate-fade-in">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Welcome to MixClub!</h2>
              <p className="text-muted-foreground mb-6">
                Your engineer profile is complete. Start browsing projects and building your portfolio!
              </p>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="font-semibold mb-3">Next Steps:</h3>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    Complete your profile with portfolio samples
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    Browse available projects in the Job Board
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                    Set up your Stripe account for payouts
                  </li>
                </ul>
              </div>
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
            disabled={loading || (currentStep === 1 && (!termsAccepted || !artistEngineerAgreementAccepted)) || (currentStep === 4 && !financialAgreementAccepted)}
            className="bg-gradient-to-r from-primary to-primary/90"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : currentStep === STEPS.length ? (
              "Complete & Start"
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

export default EngineerOnboarding;