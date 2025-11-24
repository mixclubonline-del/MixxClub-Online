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

export default function ArtistCRMPage() {
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
      case 'dashboard': return <DashboardHub role="artist" />;
      case 'matches': return <div>Matches Hub - Coming Soon</div>;
      case 'active-work': return <ActiveWorkHub />;
      case 'opportunities': return <OpportunitiesHub />;
      case 'revenue': return <RevenueHub />;
      case 'community': return <CommunityHub />;
      case 'growth': return <GrowthHub />;
      default: return <DashboardHub role="artist" />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Artist CRM — MIXXCLUB</title>
        <meta name="description" content="Manage your music career, find collaborators, and grow your audience" />
      </Helmet>
      <CRMLayout>
        {renderHub()}
      </CRMLayout>
    </>
  );
}
