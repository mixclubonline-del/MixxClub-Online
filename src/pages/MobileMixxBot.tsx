import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { MobileMixxBot as MobileMixxBotComponent } from '@/components/mobile/MobileMixxBot';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';

export default function MobileMixxBot() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.rpc('is_admin', { user_uuid: user.id });
      
      if (error || !data) {
        navigate('/');
        return;
      }

      setIsAdmin(true);
    };

    if (!loading) {
      checkAdmin();
    }
  }, [user, loading, navigate]);

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading Mixx Bot...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background pb-16">
      <MobileMixxBotComponent onClose={() => navigate('/mobile-admin')} />
      <MobileBottomNav />
    </div>
  );
}