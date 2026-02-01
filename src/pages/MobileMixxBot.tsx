import { useEffect, useState } from 'react';
import { useFlowNavigation } from '@/core/fabric/useFlow';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { MobileEnhancedNav } from '@/components/mobile/MobileEnhancedNav';
import { EnhancedMobileMixxBot } from '@/components/mobile/EnhancedMobileMixxBot';

export default function MobileMixxBot() {
  const { user, loading } = useAuth();
  const { goToAuth } = useFlowNavigation();

  useEffect(() => {
    if (!loading && !user) {
      goToAuth('login');
    }
  }, [user, loading, goToAuth]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-lg flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
          <span className="ml-2">Loading Mixx Bot...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MobileEnhancedNav />
      <div className="flex-1 overflow-auto touch-manipulation">
        <EnhancedMobileMixxBot />
      </div>
    </div>
  );
}