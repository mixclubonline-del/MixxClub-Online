import { Sparkles, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useFlowNavigation } from '@/core/fabric/useFlow';

export const FreemiumBanner = () => {
  const { goToAuth } = useFlowNavigation();

  return (
    <section className="py-20 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="glass-studio rounded-3xl p-8 md:p-12 border-2 border-primary/30 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-6">
              <Sparkles className="w-4 h-4 text-primary animate-pulse-glow" />
              <span className="text-sm font-bold text-primary">LIMITED TIME OFFER</span>
            </div>

            {/* Headline */}
            <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Start For Free. Upgrade When You're Hooked.
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Get 1 free professional master every month, forever. No credit card required. 
              No watermarks. Just pure, radio-ready sound.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-start gap-3 text-left">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">1 Free Master/Month</p>
                  <p className="text-sm text-muted-foreground">Full commercial use, no watermark</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-left">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">AI-Powered Quality</p>
                  <p className="text-sm text-muted-foreground">Same tech as our paid plans</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-left">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">No Commitment</p>
                  <p className="text-sm text-muted-foreground">Cancel anytime, keep using free tier</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Button 
              onClick={() => goToAuth('signup')}
              size="lg" 
              className="text-lg px-10 py-6 shadow-glow hover:scale-105 transition-transform duration-300"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Free Today
            </Button>
            
            <p className="mt-4 text-sm text-muted-foreground">
              Join 3,200+ artists who started for free
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};