import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMobileDetect } from '@/hooks/useMobileDetect';
import { Loader2 } from 'lucide-react';
import { ROUTES } from '@/config/routes';

/**
 * Dashboard is a redirect-only pass-through.
 * It waits for the auth role to resolve, then sends the user
 * to the correct role-specific hub.
 * 
 * On mobile (phone), fans go to /mobile-fan and pros go to /mobile-pro.
 */
const Dashboard = () => {
  const { activeRole, loading } = useAuth();
  const { deviceType } = useMobileDetect();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    const isPhone = deviceType === 'phone';

    // Mobile split: fans vs pros
    if (isPhone) {
      if (activeRole === 'fan') {
        navigate(ROUTES.MOBILE_FAN, { replace: true });
      } else {
        navigate(ROUTES.MOBILE_PRO, { replace: true });
      }
      return;
    }

    // Desktop/tablet: role-specific CRMs
    switch (activeRole) {
      case 'admin':
        navigate('/admin', { replace: true });
        break;
      case 'producer':
        navigate('/producer-crm', { replace: true });
        break;
      case 'engineer':
        navigate('/engineer-crm', { replace: true });
        break;
      case 'artist':
        navigate('/artist-crm', { replace: true });
        break;
      case 'fan':
        navigate('/fan-hub', { replace: true });
        break;
      default:
        navigate('/city', { replace: true });
        break;
    }
  }, [activeRole, loading, navigate, deviceType]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
};

export default Dashboard;
