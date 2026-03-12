/**
 * AdminPartnershipsHub — Partnership oversight + marketplace transaction monitoring.
 * Surfaces health scores, pending revenue splits, and marketplace purchases.
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Handshake, HeartPulse, DollarSign, ShoppingBag, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlassPanel, HubHeader, HubSkeleton, EmptyState, StaggeredList } from '@/components/crm/design';

export const AdminPartnershipsHub = () => {
  const [tab, setTab] = useState('partnerships');

  const partnerships = useQuery({
    queryKey: ['admin-partnerships'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partnerships')
        .select('*, partnership_health(health_score, activity_score, payment_score, communication_score, last_calculated_at)')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60_000,
  });

  const pendingSplits = useQuery({
    queryKey: ['admin-pending-splits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('revenue_splits')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60_000,
  });

  const recentPurchases = useQuery({
    queryKey: ['admin-marketplace-purchases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_purchases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60_000,
  });

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHealthBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  return (
    <div className="space-y-6">
      <HubHeader
        icon={<Handshake className="w-5 h-5 text-emerald-400" />}
        title="Partnerships & Marketplace"
        subtitle="Revenue relationships and transaction health"
        accent="rgba(52, 211, 153, 0.35)"
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30">
          <TabsTrigger value="partnerships" className="gap-1.5">
            <HeartPulse className="w-3.5 h-3.5" /> Partnerships
          </TabsTrigger>
          <TabsTrigger value="splits" className="gap-1.5">
            <DollarSign className="w-3.5 h-3.5" /> Pending Splits
            {(pendingSplits.data?.length || 0) > 0 && (
              <Badge variant="outline" className="ml-1 text-[10px] px-1.5 py-0 h-4 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                {pendingSplits.data?.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5" /> Marketplace
          </TabsTrigger>
        </TabsList>

        {/* Partnerships Tab */}
        <TabsContent value="partnerships" className="mt-4">
          {partnerships.isLoading ? (
            <HubSkeleton variant="list" count={5} />
          ) : !partnerships.data?.length ? (
            <EmptyState icon={Handshake} title="No Partnerships" description="No partnerships have been formed yet." />
          ) : (
            <StaggeredList className="space-y-2">
              {partnerships.data.map((p: any) => {
                const health = Array.isArray(p.partnership_health) ? p.partnership_health[0] : p.partnership_health;
                const score = health?.health_score ?? null;
                return (
                  <GlassPanel key={p.id} padding="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground">Partnership {p.id.slice(0, 8)}</span>
                          <Badge variant="outline" className="text-[10px] capitalize">{p.status || 'active'}</Badge>
                          {score !== null && score < 60 && (
                            <Badge variant="outline" className="text-[10px] bg-red-500/20 text-red-400 border-red-500/30 gap-1">
                              <AlertTriangle className="w-3 h-3" /> At Risk
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Created {format(new Date(p.created_at), 'MMM d, yyyy')}
                          {p.partnership_type && ` · ${p.partnership_type}`}
                        </p>
                      </div>
                      {score !== null && (
                        <div className="text-center">
                          <div className={`text-xl font-bold ${getHealthColor(score)}`}>{score}</div>
                          <div className="text-[10px] text-muted-foreground">Health</div>
                        </div>
                      )}
                    </div>
                    {health && (
                      <div className="flex gap-2 mt-3">
                        <Badge variant="outline" className={`text-[10px] ${getHealthBg(health.activity_score || 0)}`}>
                          Activity: {health.activity_score || 0}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] ${getHealthBg(health.payment_score || 0)}`}>
                          Payment: {health.payment_score || 0}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] ${getHealthBg(health.communication_score || 0)}`}>
                          Comms: {health.communication_score || 0}
                        </Badge>
                      </div>
                    )}
                  </GlassPanel>
                );
              })}
            </StaggeredList>
          )}
        </TabsContent>

        {/* Pending Splits Tab */}
        <TabsContent value="splits" className="mt-4">
          {pendingSplits.isLoading ? (
            <HubSkeleton variant="list" count={4} />
          ) : !pendingSplits.data?.length ? (
            <EmptyState icon={DollarSign} title="No Pending Splits" description="All revenue splits have been processed." />
          ) : (
            <StaggeredList className="space-y-2">
              {pendingSplits.data.map((s: any) => (
                <GlassPanel key={s.id} padding="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">${(s.total_amount || 0).toFixed(2)} split</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(s.created_at), 'MMM d, yyyy')}
                        {s.partnership_id && ` · Partnership ${s.partnership_id.slice(0, 8)}`}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>
                  </div>
                </GlassPanel>
              ))}
            </StaggeredList>
          )}
        </TabsContent>

        {/* Marketplace Tab */}
        <TabsContent value="marketplace" className="mt-4">
          {recentPurchases.isLoading ? (
            <HubSkeleton variant="list" count={4} />
          ) : !recentPurchases.data?.length ? (
            <EmptyState icon={ShoppingBag} title="No Transactions" description="No marketplace purchases recorded yet." />
          ) : (
            <StaggeredList className="space-y-2">
              {recentPurchases.data.map((p: any) => (
                <GlassPanel key={p.id} padding="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">${(p.purchase_amount || 0).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        Buyer: {(p.buyer_id || '').slice(0, 8)}… · Seller: {(p.seller_id || '').slice(0, 8)}…
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">{format(new Date(p.created_at), 'MMM d')}</span>
                  </div>
                </GlassPanel>
              ))}
            </StaggeredList>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
