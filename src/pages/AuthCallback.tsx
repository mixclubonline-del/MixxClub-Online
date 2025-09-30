import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          toast.error('Authentication failed');
          navigate('/auth');
          return;
        }

        if (session?.user) {
          // Check if user has a profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          // If no profile exists or no role set, redirect to onboarding
          if (!profile || !profile.role) {
            toast.success('Please complete your profile');
            navigate('/onboarding/artist');
            return;
          }

          // Redirect based on role
          toast.success('Welcome back!');
          if (profile.role === 'engineer') {
            navigate('/engineer-crm');
          } else {
            navigate('/artist-crm');
          }
        } else {
          navigate('/auth');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        toast.error('Something went wrong');
        navigate('/auth');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
