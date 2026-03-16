import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ProfileField {
  key: string;
  label: string;
  filled: boolean;
}

interface ProfileCompletion {
  percentage: number;
  missingFields: ProfileField[];
  allFields: ProfileField[];
  isComplete: boolean;
  isLoading: boolean;
}

export function useProfileCompletion(): ProfileCompletion {
  const { user } = useAuth();
  const [allFields, setAllFields] = useState<ProfileField[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url, bio, genre_specialties')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile) {
        setAllFields([]);
        setIsLoading(false);
        return;
      }

      const fields: ProfileField[] = [
        {
          key: 'username',
          label: 'Username',
          filled: !!profile.username && profile.username.length >= 3,
        },
        {
          key: 'display_name',
          label: 'Display Name',
          filled: !!(profile.display_name || profile.full_name),
        },
        {
          key: 'avatar_url',
          label: 'Profile Photo',
          filled: !!profile.avatar_url,
        },
        {
          key: 'bio',
          label: 'Bio',
          filled: !!profile.bio && profile.bio.length > 10,
        },
        {
          key: 'genre_specialties',
          label: 'Genre Preferences',
          filled: Array.isArray(profile.genre_specialties) && profile.genre_specialties.length > 0,
        },
      ];

      setAllFields(fields);
      setIsLoading(false);
    };

    fetchProfile();
  }, [user]);

  const filledCount = allFields.filter((f) => f.filled).length;
  const percentage = allFields.length > 0 ? Math.round((filledCount / allFields.length) * 100) : 0;
  const missingFields = allFields.filter((f) => !f.filled);
  const isComplete = missingFields.length === 0 && allFields.length > 0;

  return { percentage, missingFields, allFields, isComplete, isLoading };
}
