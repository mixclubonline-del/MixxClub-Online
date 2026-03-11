/**
 * ABProvider — Context wrapper for managing active A/B tests across the app.
 *
 * Fetches active tests from the ab_tests table and exposes them via context.
 * Components use useABVariant() directly for variant assignment; this provider
 * gives global visibility into which tests are running.
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ABTest {
  id: string;
  test_name: string;
  description: string | null;
  variants: Array<{ name: string; weight: number }>;
  is_active: boolean;
}

interface ABContextValue {
  tests: ABTest[];
  isLoading: boolean;
  getTest: (testName: string) => ABTest | undefined;
}

const ABContext = createContext<ABContextValue>({
  tests: [],
  isLoading: false,
  getTest: () => undefined,
});

export const useABContext = () => useContext(ABContext);

export const ABProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('ab_tests' as any)
      .select('*')
      .eq('is_active', true)
      .then(({ data, error }) => {
        if (!error && data) {
          setTests(data as unknown as ABTest[]);
        }
        setIsLoading(false);
      });
  }, []);

  const getTest = (testName: string) => tests.find((t) => t.test_name === testName);

  return (
    <ABContext.Provider value={{ tests, isLoading, getTest }}>
      {children}
    </ABContext.Provider>
  );
};
