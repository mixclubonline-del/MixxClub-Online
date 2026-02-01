import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useFlowNavigation } from '@/core/fabric/useFlow';

const AuthCallback = () => {
  const { goToAuth, navigateTo, openArtistCRM, openEngineerCRM } = useFlowNavigation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          toast.error('Authentication failed');
          goToAuth('login');
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
            navigateTo('/admin');
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
            navigateTo('/onboarding/artist');
            return;
          }

          // Redirect based on role
          toast.success('Welcome back!');
          if (profile.role === 'engineer') {
            openEngineerCRM();
          } else {
            openArtistCRM();
          }
        } else {
          goToAuth('login');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        toast.error('Something went wrong');
        goToAuth('login');
      }
    };

    handleCallback();
  }, [goToAuth, navigateTo, openArtistCRM, openEngineerCRM]);

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
