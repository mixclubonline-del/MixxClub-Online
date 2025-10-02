import { useState } from 'react';
import { MobileEnhancedNav } from '@/components/mobile/MobileEnhancedNav';
import { MobileOnboardingWizard } from '@/components/mobile/MobileOnboardingWizard';
import { MobileAuthDialog } from '@/components/mobile/MobileAuthDialog';
import { PullToRefresh } from '@/components/mobile/PullToRefresh';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import HowItWorks from '@/components/HowItWorks';
import { Testimonials } from '@/components/Testimonials';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';

const MobileLanding = () => {
  const [showWizard, setShowWizard] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const { user } = useAuth();
  const { triggerHaptic } = useMobileOptimization({ enableHaptics: true });

  const handleRefresh = async () => {
    triggerHaptic('medium');
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleGetStarted = () => {
    triggerHaptic('light');
    if (user) {
      setShowWizard(true);
    } else {
      setAuthMode('signup');
      setShowAuth(true);
    }
  };

  const handleSignIn = () => {
    triggerHaptic('light');
    setAuthMode('login');
    setShowAuth(true);
  };

  return (
    <div className="min-h-screen pb-32">
      <MobileEnhancedNav />
      
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="container mx-auto px-4 py-8 space-y-16">
        <Hero />
        <Services />
        <HowItWorks />
        <Testimonials />
      </div>
      </PullToRefresh>

      {/* Fixed Bottom CTAs */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent space-y-2 z-40">
        <Button 
          className="w-full h-14 text-lg shadow-lg"
          onClick={handleGetStarted}
        >
          🎵 Get Started
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline"
            className="h-12"
            onClick={handleSignIn}
          >
            Sign In
          </Button>
          <Button 
            variant="outline"
            className="h-12"
            onClick={() => window.location.href = '/engineer-onboarding'}
          >
            ⚡ Join as Engineer
          </Button>
        </div>
      </div>

      <MobileOnboardingWizard 
        open={showWizard} 
        onOpenChange={setShowWizard} 
      />
      
      <MobileAuthDialog 
        open={showAuth} 
        onOpenChange={setShowAuth}
        mode={authMode}
      />
    </div>
  );
};

export default MobileLanding;
