import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SceneBackground } from './SceneBackground';

type AppRole = 'producer' | 'artist' | 'engineer' | 'fan';
type AuthMode = 'signup' | 'login';

const ROLES: { id: AppRole; label: string }[] = [
  { id: 'artist', label: 'Artist' },
  { id: 'producer', label: 'Producer' },
  { id: 'engineer', label: 'Engineer' },
  { id: 'fan', label: 'Fan' },
];

interface Props {
  asset: { url: string | null; isVideo: boolean };
  trackStep: (step: string, data?: Record<string, unknown>) => void;
}

export function SignupScene({ asset, trackStep }: Props) {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Listen for auth completion
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        if (selectedRole) {
          await supabase.from('user_roles').insert({ user_id: session.user.id, role: selectedRole }).select();
        }
        trackStep('signup_completed', { method: email ? 'email' : 'oauth', role: selectedRole });
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        setTimeout(() => navigate(selectedRole ? `/onboarding/${selectedRole}` : '/dashboard'), 1500);
      }
    });
    return () => subscription.unsubscribe();
  }, [selectedRole, email, navigate, trackStep]);

  // Don't auto-redirect — let authenticated users still see the funnel
  // They'll be redirected after signup action only

  const handleEmailAuth = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    trackStep('signup_started', { method: 'email' });
    try {
      if (authMode === 'signup') {
        const { error: err } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }, [email, password, authMode, trackStep]);

  const handleOAuth = useCallback(async (provider: 'google' | 'apple') => {
    setError(null);
    setLoading(true);
    trackStep('signup_started', { method: provider });
    try {
      const { error: err } = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: `${window.location.origin}/auth/callback`,
      });
      if (err) throw err;
    } catch (err: any) {
      setError(err.message || 'OAuth failed');
      setLoading(false);
    }
  }, [trackStep]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-y-auto">
      <SceneBackground asset={asset} kenBurns={false} />
      <div className="relative z-10 px-6 w-full max-w-md space-y-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-2"
        >
          <h2 className="text-4xl sm:text-5xl font-black uppercase text-white tracking-tight">
            Your sound.<br /><span className="text-primary">Elevated.</span>
          </h2>
          <p className="text-sm text-white/60">Sign up in 10 seconds</p>
        </motion.div>

        {/* Role select */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-4 gap-2"
        >
          {ROLES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSelectedRole(id)}
              className={`rounded-lg py-2.5 text-xs font-bold uppercase tracking-wider transition-all
                ${selectedRole === id
                  ? 'bg-primary text-primary-foreground scale-105'
                  : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/10'
                }`}
            >
              {label}
            </button>
          ))}
        </motion.div>

        {/* OAuth */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-3"
        >
          <Button variant="outline" onClick={() => handleOAuth('google')} disabled={loading}
            className="h-11 bg-white/10 border-white/20 text-white hover:bg-white/20">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google
          </Button>
          <Button variant="outline" onClick={() => handleOAuth('apple')} disabled={loading}
            className="h-11 bg-white/10 border-white/20 text-white hover:bg-white/20">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
            Apple
          </Button>
        </motion.div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/20" />
          <span className="text-xs text-white/40">or</span>
          <div className="flex-1 h-px bg-white/20" />
        </div>

        {/* Email form */}
        <motion.form
          onSubmit={handleEmailAuth}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <Input type="email" placeholder="Email address" value={email}
            onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
            className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40" />
          <div className="relative">
            <Input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password}
              onChange={(e) => setPassword(e.target.value)} required minLength={6}
              autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
              className="h-11 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/40" />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white" tabIndex={-1}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full h-11 font-bold uppercase tracking-wider">
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {authMode === 'signup' ? 'Join Mixxclub' : 'Sign In'}
          </Button>
        </motion.form>

        <p className="text-center text-xs text-white/50">
          {authMode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button type="button" onClick={() => { setAuthMode(authMode === 'signup' ? 'login' : 'signup'); setError(null); }}
            className="text-primary hover:underline font-medium">
            {authMode === 'signup' ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}
