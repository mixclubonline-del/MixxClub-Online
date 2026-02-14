import { useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Users, Star, BarChart3, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PartnershipRevenue {
    month: string;
    solo: number;
    partnership: number;
}

interface CollectiveData {
    totalPartnershipRevenue: number;
    totalSoloRevenue: number;
    partnershipGrowthRate: number;
    activePartners: number;
    revenueByMonth: PartnershipRevenue[];
    topPartners: { id: string; name: string; revenue: number; sessions: number }[];
}

function useCollectiveAnalytics() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['collective-analytics', user?.id],
        queryFn: async (): Promise<CollectiveData> => {
            if (!user) throw new Error('Not authenticated');

            // Get completed projects (projects has user_id + engineer_id, no amount/artist_id)
            const { data: partnerProjects } = await supabase
                .from('projects')
                .select('id, created_at, status, user_id, engineer_id')
                .or(`user_id.eq.${user.id},engineer_id.eq.${user.id}`)
                .eq('status', 'completed');

            const projects = partnerProjects || [];

            // Partnership = projects where both user_id (artist) and engineer_id are set
            const partnershipProjects = projects.filter(
                (p) => p.user_id && p.engineer_id
            );
            const soloProjects = projects.filter(
                (p) => !p.engineer_id
            );

            // No amount column exists; use project count as proxy
            const totalPartnershipRevenue = partnershipProjects.length;
            const totalSoloRevenue = soloProjects.length;

            // Revenue by month (last 12 months)
            const now = new Date();
            const monthMap = new Map<string, PartnershipRevenue>();
            for (let i = 11; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                monthMap.set(key, { month: key, solo: 0, partnership: 0 });
            }

            projects.forEach((p) => {
                const d = new Date(p.created_at);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                const entry = monthMap.get(key);
                if (!entry) return;

                const isPartnership = !!(p.user_id && p.engineer_id);
                if (isPartnership) {
                    entry.partnership += 1;
                } else {
                    entry.solo += 1;
                }
            });

            // Unique partners
            const partnerIds = new Set<string>();
            partnershipProjects.forEach((p) => {
                const partnerId = p.user_id === user.id ? p.engineer_id : p.user_id;
                if (partnerId) partnerIds.add(partnerId);
            });

            // Top partners by project count
            const partnerRevMap = new Map<string, { revenue: number; sessions: number }>();
            partnershipProjects.forEach((p) => {
                const partnerId = (p.user_id === user.id ? p.engineer_id : p.user_id) as string;
                if (!partnerId) return;
                const entry = partnerRevMap.get(partnerId) || { revenue: 0, sessions: 0 };
                entry.revenue += 1;
                entry.sessions += 1;
                partnerRevMap.set(partnerId, entry);
            });

            // Fetch partner display names
            const partnerIdList = Array.from(partnerRevMap.keys()).slice(0, 5);
            const { data: profiles } = partnerIdList.length > 0
                ? await supabase.from('profiles').select('id, display_name').in('id', partnerIdList)
                : { data: [] };

            const profileMap = new Map((profiles || []).map((p) => [p.id, p.display_name || 'Unknown']));

            const topPartners = partnerIdList
                .map((id) => ({
                    id,
                    name: profileMap.get(id) || 'Partner',
                    ...partnerRevMap.get(id)!,
                }))
                .sort((a, b) => b.revenue - a.revenue);

            // Calculate growth rate (this month vs last month partnership revenue)
            const months = Array.from(monthMap.values());
            const thisMonth = months[months.length - 1]?.partnership || 0;
            const lastMonth = months[months.length - 2]?.partnership || 0;
            const growthRate = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

            return {
                totalPartnershipRevenue,
                totalSoloRevenue,
                partnershipGrowthRate: Math.round(growthRate),
                activePartners: partnerIds.size,
                revenueByMonth: Array.from(monthMap.values()),
                topPartners,
            };
        },
        enabled: !!user,
        staleTime: 5 * 60 * 1000,
    });
}

function ComparisonChart({ data }: { data: PartnershipRevenue[] }) {
    const maxVal = Math.max(...data.map((d) => Math.max(d.solo, d.partnership)), 1);

    return (
        <Card className="p-6">
            <h3 className="font-semibold mb-1">Solo vs Partnership Revenue</h3>
            <p className="text-xs text-muted-foreground mb-4">Last 12 months</p>
            <div className="flex items-end gap-1 h-36">
                {data.map((d) => {
                    const soloH = (d.solo / maxVal) * 100;
                    const partH = (d.partnership / maxVal) * 100;
                    const label = d.month.split('-')[1];
                    return (
                        <div key={d.month} className="flex-1 flex flex-col items-center gap-0.5">
                            <div className="w-full flex gap-[1px] items-end h-full">
                                <div
                                    className="flex-1 bg-muted-foreground/30 rounded-t min-h-[1px] transition-all"
                                    style={{ height: `${Math.max(soloH, 1)}%` }}
                                    title={`Solo: $${d.solo}`}
                                />
                                <div
                                    className="flex-1 bg-primary rounded-t min-h-[1px] transition-all"
                                    style={{ height: `${Math.max(partH, 1)}%` }}
                                    title={`Partnership: $${d.partnership}`}
                                />
                            </div>
                            <span className="text-[9px] text-muted-foreground">{label}</span>
                        </div>
                    );
                })}
            </div>
            <div className="flex gap-4 mt-3 text-xs">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-muted-foreground/30" /> Solo
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-primary" /> Partnership
                </div>
            </div>
        </Card>
    );
}

export default function CollectiveAnalytics() {
    const { data, isLoading } = useCollectiveAnalytics();

    const liftPercent = useMemo(() => {
        if (!data || data.totalSoloRevenue === 0) return null;
        return Math.round(
            ((data.totalPartnershipRevenue - data.totalSoloRevenue) / data.totalSoloRevenue) * 100
        );
    }, [data]);

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!data) return null;

    const GrowthIcon = data.partnershipGrowthRate >= 0 ? TrendingUp : TrendingDown;

    return (
        <div className="space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-5">
                    <p className="text-sm text-muted-foreground">Partnership Revenue</p>
                    <p className="text-2xl font-bold mt-1">${data.totalPartnershipRevenue.toLocaleString()}</p>
                </Card>
                <Card className="p-5">
                    <p className="text-sm text-muted-foreground">Solo Revenue</p>
                    <p className="text-2xl font-bold mt-1">${data.totalSoloRevenue.toLocaleString()}</p>
                </Card>
                <Card className="p-5">
                    <p className="text-sm text-muted-foreground">Active Partners</p>
                    <p className="text-2xl font-bold mt-1 flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        {data.activePartners}
                    </p>
                </Card>
                <Card className="p-5">
                    <p className="text-sm text-muted-foreground">Monthly Growth</p>
                    <p className={`text-2xl font-bold mt-1 flex items-center gap-1 ${data.partnershipGrowthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        <GrowthIcon className="w-5 h-5" />
                        {data.partnershipGrowthRate}%
                    </p>
                </Card>
            </div>

            {/* Partnership lift callout */}
            {liftPercent !== null && (
                <Card className={`p-5 border-2 ${liftPercent > 0 ? 'border-green-500/30 bg-green-500/5' : 'border-orange-500/30 bg-orange-500/5'}`}>
                    <div className="flex items-center gap-3">
                        <BarChart3 className={`w-8 h-8 ${liftPercent > 0 ? 'text-green-500' : 'text-orange-500'}`} />
                        <div>
                            <p className="font-semibold">
                                {liftPercent > 0
                                    ? `Partnerships earn you ${liftPercent}% more than solo work`
                                    : `Solo work is currently outperforming partnerships`}
                            </p>
                            <p className="text-sm text-muted-foreground">Based on all-time completed projects</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Chart */}
            <ComparisonChart data={data.revenueByMonth} />

            {/* Top partners */}
            {data.topPartners.length > 0 && (
                <Card className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Star className="w-4 h-4" /> Top Partners
                    </h3>
                    <div className="space-y-3">
                        {data.topPartners.map((p, i) => (
                            <div key={p.id} className="flex items-center gap-3">
                                <span className="text-sm font-mono text-muted-foreground w-5">#{i + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{p.name}</p>
                                    <p className="text-xs text-muted-foreground">{p.sessions} sessions</p>
                                </div>
                                <span className="font-semibold text-sm text-primary">${p.revenue.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}
