import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();
  const processedRef = useRef(false);

  useEffect(() => {
    // Prevent double processing
    if (processedRef.current) return;
    processedRef.current = true;

    const handleCallback = async () => {
      try {
        // Get the session from the URL hash (magic link flow)
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          toast.error('Authentication failed. Please try again.');
          navigate('/auth');
          return;
        }

        if (!session?.user) {
          navigate('/auth');
          return;
        }

        const user = session.user;

        // Check if user is admin first
        const { data: isAdminUser } = await supabase.rpc('has_role', { 
          _user_id: user.id,
          _role: 'admin'
        });

        if (isAdminUser) {
          toast.success('Welcome back, Admin!');
          navigate('/admin');
          return;
        }

        // Check if user already has a role assigned
        const { data: existingRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        const hasRole = existingRoles && existingRoles.length > 0;

        // If new user with role metadata, assign the role
        if (!hasRole && user.user_metadata?.role) {
          const selectedRole = user.user_metadata.role as 'producer' | 'artist' | 'engineer' | 'fan';
          
          try {
            await supabase
              .from('user_roles')
              .insert([{ user_id: user.id, role: selectedRole }]);
          } catch (roleErr) {
            console.error('Failed to assign role:', roleErr);
            // Continue anyway - role can be set later
          }
        }

        // Get user profile to determine routing
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, onboarding_completed')
          .eq('id', user.id)
          .single();

        // Determine role for routing (from profile, user_roles, or metadata)
        let userRole = profile?.role;
        if (!userRole && existingRoles?.[0]?.role) {
          userRole = existingRoles[0].role;
        }
        if (!userRole && user.user_metadata?.role) {
          userRole = user.user_metadata.role;
        }

        // If no role set anywhere, redirect to role selection
        if (!userRole) {
          toast.success('Choose your path in MixClub');
          navigate('/select-role');
          return;
        }

        // Check if onboarding is complete
        const onboardingComplete = profile?.onboarding_completed;

        // Route based on role
        toast.success('Welcome to MixClub!');
        
        if (!onboardingComplete) {
          // Route to role-specific onboarding (canonical paths)
          navigate(`/onboarding/${userRole || 'artist'}`);
        } else {
          // Route to role-specific CRM/hub
          const crmMap: Record<string, string> = {
            producer: '/producer-crm',
            engineer: '/engineer-crm',
            fan: '/fan-hub',
            artist: '/artist-crm',
          };
          navigate(crmMap[userRole] || '/artist-crm');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        toast.error('Something went wrong. Please try again.');
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
