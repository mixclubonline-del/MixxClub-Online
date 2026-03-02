import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import authGatewayImage from '@/assets/auth-gateway.jpg';

interface AuthLayoutProps {
  children: ReactNode;
  onBack?: () => void;
  showBackToLanding?: boolean;
}

// CSS-based ambient particles for performance
const AmbientParticles = () => {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ contain: 'layout' }}>
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/30 animate-float-particle"
          style={{
            left: `${10 + i * 11}%`,
            top: `${15 + i * 8}%`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${4 + (i % 3)}s`,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </div>
  );
};

export function AuthLayout({ children, onBack, showBackToLanding = true }: AuthLayoutProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${authGatewayImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/85 to-primary/20" />
      </div>

      {/* Ambient particles */}
      <AmbientParticles />

      {/* Back navigation */}
      <div className="absolute top-4 left-4 z-20 safe-area-inset">
        {onBack ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        ) : showBackToLanding ? (
          <Link to="/">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
        ) : null}
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 safe-area-inset">
        <div className="w-full max-w-md">
          {/* MixxGlass card container */}
          <div className="mg-panel p-6 sm:p-8">
            <div className="mg-shimmer" />
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
