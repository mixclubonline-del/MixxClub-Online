import { motion } from 'framer-motion';
import { useState } from 'react';
import { Mic2, Sliders, Heart, Loader2, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

type Role = 'artist' | 'engineer' | 'fan';

const roles = [
  { id: 'artist' as Role, label: 'Artist', icon: Mic2, color: 'from-primary to-accent-magenta' },
  { id: 'engineer' as Role, label: 'Engineer', icon: Sliders, color: 'from-accent-blue to-accent-cyan' },
  { id: 'fan' as Role, label: 'Fan', icon: Heart, color: 'from-accent-magenta to-primary' },
];

export function WaitlistSignupForm() {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !selectedRole) {
      toast.error('Please enter your email and select your role');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('waitlist_signups')
        .insert({
          email,
          role: selectedRole,
          source: 'coming-soon',
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('This email is already on the waitlist!');
        } else {
          throw error;
        }
        return;
      }

      setIsSuccess(true);
      
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#EC4899', '#06B6D4'],
      });

      toast.success('Welcome to the connection!');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        className="w-full max-w-md mx-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative p-8 rounded-2xl bg-card/50 backdrop-blur-xl border border-primary/20 text-center">
          <motion.div
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent-magenta flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <Check className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          
          <h3 className="text-xl font-bold text-foreground mb-2">You're In!</h3>
          <p className="text-muted-foreground text-sm">
            The connection is forming. We'll reach out when the portal opens.
          </p>
          
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Welcome to the triangle</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <form onSubmit={handleSubmit} className="relative">
        {/* Glassmorphic card */}
        <div className="relative p-6 md:p-8 rounded-2xl bg-card/50 backdrop-blur-xl border border-border/50 shadow-2xl">
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-accent-magenta/5 pointer-events-none" />
          
          <div className="relative z-10 space-y-6">
            {/* Header */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-1">Join the Connection</h3>
              <p className="text-sm text-muted-foreground">Which triangle point are you?</p>
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-3 gap-3">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`relative p-3 rounded-xl transition-all duration-300 ${
                    selectedRole === role.id
                      ? `bg-gradient-to-br ${role.color} text-primary-foreground shadow-lg scale-105`
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <role.icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{role.label}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Email Input */}
            <div className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-background/50 border-border/50 focus:border-primary/50 text-center"
                required
              />

              <Button
                type="submit"
                disabled={isLoading || !selectedRole}
                className="w-full h-12 bg-gradient-to-r from-primary via-accent-magenta to-accent-blue hover:opacity-90 transition-opacity font-semibold"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Get Early Access'
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
