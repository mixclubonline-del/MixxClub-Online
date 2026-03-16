import { useState } from 'react';
import { ArrowRight, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { lovable } from '@/integrations/lovable/index';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { WizardMode, AppRole } from '@/hooks/useAuthWizard';
import { Disc3, Mic2, Headphones, Heart } from 'lucide-react';

// Google icon SVG component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

// Apple icon SVG component
const AppleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

type AuthMethod = 'password' | 'magic-link';

const ROLE_META: Record<AppRole, { label: string; icon: typeof Disc3; colorClass: string }> = {
  producer: { label: 'Producer', icon: Disc3, colorClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  artist: { label: 'Artist', icon: Mic2, colorClass: 'bg-primary/20 text-primary border-primary/30' },
  engineer: { label: 'Engineer', icon: Headphones, colorClass: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  fan: { label: 'Fan', icon: Heart, colorClass: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
};

interface EmailStepProps {
  email: string;
  onEmailChange: (email: string) => void;
  password?: string;
  onPasswordChange?: (password: string) => void;
  onSubmit: () => void;
  onPasswordSubmit?: () => void;
  loading: boolean;
  error: string | null;
  mode: WizardMode;
  onSwitchMode: () => void;
  preselectedRole?: AppRole | null;
}

export function EmailStep({
  email,
  onEmailChange,
  password = '',
  onPasswordChange,
  onSubmit,
  onPasswordSubmit,
  loading,
  error,
  mode,
  onSwitchMode,
  preselectedRole,
}: EmailStepProps) {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<AuthMethod>('password');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (authMethod === 'password' && onPasswordSubmit) {
      onPasswordSubmit();
    } else {
      onSubmit();
    }
  };

  const handleOAuthSignIn = async (e: React.MouseEvent, provider: 'google' | 'apple') => {
    e.preventDefault();
    e.stopPropagation();

    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: `${window.location.origin}/auth/callback`,
      });

      if (result?.error) {
        toast.error(String(result.error) || `Failed to sign in with ${provider}`);
        setGoogleLoading(false);
      }
      // Don't reset loading - redirect will happen
    } catch (err) {
      toast.error(`Failed to sign in with ${provider}`);
      setGoogleLoading(false);
    }
  };

  const isLogin = mode === 'login';
  const isPasswordMode = authMethod === 'password';

  return (
    <div className="space-y-6">
      {/* Role badge — shown when pre-selected from hallway door */}
      {preselectedRole && !isLogin && (() => {
        const meta = ROLE_META[preselectedRole];
        const Icon = meta.icon;
        return (
          <div className={`flex items-center justify-center gap-2 py-2 px-4 mx-auto w-fit rounded-full border backdrop-blur-sm ${meta.colorClass}`}>
            <Icon className="w-4 h-4" />
            <span className="text-xs font-semibold tracking-wide">
              Joining as {meta.label}
            </span>
          </div>
        );
      })()}

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">
          {isLogin ? 'Welcome Back' : 'Enter the City'}
        </h1>
        <p className="text-white/60 text-sm">
          {isLogin
            ? 'Sign in to continue your journey'
            : 'Create your account to get started'}
        </p>
      </div>

      {/* Auth method toggle */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
        <button
          type="button"
          onClick={() => setAuthMethod('password')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all ${isPasswordMode
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-white/50 hover:text-white/80'
            }`}
        >
          <Lock className="w-3.5 h-3.5" />
          Email & Password
        </button>
        <button
          type="button"
          onClick={() => setAuthMethod('magic-link')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all ${!isPasswordMode
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-white/50 hover:text-white/80'
            }`}
        >
          <Mail className="w-3.5 h-3.5" />
          Magic Link
        </button>
      </div>

      {/* Email + Password form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white/80">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            onKeyDownCapture={(e) => e.stopPropagation()}
            disabled={loading || googleLoading}
            autoComplete="email"
            autoFocus
            className="h-12 bg-[var(--mg-tint)] border-[var(--mg-edge-subtle)] text-white placeholder:text-white/40 focus:border-primary backdrop-blur-md"
          />
        </div>

        {/* Password field — only shown in password mode */}
        {isPasswordMode && (
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/80">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={isLogin ? 'Enter your password' : 'Create a password (6+ chars)'}
                value={password}
                onChange={(e) => onPasswordChange?.(e.target.value)}
                onKeyDownCapture={(e) => e.stopPropagation()}
                disabled={loading || googleLoading}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                className="h-12 pr-12 bg-[var(--mg-tint)] border-[var(--mg-edge-subtle)] text-white placeholder:text-white/40 focus:border-primary backdrop-blur-md"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 rounded-lg p-3">
            {error}
          </div>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          disabled={loading || googleLoading || !email || (isPasswordMode && !password)}
          className="w-full h-12 text-base font-medium"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isPasswordMode ? (isLogin ? 'Signing in...' : 'Creating account...') : 'Sending...'}
            </>
          ) : isPasswordMode ? (
            <>
              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Send Magic Link
              <Mail className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-black/40 px-3 text-white/40">or continue with</span>
        </div>
      </div>

      {/* OAuth Providers */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={(e) => handleOAuthSignIn(e, 'google')}
          disabled={loading || googleLoading}
          className="h-12 bg-[var(--mg-tint)] border-[var(--mg-edge-subtle)] text-white hover:bg-[var(--mg-tint-mid)] backdrop-blur-sm"
        >
          {googleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <GoogleIcon />
              <span className="ml-2">Google</span>
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={(e) => handleOAuthSignIn(e, 'apple')}
          disabled={loading || googleLoading}
          className="h-12 bg-[var(--mg-tint)] border-[var(--mg-edge-subtle)] text-white hover:bg-[var(--mg-tint-mid)] backdrop-blur-sm"
        >
          {googleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <AppleIcon />
              <span className="ml-2">Apple</span>
            </>
          )}
        </Button>
      </div>

      {/* Switch mode */}
      <div className="text-center">
        <span className="text-white/50 text-sm">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
        </span>
        <button
          type="button"
          onClick={onSwitchMode}
          className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
        >
          {isLogin ? 'Sign up' : 'Sign in'}
        </button>
      </div>
    </div>
  );
}
