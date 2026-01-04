import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UsernameValidation {
  username: string;
  setUsername: (value: string) => void;
  isChecking: boolean;
  isAvailable: boolean | null;
  error: string | null;
  isValid: boolean;
}

export function useUsernameValidation(initialValue = ''): UsernameValidation {
  const { user } = useAuth();
  const [username, setUsernameRaw] = useState(initialValue);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const validateFormat = useCallback((value: string): string | null => {
    if (!value) return null;
    if (value.length < 3) return 'Username must be at least 3 characters';
    if (value.length > 20) return 'Username must be 20 characters or less';
    if (!/^[a-z0-9_]+$/.test(value)) return 'Only lowercase letters, numbers, and underscores';
    if (/^_|_$/.test(value)) return 'Cannot start or end with underscore';
    if (/__/.test(value)) return 'Cannot have consecutive underscores';
    return null;
  }, []);

  const checkAvailability = useCallback(async (value: string) => {
    if (!value || value.length < 3) {
      setIsAvailable(null);
      return;
    }

    setIsChecking(true);
    try {
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', value)
        .maybeSingle();

      if (queryError) throw queryError;

      // If data exists and it's not the current user's username, it's taken
      const isTaken = data && data.id !== user?.id;
      setIsAvailable(!isTaken);
    } catch (err) {
      console.error('Username check error:', err);
      setError('Unable to check availability');
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  }, [user?.id]);

  const setUsername = useCallback((value: string) => {
    // Sanitize input: lowercase, only allowed chars
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20);
    setUsernameRaw(sanitized);
    
    // Reset states
    setError(null);
    setIsAvailable(null);
    
    // Format validation
    const formatError = validateFormat(sanitized);
    if (formatError) {
      setError(formatError);
      return;
    }
    
    // Debounce availability check
    if (debounceTimer) clearTimeout(debounceTimer);
    
    if (sanitized.length >= 3) {
      const timer = setTimeout(() => {
        checkAvailability(sanitized);
      }, 300);
      setDebounceTimer(timer);
    }
  }, [validateFormat, checkAvailability, debounceTimer]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [debounceTimer]);

  const isValid = !error && isAvailable === true && username.length >= 3;

  return {
    username,
    setUsername,
    isChecking,
    isAvailable,
    error,
    isValid,
  };
}
