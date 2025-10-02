import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { MobileEnhancedNav } from '@/components/mobile/MobileEnhancedNav';
import { EnhancedMobileMixxBot } from '@/components/mobile/EnhancedMobileMixxBot';

export default function MobileMixxBot() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

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
    <div className="h-screen flex flex-col bg-background">
      <MobileEnhancedNav />
      <div className="flex-1 overflow-hidden">
        <EnhancedMobileMixxBot />
      </div>
    </div>
  );
}