import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Disc3, Mic2, Headphones, Heart, Upload, UserCircle, Users, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/config/routes';

type AppRole = 'producer' | 'artist' | 'engineer' | 'fan';
type Step = 'role' | 'credentials' | 'action';
type AuthMode = 'signup' | 'login';

const ROLES = [
  { id: 'producer' as const, label: 'Producer', tagline: 'I make beats', icon: Disc3 },
  { id: 'artist' as const, label: 'Artist', tagline: 'I make music', icon: Mic2 },
  { id: 'engineer' as const, label: 'Engineer', tagline: 'I mix & master', icon: Headphones },
  { id: 'fan' as const, label: 'Fan', tagline: 'I discover & support', icon: Heart },
] as const;

const ACTIONS: { label: string; desc: string; icon: typeof Upload; route?: string; routeFn?: (role: AppRole) => string }[] = [
  { label: 'Upload a Track', desc: 'Get your music mixed or mastered', icon: Upload, route: ROUTES.UPLOAD },
  { label: 'Create Profile', desc: 'Set up your presence on MixClub', icon: UserCircle, routeFn: (role: AppRole) => `/onboarding/${role}` },
  { label: 'Browse Engineers', desc: 'Find your perfect mix engineer', icon: Users, route: ROUTES.ENGINEERS },
];

export default function QuickStart() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('role');
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-advance to action step when auth completes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user && step === 'credentials') {
        // Persist role
        if (selectedRole) {
          await supabase.from('user_roles').insert({ user_id: session.user.id, role: selectedRole }).select();
        }
        setStep('action');
      }
    });
    return () => subscription.unsubscribe();
  }, [step, selectedRole]);

  // Check if already authenticated on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setStep('action');
    });
  }, []);

  const handleRoleSelect = (role: AppRole) => {
    setSelectedRole(role);
    setStep('credentials');
  };

  const handleEmailAuth = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (authMode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (signUpError) throw signUpError;
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }, [email, password, authMode]);

  const handleOAuth = useCallback(async (provider: 'google' | 'apple') => {
    setError(null);
    setLoading(true);
    try {
      const { error: oauthError } = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: `${window.location.origin}/auth/callback`,
      });
      if (oauthError) throw oauthError;
    } catch (err: any) {
      setError(err.message || 'OAuth failed');
      setLoading(false);
    }
  }, []);

  const stepIndex = step === 'role' ? 0 : step === 'credentials' ? 1 : 2;

  return (
    <div className="min-h-[100svh] bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">

        {/* Progress bar */}
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i <= stepIndex ? 'w-10 bg-primary' : 'w-8 bg-muted'
              }`}
            />
          ))}
        </div>

        {/* ─── Step 1: Role ─── */}
        {step === 'role' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold text-foreground">What brings you to MixClub?</h1>
              <p className="text-muted-foreground text-sm">Pick your role — you can always change it later.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map(({ id, label, tagline, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleRoleSelect(id)}
                  className="flex flex-col items-center gap-2 rounded-xl p-5 bg-card border border-border
                    hover:border-primary/50 hover:bg-accent/30 transition-all active:scale-[0.97]"
                >
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-semibold text-sm text-foreground">{label}</span>
                  <span className="text-[11px] text-muted-foreground">{tagline}</span>
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Already have an account?{' '}
              <button type="button" onClick={() => { setAuthMode('login'); setStep('credentials'); }} className="text-primary hover:underline font-medium">
                Sign in
              </button>
            </p>
          </div>
        )}

        {/* ─── Step 2: Credentials ─── */}
        {step === 'credentials' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="text-center space-y-1">
              <h1 className="text-xl font-bold text-foreground">
                {authMode === 'signup' ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="text-muted-foreground text-sm">
                {authMode === 'signup' ? 'Sign up to get started' : 'Sign in to your account'}
              </p>
            </div>

            {/* OAuth buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => handleOAuth('google')}
                disabled={loading}
                className="h-11"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => handleOAuth('apple')}
                disabled={loading}
                className="h-11"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                Apple
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Email/Password form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-11"
              />
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
              )}

              <Button type="submit" disabled={loading} className="w-full h-11 font-medium">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {authMode === 'signup' ? 'Create Account' : 'Sign In'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground">
              {authMode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => { setAuthMode(authMode === 'signup' ? 'login' : 'signup'); setError(null); }}
                className="text-primary hover:underline font-medium"
              >
                {authMode === 'signup' ? 'Sign in' : 'Sign up'}
              </button>
            </p>

            <button
              type="button"
              onClick={() => setStep('role')}
              className="block mx-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Change role
            </button>
          </div>
        )}

        {/* ─── Step 3: First Action ─── */}
        {step === 'action' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="text-center space-y-1">
              <h1 className="text-xl font-bold text-foreground">You're in. What's first?</h1>
              <p className="text-muted-foreground text-sm">Pick your first move — you can explore everything later.</p>
            </div>
            <div className="space-y-3">
              {ACTIONS.map((action) => {
                const Icon = action.icon || UserCircle;
                const dest = 'routeFn' in action && selectedRole ? action.routeFn(selectedRole) : action.route;
                return (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => navigate(dest)}
                    className="w-full flex items-center gap-4 rounded-xl p-4 bg-card border border-border
                      hover:border-primary/50 hover:bg-accent/30 transition-all text-left active:scale-[0.98]"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-foreground">{action.label}</span>
                      <p className="text-xs text-muted-foreground">{action.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
