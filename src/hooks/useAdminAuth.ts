import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useAdminAuth = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (authLoading) return;
      
      if (!user) {
        setIsAdmin(false);
        setChecking(false);
        return;
      }

      try {
        // Use the has_role RPC function for secure server-side validation
        const { data, error: rpcError } = await supabase
          .rpc('has_role', { _user_id: user.id, _role: 'admin' });

        if (rpcError) {
          console.error('Error checking admin role:', rpcError);
          setError(rpcError.message);
          setIsAdmin(false);
        } else {
          setIsAdmin(data === true);
        }
      } catch (err) {
        console.error('Admin auth check failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsAdmin(false);
      } finally {
        setChecking(false);
      }
    };

    checkAdminRole();
  }, [user, authLoading]);

  return { isAdmin, checking: checking || authLoading, error };
};
