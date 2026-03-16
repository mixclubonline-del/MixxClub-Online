import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type AppRole = 'artist' | 'engineer' | 'producer' | 'fan';

interface UseRoleSelectionOptions {
  onSuccess?: (role: AppRole) => void;
}

export function useRoleSelection(options?: UseRoleSelectionOptions) {
  const navigate = useNavigate();
  const { user, refreshRoles } = useAuth();
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectRole = async (role: AppRole) => {
    if (isSubmitting || !user) return;

    setSelectedRole(role);
    setIsSubmitting(true);

    try {
      // Insert role into user_roles table
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: user.id, role });

      if (roleError && !roleError.message.includes('duplicate')) {
        console.error('Failed to assign role:', roleError);
        toast.error('Failed to save your role. Please try again.');
        setIsSubmitting(false);
        setSelectedRole(null);
        return;
      }

      // Update profiles table with role for routing
      await supabase
        .from('profiles')
        .update({ role })
        .eq('id', user.id);

      // Refresh auth context
      await refreshRoles();

      toast.success(`Welcome to Mixxclub as a ${role}!`);

      if (options?.onSuccess) {
        options.onSuccess(role);
      } else {
        // Default: navigate to onboarding
        navigate(`/onboarding/${role}`);
      }
    } catch (err) {
      console.error('Role selection error:', err);
      toast.error('Something went wrong. Please try again.');
      setIsSubmitting(false);
      setSelectedRole(null);
    }
  };

  return { selectedRole, isSubmitting, selectRole };
}
