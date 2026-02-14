import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { lovable } from '@/integrations/lovable/index';
import { toast } from 'sonner';
import { WizardMode } from '@/hooks/useAuthWizard';

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

interface EmailStepProps {
  email: string;
  onEmailChange: (email: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
  mode: WizardMode;
  onSwitchMode: () => void;
}

export function EmailStep({
  email,
  onEmailChange,
  onSubmit,
  loading,
  error,
  mode,
  onSwitchMode,
}: EmailStepProps) {
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSubmit();
  };

  const handleOAuthSignIn = async (e: React.MouseEvent, provider: 'google' | 'apple') => {
    e.preventDefault();
    e.stopPropagation();

    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">
          {isLogin ? 'Welcome Back' : 'Enter the City'}
        </h1>
        <p className="text-white/60 text-sm">
          {isLogin
            ? 'Sign in to continue your journey'
            : 'We\'ll send you a magic link to sign in'}
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2">
        <div className={`w-8 h-1 rounded-full ${isLogin ? 'bg-white/20' : 'bg-primary'}`} />
        <div className="w-8 h-1 rounded-full bg-primary" />
        <div className="w-8 h-1 rounded-full bg-white/20" />
      </div>

      {/* Email form */}
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
            className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-primary"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 rounded-lg p-3">
            {error}
          </div>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          disabled={loading || googleLoading || !email}
          className="w-full h-12 text-base font-medium"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              Send Magic Link
              <ArrowRight className="w-4 h-4 ml-2" />
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
          className="h-12 bg-white/5 border-white/10 text-white hover:bg-white/10"
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
          className="h-12 bg-white/5 border-white/10 text-white hover:bg-white/10"
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
