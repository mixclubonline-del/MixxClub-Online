import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { errorLogger } from '@/services/errorLogger';

export const useAdminAuth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        errorLogger.logAction('admin_access_denied', { reason: 'No user' });
        navigate('/auth');
        return;
      }

      try {
        const { data, error } = await supabase.rpc('is_admin', { 
          user_uuid: user.id 
        });

        if (error) throw error;

        if (!data) {
          errorLogger.log(
            new Error('Admin access denied'),
            {
              userId: user.id,
              page: 'admin',
              action: 'access_check',
            }
          );
          navigate('/');
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error('Error checking admin access:', error);
        errorLogger.log(
          error as Error,
          {
            userId: user.id,
            page: 'admin',
            action: 'access_check_error',
          }
        );
        navigate('/');
      } finally {
        setChecking(false);
      }
    };

    if (!loading) {
      checkAdminAccess();
    }
  }, [user, loading, navigate]);

  return { isAdmin, checking: loading || checking };
};