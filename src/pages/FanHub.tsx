 import { useState } from 'react';
 import { useSearchParams } from 'react-router-dom';
 import { useAuth } from '@/hooks/useAuth';
 import { CRMPortal } from '@/components/crm/CRMPortal';
 import { 
   Heart, 
   Star, 
   Coins, 
   Compass,
   Sparkles,
   Music
 } from 'lucide-react';
 import { FanFeedHub } from '@/components/crm/fan/FanFeedHub';
 import { FanDay1sHub } from '@/components/crm/fan/FanDay1sHub';
 import { FanMissionsHub } from '@/components/crm/fan/FanMissionsHub';
 import { FanWalletHub } from '@/components/crm/fan/FanWalletHub';
 
 const FanHub = () => {
   const { user } = useAuth();
   const [searchParams, setSearchParams] = useSearchParams();
   const activeTab = searchParams.get('tab') || 'feed';
 
   const handleTabChange = (tab: string) => {
     setSearchParams({ tab });
   };
 
   // Mock profile data
   const profile = {
     id: user?.id,
     full_name: user?.user_metadata?.full_name || 'Fan',
     avatar_url: null,
     tagline: 'Discovering the next wave',
   };
 
   // Fan-specific stats
   const stats = [
     { icon: <Star className="w-4 h-4" />, label: 'Day 1s', value: 0, color: 'text-yellow-500' },
     { icon: <Heart className="w-4 h-4" />, label: 'Following', value: 0, color: 'text-pink-500' },
     { icon: <Coins className="w-4 h-4" />, label: 'MixxCoinz', value: 0, color: 'text-amber-500' },
     { icon: <Sparkles className="w-4 h-4" />, label: 'Streak', value: 0, color: 'text-purple-500' },
   ];
 
   // Fan quick actions
   const quickActions = [
     {
       label: 'Discover Artists',
       icon: <Compass className="w-4 h-4" />,
       onClick: () => handleTabChange('feed'),
       variant: 'default' as const,
     },
     {
       label: 'Earn Coinz',
       icon: <Coins className="w-4 h-4" />,
       onClick: () => handleTabChange('missions'),
       variant: 'outline' as const,
     },
   ];
 
   const renderContent = () => {
     switch (activeTab) {
       case 'day1s':
         return <FanDay1sHub />;
       case 'missions':
         return <FanMissionsHub />;
       case 'wallet':
         return <FanWalletHub />;
       case 'feed':
       default:
         return <FanFeedHub />;
     }
   };
 
   return (
     <CRMPortal
       userType="fan"
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
 
 export default FanHub;