/**
 * RevenueHub — Revenue dashboard with GlassPanel design tokens and mobile responsiveness.
 */

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRevenueStreams } from '@/hooks/useRevenueStreams';
import { RevenueOverview } from './revenue/RevenueOverview';
import { RevenueStreamCards } from './revenue/RevenueStreamCards';
import { PaymentIntegration } from './revenue/PaymentIntegration';
import { EarningsTimeline } from './revenue/EarningsTimeline';
import { RevenueGoals } from './revenue/RevenueGoals';
import { RevenueChart } from './revenue/RevenueChart';
import { StreamBreakdown } from './revenue/StreamBreakdown';
import { LayoutDashboard, Wallet, Target, BarChart3, TrendingUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { GlassPanel, HubHeader } from './design';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

interface RevenueHubProps {
  userType: 'artist' | 'engineer' | 'producer';
  userId?: string;
}

const tabOptions = [
  { value: 'overview', label: 'Overview', icon: LayoutDashboard },
  { value: 'payouts', label: 'Payouts', icon: Wallet },
  { value: 'goals', label: 'Goals', icon: Target },
  { value: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export const RevenueHub: React.FC<RevenueHubProps> = ({ userType }) => {
  const { analytics, loading, refetch } = useRevenueStreams();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <HubHeader
        icon={<TrendingUp className="h-5 w-5 text-green-400" />}
        title="Revenue Dashboard"
        subtitle="Track all 10 revenue streams, manage payouts, and set goals"
        accent="rgba(34, 197, 94, 0.5)"
      />

      <GlassPanel glow accent="rgba(34, 197, 94, 0.3)" padding="p-5">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {isMobile ? (
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full bg-white/5 border-white/10">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                {tabOptions.map((tab) => (
                  <SelectItem key={tab.value} value={tab.value}>{tab.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid bg-white/5 border border-white/8">
              {tabOptions.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          )}

          <TabsContent value="overview" className="space-y-6">
            <RevenueOverview analytics={analytics} loading={loading} />
            <RevenueStreamCards
              streams={analytics?.streams || []}
              loading={loading}
              totalRevenue={analytics?.totalRevenue || 0}
            />
            <EarningsTimeline analytics={analytics} loading={loading} />
          </TabsContent>

          <TabsContent value="payouts" className="space-y-6">
            <PaymentIntegration
              analytics={analytics}
              loading={loading}
              onPayoutRequest={refetch}
            />
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <RevenueGoals analytics={analytics} loading={loading} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueChart
                forecasts={analytics?.forecasts || []}
                loading={loading}
              />
              <StreamBreakdown
                streams={analytics?.streams || []}
                loading={loading}
                totalRevenue={analytics?.totalRevenue || 0}
              />
            </div>
          </TabsContent>
        </Tabs>
      </GlassPanel>
    </div>
  );
};

export default RevenueHub;
