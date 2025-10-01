import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
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
          description: "Please check your email to verify your account"
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

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "OAuth failed",
        description: error.message,
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
            {authMode === 'login' ? '👋 Sign In' : '🎉 Create Account'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleAuth} className="space-y-4 py-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 text-base"
          />
          
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-12 text-base"
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
      </DialogContent>
    </Dialog>
  );
};
