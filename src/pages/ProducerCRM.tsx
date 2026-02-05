 import { useState } from 'react';
 import { useSearchParams } from 'react-router-dom';
 import { useAuth } from '@/hooks/useAuth';
 import { CRMPortal } from '@/components/crm/CRMPortal';
 import { 
   Disc3, 
   ShoppingBag, 
   Users, 
   TrendingUp, 
   Upload,
   Sparkles
 } from 'lucide-react';
 import { ProducerDashboardHub } from '@/components/crm/producer/ProducerDashboardHub';
 import { ProducerCatalogHub } from '@/components/crm/producer/ProducerCatalogHub';
 import { ProducerSalesHub } from '@/components/crm/producer/ProducerSalesHub';
 import { ProducerCollabsHub } from '@/components/crm/producer/ProducerCollabsHub';
 
 const ProducerCRM = () => {
   const { user } = useAuth();
   const [searchParams, setSearchParams] = useSearchParams();
   const activeTab = searchParams.get('tab') || 'dashboard';
 
   const handleTabChange = (tab: string) => {
     setSearchParams({ tab });
   };
 
   // Mock profile data - will be fetched from DB
   const profile = {
     id: user?.id,
     full_name: user?.user_metadata?.full_name || 'Producer',
     avatar_url: null,
     tagline: 'Making beats that move the culture',
   };
 
   // Producer-specific stats
   const stats = [
     { icon: <Disc3 className="w-4 h-4" />, label: 'Beats', value: 0, color: 'text-amber-500' },
     { icon: <ShoppingBag className="w-4 h-4" />, label: 'Sales', value: 0, color: 'text-green-500' },
     { icon: <TrendingUp className="w-4 h-4" />, label: 'Plays', value: 0, color: 'text-blue-500' },
     { icon: <Users className="w-4 h-4" />, label: 'Collabs', value: 0, color: 'text-purple-500' },
   ];
 
   // Producer quick actions
   const quickActions = [
     {
       label: 'Upload Beat',
       icon: <Upload className="w-4 h-4" />,
       onClick: () => handleTabChange('catalog'),
       variant: 'default' as const,
     },
     {
       label: 'Find Artists',
       icon: <Sparkles className="w-4 h-4" />,
       onClick: () => handleTabChange('collabs'),
       variant: 'outline' as const,
     },
   ];
 
   const renderContent = () => {
     switch (activeTab) {
       case 'catalog':
         return <ProducerCatalogHub />;
       case 'sales':
         return <ProducerSalesHub />;
       case 'collabs':
         return <ProducerCollabsHub />;
       case 'dashboard':
       default:
         return <ProducerDashboardHub />;
     }
   };
 
   return (
     <CRMPortal
       userType="producer"
       profile={profile}
       stats={stats}
       quickActions={quickActions}
       activeTab={activeTab}
       onTabChange={handleTabChange}
     >
       {renderContent()}
     </CRMPortal>
   );
 };
 
 export default ProducerCRM;