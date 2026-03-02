import { Disc3, Mic2, Headphones, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppRole } from '@/hooks/useAuthWizard';
import { AuthSocialProof } from '../AuthSocialProof';

interface RoleStepProps {
  selectedRole: AppRole | null;
  onSelectRole: (role: AppRole) => void;
  onNext: () => void;
  onSwitchToLogin: () => void;
  error: string | null;
}

const roles: { id: AppRole; label: string; tagline: string; icon: typeof Disc3; color: string }[] = [
  { id: 'producer', label: 'Producer', tagline: 'I make beats', icon: Disc3, color: 'amber' },
  { id: 'artist', label: 'Artist', tagline: 'I make music', icon: Mic2, color: 'primary' },
  { id: 'engineer', label: 'Engineer', tagline: 'I mix & master', icon: Headphones, color: 'cyan' },
  { id: 'fan', label: 'Fan', tagline: 'I discover & support', icon: Heart, color: 'pink' },
];

const colorClasses: Record<string, { selected: string; icon: string; glow: string }> = {
  amber: {
    selected: 'bg-amber-500/30 border-2 border-amber-400 shadow-lg shadow-amber-500/30',
    icon: 'bg-amber-500/40 text-amber-400',
    glow: 'bg-amber-500/20',
  },
  primary: {
    selected: 'bg-primary/30 border-2 border-primary shadow-lg shadow-primary/30',
    icon: 'bg-primary/40 text-primary',
    glow: 'bg-primary/20',
  },
  cyan: {
    selected: 'bg-cyan-500/30 border-2 border-cyan-400 shadow-lg shadow-cyan-500/30',
    icon: 'bg-cyan-500/40 text-cyan-400',
    glow: 'bg-cyan-500/20',
  },
  pink: {
    selected: 'bg-pink-500/30 border-2 border-pink-400 shadow-lg shadow-pink-500/30',
    icon: 'bg-pink-500/40 text-pink-400',
    glow: 'bg-pink-500/20',
  },
};

export function RoleStep({ selectedRole, onSelectRole, onNext, onSwitchToLogin, error }: RoleStepProps) {
  // Auto-advance after role selection for smoother UX
  const handleRoleSelect = (role: AppRole) => {
    onSelectRole(role);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">Choose Your Path</h1>
        <p className="text-white/60 text-sm">What brings you to Mixxclub?</p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2">
        <div className="w-8 h-1 rounded-full bg-primary" />
        <div className="w-8 h-1 rounded-full bg-white/20" />
        <div className="w-8 h-1 rounded-full bg-white/20" />
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-2 gap-3">
        {roles.map(({ id, label, tagline, icon: Icon, color }) => {
          const isSelected = selectedRole === id;
          const colors = colorClasses[color];

          return (
            <button
              key={id}
              type="button"
              onClick={() => handleRoleSelect(id)}
              onKeyDownCapture={(e) => e.stopPropagation()}
              className={`relative flex flex-col items-center justify-center gap-2 rounded-xl p-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${isSelected
                ? colors.selected
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
            >
              {isSelected && (
                <div className={`absolute inset-0 rounded-xl ${colors.glow} animate-fade-in`} />
              )}
              <div
                className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${isSelected ? colors.icon : 'bg-white/10'
                  }`}
              >
                <Icon className={`w-6 h-6 ${isSelected ? '' : 'text-white/60'}`} />
              </div>
              <span className={`relative z-10 font-semibold text-sm ${isSelected ? 'text-white' : 'text-white/70'}`}>
                {label}
              </span>
              <span className="relative z-10 text-[10px] text-white/50 text-center">{tagline}</span>
            </button>
          );
        })}
      </div>

      {/* Error message */}
      {error && (
        <div className="text-red-400 text-sm text-center bg-red-500/10 rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Social Proof */}
      <AuthSocialProof className="pt-2" />

      {/* Continue button */}
      <Button
        type="button"
        onClick={onNext}
        disabled={!selectedRole}
        className="w-full h-12 text-base font-medium"
      >
        Continue
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>

      {/* Switch to login */}
      <div className="text-center">
        <span className="text-white/50 text-sm">Already have an account? </span>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}
