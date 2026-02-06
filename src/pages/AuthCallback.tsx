import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUnlockContribution } from '@/hooks/useUnlockContribution';
import { attributionToasts } from '@/components/unlock/UnlockAttributionToast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { getContributionMessage } = useUnlockContribution();

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
          // Check if user is admin first
          const { data: isAdminUser } = await supabase.rpc('has_role', { 
            _user_id: session.user.id,
            _role: 'admin'
          });

          if (isAdminUser) {
            toast.success('Welcome back, Admin!');
            navigate('/admin');
            return;
          }

          // Check if user has a profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          // If no profile exists or no role set, redirect to onboarding
          if (!profile || !profile.role) {
            toast.success('Please complete your profile');
            // Show welcome attribution toast for new signups
            const contribution = getContributionMessage('user_count', 'Your signup');
            attributionToasts.userJoined(contribution);
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
