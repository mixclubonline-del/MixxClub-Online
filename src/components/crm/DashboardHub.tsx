import { EnhancedDashboardHub } from './dashboard/EnhancedDashboardHub';
import { useAuth } from '@/hooks/useAuth';

export const DashboardHub = () => {
  const { activeRole } = useAuth();
  const userType = activeRole === 'engineer' ? 'engineer' : 'artist';
  
  return <EnhancedDashboardHub userType={userType} />;
};
