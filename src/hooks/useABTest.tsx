import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ABTestVariant = Database['public']['Tables']['ab_test_variants']['Row'];

interface ABTestResult {
  variant: string;
  config: Record<string, any>;
  trackImpression: () => Promise<void>;
  trackConversion: () => Promise<void>;
}

export const useABTest = (testName: string): ABTestResult => {
  const [variant, setVariant] = useState<ABTestVariant | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>('control');

  useEffect(() => {
    loadTest();
  }, [testName]);

  const loadTest = async () => {
    try {
      // Check localStorage for existing assignment
      const storageKey = `ab_test_${testName}`;
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        const { variant: storedVariant, timestamp } = JSON.parse(stored);
        // Keep assignment for 30 days
        if (Date.now() - timestamp < 30 * 24 * 60 * 60 * 1000) {
          setSelectedVariant(storedVariant);
          // Load variant config
          const { data } = await supabase
            .from('ab_test_variants')
            .select('*')
            .eq('test_name', testName)
            .eq('variant_name', storedVariant)
            .single();
          
          if (data) setVariant(data);
          return;
        }
      }

      // Load all variants for this test
      const { data: variants, error } = await supabase
        .from('ab_test_variants')
        .select('*')
        .eq('test_name', testName)
        .order('variant_name');

      if (error) throw error;
      if (!variants || variants.length === 0) {
        setSelectedVariant('control');
        return;
      }

      // Weighted random selection based on traffic_percentage
      const rand = Math.random() * 100;
      let cumulative = 0;
      let selected = variants[0];

      for (const v of variants) {
        cumulative += v.traffic_percentage || 50;
        if (rand <= cumulative) {
          selected = v;
          break;
        }
      }

      setVariant(selected);
      setSelectedVariant(selected.variant_name);

      // Store assignment
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          variant: selected.variant_name,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error('Error loading A/B test:', error);
      setSelectedVariant('control');
    }
  };

  const trackImpression = async () => {
    if (!variant) return;

    try {
      await supabase
        .from('ab_test_variants')
        .update({ impressions: (variant.impressions || 0) + 1 })
        .eq('id', variant.id);
    } catch (error) {
      console.error('Error tracking impression:', error);
    }
  };

  const trackConversion = async () => {
    if (!variant) return;

    try {
      await supabase
        .from('ab_test_variants')
        .update({ conversions: (variant.conversions || 0) + 1 })
        .eq('id', variant.id);
    } catch (error) {
      console.error('Error tracking conversion:', error);
    }
  };

  return {
    variant: selectedVariant,
    config: (variant?.variant_config as Record<string, any>) || {},
    trackImpression,
    trackConversion,
  };
};
