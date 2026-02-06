import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUnlockContribution } from '@/hooks/useUnlockContribution';
import { attributionToasts } from '@/components/unlock/UnlockAttributionToast';
import { motion } from 'framer-motion';
import { Mic2, Headphones, Disc3, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

type AppRole = 'artist' | 'engineer' | 'producer' | 'fan';

interface RoleOption {
  id: AppRole;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  borderColor: string;
  shadowColor: string;
  keyHint: string;
}

const roleOptions: RoleOption[] = [
  {
    id: 'producer',
    title: 'Producer',
    subtitle: 'Craft & Sell',
    description: 'Create beats, build your catalog, and license your sound to artists worldwide.',
    icon: <Disc3 className="w-8 h-8" />,
    gradient: 'from-amber-500/30 to-orange-600/20',
    borderColor: 'border-amber-400',
    shadowColor: 'shadow-amber-500/30',
    keyHint: '1',
  },
  {
    id: 'artist',
    title: 'Artist',
    subtitle: 'Create & Release',
    description: 'Upload your tracks, find engineers, and release your music to the world.',
    icon: <Mic2 className="w-8 h-8" />,
    gradient: 'from-primary/30 to-purple-600/20',
    borderColor: 'border-primary',
    shadowColor: 'shadow-primary/30',
    keyHint: '2',
  },
  {
    id: 'engineer',
    title: 'Engineer',
    subtitle: 'Mix & Earn',
    description: 'Offer your mixing and mastering services, build your clientele, and get paid.',
    icon: <Headphones className="w-8 h-8" />,
    gradient: 'from-cyan-500/30 to-blue-600/20',
    borderColor: 'border-cyan-400',
    shadowColor: 'shadow-cyan-500/30',
    keyHint: '3',
  },
  {
    id: 'fan',
    title: 'Fan',
    subtitle: 'Discover & Support',
    description: 'Follow artists early, earn Day 1 status, and unlock rewards as they grow.',
    icon: <Heart className="w-8 h-8" />,
    gradient: 'from-pink-500/30 to-rose-600/20',
    borderColor: 'border-pink-400',
    shadowColor: 'shadow-pink-500/30',
    keyHint: '4',
  },
];

const RoleSelection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getContributionMessage } = useUnlockContribution();
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keyboard navigation (1-4 keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitting) return;
      
      const keyMap: Record<string, AppRole> = {
        '1': 'producer',
        '2': 'artist',
        '3': 'engineer',
        '4': 'fan',
      };
      
      if (keyMap[e.key]) {
        handleRoleSelect(keyMap[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting]);

  const handleRoleSelect = async (role: AppRole) => {
    if (isSubmitting || !user) return;
    
    setSelectedRole(role);
    setIsSubmitting(true);

    try {
      // Insert role into user_roles table
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: user.id, role });

      if (roleError) {
        // If role already exists, that's fine - just proceed
        if (!roleError.message.includes('duplicate')) {
          console.error('Failed to assign role:', roleError);
          toast.error('Failed to save your role. Please try again.');
          setIsSubmitting(false);
          setSelectedRole(null);
          return;
        }
      }

      // Update profiles table with role for routing
      await supabase
        .from('profiles')
        .update({ role })
        .eq('id', user.id);

      // Show attribution toast
      const contribution = getContributionMessage('user_count', 'Your signup');
      attributionToasts.userJoined(contribution);

      toast.success(`Welcome to MixClub as a ${role}!`);
      
      // Navigate to role-specific onboarding
      navigate(`/onboarding/${role}`);
    } catch (err) {
      console.error('Role selection error:', err);
      toast.error('Something went wrong. Please try again.');
      setIsSubmitting(false);
      setSelectedRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-4">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-4xl"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-3"
          >
            Choose Your Path in MixClub
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground text-lg"
          >
            Select how you want to participate in the community
          </motion.p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {roleOptions.map((role, index) => (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
              onClick={() => handleRoleSelect(role.id)}
              disabled={isSubmitting}
              className={`
                relative group text-left p-6 rounded-2xl border-2 transition-all duration-300
                bg-gradient-to-br ${role.gradient}
                ${selectedRole === role.id 
                  ? `${role.borderColor} ${role.shadowColor} shadow-lg scale-[1.02]` 
                  : 'border-white/10 hover:border-white/30'}
                ${isSubmitting && selectedRole !== role.id ? 'opacity-50' : ''}
                hover:scale-[1.02] active:scale-[0.98]
                disabled:cursor-not-allowed
              `}
            >
              {/* Selection indicator */}
              {selectedRole === role.id && (
                <motion.div
                  layoutId="selection"
                  className="absolute inset-0 rounded-2xl bg-white/5"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}

              {/* Key hint badge */}
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-xs text-white/60 font-mono">{role.keyHint}</span>
              </div>

              {/* Content */}
              <div className="relative z-10 flex flex-col gap-4">
                <div className={`
                  w-14 h-14 rounded-xl flex items-center justify-center
                  bg-white/10 group-hover:bg-white/20 transition-colors
                  ${selectedRole === role.id ? 'bg-white/20' : ''}
                `}>
                  <span className={selectedRole === role.id ? 'text-white' : 'text-white/70'}>
                    {role.icon}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{role.title}</h3>
                  <p className="text-sm font-medium text-white/70 mb-2">{role.subtitle}</p>
                  <p className="text-sm text-white/50 leading-relaxed">{role.description}</p>
                </div>
              </div>

              {/* Loading spinner when selected */}
              {selectedRole === role.id && isSubmitting && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
                  <div className="w-8 h-8 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Footer hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-muted-foreground/60 text-sm mt-8"
        >
          Press <kbd className="px-2 py-1 rounded bg-white/10 font-mono text-xs">1</kbd> - <kbd className="px-2 py-1 rounded bg-white/10 font-mono text-xs">4</kbd> or click to select
        </motion.p>
      </motion.div>
    </div>
  );
};

export default RoleSelection;
