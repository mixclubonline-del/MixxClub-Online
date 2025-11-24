import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { DashboardHub } from '@/components/crm/dashboard/DashboardHub';
import { ActiveWorkHub } from '@/components/crm/ActiveWorkHub';
import { OpportunitiesHub } from '@/components/crm/OpportunitiesHub';
import { RevenueHub } from '@/components/crm/RevenueHub';
import { CommunityHub } from '@/components/crm/CommunityHub';
import { GrowthHub } from '@/components/crm/GrowthHub';
import { EngineerCRMDashboard } from '@/components/crm/EngineerCRMDashboard';

export default function EngineerCRMPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const renderHub = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardHub role="engineer" />;
      case 'matches': return <div>Matches Hub - Coming Soon</div>;
      case 'active-work': return <ActiveWorkHub />;
      case 'opportunities': return <OpportunitiesHub />;
      case 'revenue': return <RevenueHub />;
      case 'community': return <CommunityHub />;
      case 'growth': return <GrowthHub />;
      case 'sessions': return <EngineerCRMDashboard />;
      default: return <DashboardHub role="engineer" />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Engineer CRM — MIXXCLUB</title>
        <meta name="description" content="Manage your audio business, find clients, and scale your income" />
      </Helmet>
      <CRMLayout role="engineer">
        {renderHub()}
      </CRMLayout>
    </>
  );
}
