/**
 * @deprecated Use /auth page with AuthWizard instead.
 * Kept for reference during migration - will be removed in future cleanup.
 */
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobileAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'login' | 'signup';
}

export const MobileAuthDialog = ({ open, onOpenChange, mode = 'login' }: MobileAuthDialogProps) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(mode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (error) throw error;

        toast({
          title: "Account created!",
          description: "You can now sign in with your credentials"
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "Successfully signed in"
        });
        onOpenChange(false);
        navigate('/artist-crm');
      }
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!email) {
        toast({
          title: "Email required",
          description: "Please enter your email address",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;
      
      setResetEmailSent(true);
      toast({
        title: "Email sent!",
        description: "Check your inbox for password reset link"
      });
    } catch (error: any) {
      toast({
        title: "Reset failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: `${window.location.origin}/auth/callback`,
      });

      if (result?.error) throw result.error;
    } catch (error: any) {
      toast({
        title: "OAuth failed",
        description: error.message || String(error),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {resetMode ? '🔑 Reset Password' : authMode === 'login' ? '👋 Sign In' : '🎉 Create Account'}
          </DialogTitle>
        </DialogHeader>

        {resetMode ? (
          <form onSubmit={handlePasswordReset} className="space-y-4 py-4">
            {resetEmailSent ? (
              <div className="text-center space-y-4 py-4">
                <p className="text-muted-foreground">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setResetMode(false);
                    setResetEmailSent(false);
                  }}
                  className="w-full h-12"
                >
                  Back to Sign In
                </Button>
              </div>
            ) : (
              <>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                 className="h-12 text-base"
                 autoComplete="email"
                />
                
                <div className="flex gap-3">
                  <Button 
                    type="submit" 
                    className="flex-1 h-12"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setResetMode(false)}
                    className="flex-1 h-12"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </form>
        ) : (
          <form onSubmit={handleAuth} className="space-y-4 py-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
           className="h-12 text-base"
           autoComplete="email"
          />
          
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
           className="h-12 text-base"
           autoComplete={authMode === "signup" ? "new-password" : "current-password"}
          />

          {authMode === 'login' && (
            <button
              type="button"
              onClick={() => setResetMode(true)}
              className="text-sm text-primary hover:underline text-left"
            >
              Forgot Password?
            </button>
          )}

          <div className="flex gap-3">
            <Button 
              type="submit" 
              className="flex-1 h-12"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                authMode === 'login' ? 'Sign In' : 'Sign Up'
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="flex-1 h-12"
              disabled={loading}
            >
              {authMode === 'login' ? 'Sign Up' : 'Sign In'}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuth('google')}
              disabled={loading}
              className="h-12"
            >
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuth('apple')}
              disabled={loading}
              className="h-12"
            >
              Apple
            </Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
