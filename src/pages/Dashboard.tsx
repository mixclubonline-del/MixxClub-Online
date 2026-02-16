import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

/**
 * Dashboard is a redirect-only pass-through.
 * It waits for the auth role to resolve, then sends the user
 * to the correct role-specific CRM hub.
 */
const Dashboard = () => {
  const { activeRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

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
        // No role resolved — shouldn't happen inside ProtectedRoute, but safe fallback
        navigate('/city', { replace: true });
        break;
    }
  }, [activeRole, loading, navigate]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
};

export default Dashboard;
