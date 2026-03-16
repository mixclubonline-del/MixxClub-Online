import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { CRMPortal } from '@/components/crm/CRMPortal';
import { Users, Headphones, DollarSign, Shield, Activity, Eye, Brain, Rocket, Flag, ToggleLeft, Mic2, Piano, Heart } from 'lucide-react';
import { useAdminPreview } from '@/stores/useAdminPreview';
import { toast } from 'sonner';

// Admin hub components
import { AdminDashboardHub } from '@/components/admin/AdminDashboardHub';
import { AdminUsersHub } from '@/components/admin/AdminUsersHub';
import { AdminSessionsHub } from '@/components/admin/AdminSessionsHub';
import { AdminRevenueHub } from '@/components/admin/AdminRevenueHub';
import { AdminContentHub } from '@/components/admin/AdminContentHub';
import { AdminCommunityHub } from '@/components/admin/AdminCommunityHub';
import { AdminAssetsHub } from '@/components/admin/AdminAssetsHub';
import { AdminSystemHub } from '@/components/admin/AdminSystemHub';
import { AdminPrimeBrainHub } from '@/components/admin/AdminPrimeBrainHub';
import { AdminAnalyticsDashboard } from '@/components/admin/AdminAnalyticsDashboard';
import { BrandingManager } from '@/components/admin/BrandingManager';
import { AdminSupportInbox } from '@/components/admin/AdminSupportInbox';
import { AdminAuditLogViewer } from '@/components/admin/AdminAuditLogViewer';
import { AdminPartnershipsHub } from '@/components/admin/AdminPartnershipsHub';
import { AdminBroadcastHub } from '@/components/admin/AdminBroadcastHub';
import { AdminLaunchHub } from '@/components/admin/AdminLaunchHub';
import { AdminScreenshotTool } from '@/components/admin/AdminScreenshotTool';
import { AdminModerationQueue } from '@/components/admin/AdminModerationQueue';
import { AdminFeatureFlagsHub } from '@/components/admin/AdminFeatureFlagsHub';
import { lazy, Suspense } from 'react';
const PromoStudio = lazy(() => import('@/pages/PromoStudio'));

const AdminCRM = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';
  const { enterPreview } = useAdminPreview();

  const [profile, setProfile] = useState<any>(null);
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    activeSessions: 0,
    totalRevenue: 0,
    securityEvents: 0,
  });
  const [loading, setLoading] = useState(true);

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchAdminData();
  }, [user, navigate]);

  const fetchAdminData = async () => {
    try {
      const [
        { data: profileData },
        { count: userCount },
        { count: sessionCount },
        { data: revenueData },
        { count: eventCount },
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user?.id).maybeSingle(),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('collaboration_sessions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('payments').select('amount').eq('status', 'completed'),
        supabase.from('admin_security_events').select('*', { count: 'exact', head: true }).eq('is_resolved', false),
      ]);

      setProfile(profileData);
      const totalRevenue = revenueData?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      setPlatformStats({
        totalUsers: userCount || 0,
        activeSessions: sessionCount || 0,
        totalRevenue,
        securityEvents: eventCount || 0,
      });
    } catch (error) {
      console.error('Failed to load admin data:', error);
      toast.error('Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Platform Command Center...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      icon: <Users className="w-4 h-4 text-blue-500" />,
      label: 'Users',
      value: platformStats.totalUsers,
      color: 'bg-blue-500/10',
    },
    {
      icon: <Headphones className="w-4 h-4 text-green-500" />,
      label: 'Active',
      value: platformStats.activeSessions,
      color: 'bg-green-500/10',
    },
    {
      icon: <DollarSign className="w-4 h-4 text-yellow-500" />,
      label: 'Revenue',
      value: `$${platformStats.totalRevenue.toLocaleString()}`,
      color: 'bg-yellow-500/10',
    },
    {
      icon: <Shield className="w-4 h-4 text-red-500" />,
      label: 'Alerts',
      value: platformStats.securityEvents,
      color: 'bg-red-500/10',
    },
  ];


  const quickActions = [
    {
      label: 'Manage Users',
      icon: <Users className="w-4 h-4" />,
      onClick: () => handleTabChange('users'),
    },
    {
      label: 'View Revenue',
      icon: <DollarSign className="w-4 h-4" />,
      onClick: () => handleTabChange('revenue'),
    },
    {
      label: 'View as Artist',
      icon: <Eye className="w-4 h-4" />,
      onClick: () => {
        enterPreview('artist');
        navigate('/artist-crm');
      },
    },
    {
      label: 'System Controls',
      icon: <Shield className="w-4 h-4" />,
      onClick: () => handleTabChange('system'),
    },
    {
      label: 'Promo Studio',
      icon: <Rocket className="w-4 h-4" />,
      onClick: () => handleTabChange('promo'),
    },
    {
      label: 'Prime Brain',
      icon: <Brain className="w-4 h-4" />,
      onClick: () => handleTabChange('prime'),
      variant: 'default' as const,
    },
  ];

  const renderContent = () => {
    switch (currentTab) {
      case 'users':
        return <AdminUsersHub />;
      case 'sessions':
        return <AdminSessionsHub />;
      case 'revenue':
        return <AdminRevenueHub />;
      case 'content':
        return <AdminContentHub />;
      case 'moderation':
        return <AdminModerationQueue />;
      case 'features':
        return <AdminFeatureFlagsHub />;
      case 'community':
        return <AdminCommunityHub />;
      case 'assets':
        return <AdminAssetsHub />;
      case 'system':
        return <AdminSystemHub />;
      case 'prime':
        return <AdminPrimeBrainHub />;
      case 'promo':
        return <Suspense fallback={null}><PromoStudio /></Suspense>;
      case 'analytics':
        return <AdminAnalyticsDashboard />;
      case 'branding':
        return <BrandingManager />;
      case 'support':
        return <AdminSupportInbox />;
      case 'audit':
        return <AdminAuditLogViewer />;
      case 'partnerships':
        return <AdminPartnershipsHub />;
      case 'broadcast':
        return <AdminBroadcastHub />;
      case 'launch':
        return <AdminLaunchHub />;
      case 'screenshots':
        return <AdminScreenshotTool />;
      default:
        return <AdminDashboardHub />;
    }
  };

  return (
    <ErrorBoundary>
      <CRMPortal
        userType="admin"
        profile={profile}
        stats={stats}
        quickActions={quickActions}
        activeTab={currentTab}
        onTabChange={handleTabChange}
      >
        {renderContent()}
      </CRMPortal>
    </ErrorBoundary>
  );
};

export default AdminCRM;
