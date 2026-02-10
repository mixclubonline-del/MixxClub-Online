import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';
import PrimeLanding from '@/components/prime/PrimeLanding';

export default function MixClubHome() {
  const { user, loading, userRole } = useAuth();
  const navigate = useNavigate();

  // Authenticated users bypass the marketing funnel
  useEffect(() => {
    if (loading || !user) return;

    const crmMap: Record<string, string> = {
      admin: '/admin',
      producer: '/producer-crm',
      engineer: '/engineer-crm',
      fan: '/fan-hub',
      artist: '/artist-crm',
    };

    if (userRole && crmMap[userRole]) {
      navigate(crmMap[userRole], { replace: true });
    } else {
      // Authenticated but no role yet
      navigate('/select-role', { replace: true });
    }
  }, [user, loading, userRole, navigate]);

  // Show marketing funnel for unauthenticated visitors
  if (user) {
    // Render nothing while redirecting
    return null;
  }

  return (
    <>
      <Helmet>
        <title>MIXXCLUB — From Bedroom to Billboard</title>
        <meta 
          name="description" 
          content="Transform your sound with AI-powered tools, professional engineers, and a collaborative network. From bedroom recordings to radio-ready tracks." 
        />
        <meta name="keywords" content="MIXXCLUB, music mixing, mastering, AI studio, music collaboration, professional engineers, music production" />
      </Helmet>

      <div className="min-h-screen">
        <PrimeLanding />
      </div>
    </>
  );
}
