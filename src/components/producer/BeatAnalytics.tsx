import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GlassPanel, HubHeader, HubSkeleton } from '@/components/crm/design';
import { BarChart3, Play, Download, DollarSign, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function BeatAnalytics() {
  const { user } = useAuth();

  const { data: beats, isLoading } = useQuery({
    queryKey: ['producer-beat-analytics', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('producer_beats')
        .select('id, title, plays, downloads, price_cents, status, created_at')
        .eq('producer_id', user.id)
        .eq('status', 'published')
        .order('plays', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: purchases } = useQuery({
    queryKey: ['producer-purchase-analytics', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('beat_purchases')
        .select('id, beat_id, amount_cents, license_type, created_at')
        .eq('seller_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  if (isLoading) return <HubSkeleton variant="cards" count={4} />;

  const totalPlays = beats?.reduce((s, b) => s + (b.plays || 0), 0) || 0;
  const totalSales = purchases?.length || 0;
  const totalRevenue = purchases?.reduce((s, p) => s + (p.amount_cents || 0), 0) || 0;
  const conversionRate = totalPlays > 0 ? ((totalSales / totalPlays) * 100).toFixed(2) : '0.00';

  const chartData = (beats || []).slice(0, 10).map(b => ({
    name: b.title.length > 12 ? b.title.slice(0, 12) + '…' : b.title,
    plays: b.plays || 0,
    sales: purchases?.filter(p => p.beat_id === b.id).length || 0,
  }));

  const stats = [
    { icon: <Play className="h-4 w-4" />, label: 'Total Plays', value: totalPlays.toLocaleString(), color: 'rgba(59, 130, 246, 0.5)' },
    { icon: <Download className="h-4 w-4" />, label: 'Total Sales', value: totalSales.toLocaleString(), color: 'rgba(16, 185, 129, 0.5)' },
    { icon: <DollarSign className="h-4 w-4" />, label: 'Revenue', value: `$${(totalRevenue / 100).toFixed(2)}`, color: 'rgba(234, 179, 8, 0.5)' },
    { icon: <TrendingUp className="h-4 w-4" />, label: 'Conversion', value: `${conversionRate}%`, color: 'rgba(168, 85, 247, 0.5)' },
  ];

  return (
    <div className="space-y-6">
      <HubHeader
        icon={<BarChart3 className="h-5 w-5 text-emerald-400" />}
        title="Beat Analytics"
        subtitle="Performance metrics across your published catalog"
        accent="rgba(16, 185, 129, 0.5)"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <GlassPanel key={i} accent={stat.color} padding="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              {stat.icon}
              <span className="text-xs">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </GlassPanel>
        ))}
      </div>

      {chartData.length > 0 && (
        <GlassPanel padding="p-4">
          <h3 className="font-semibold mb-4">Top Beats — Plays vs Sales</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Bar dataKey="plays" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="sales" fill="hsl(var(--accent-foreground))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassPanel>
      )}

      {/* Per-beat breakdown */}
      <GlassPanel padding="p-4">
        <h3 className="font-semibold mb-3">Beat Performance</h3>
        <div className="space-y-2">
          {(beats || []).map(beat => {
            const beatSales = purchases?.filter(p => p.beat_id === beat.id).length || 0;
            const beatRevenue = purchases?.filter(p => p.beat_id === beat.id).reduce((s, p) => s + p.amount_cents, 0) || 0;
            const beatConversion = (beat.plays || 0) > 0 ? ((beatSales / (beat.plays || 1)) * 100).toFixed(1) : '0.0';
            return (
              <div key={beat.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div className="min-w-0">
                  <p className="font-medium truncate text-sm">{beat.title}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                  <span>{(beat.plays || 0).toLocaleString()} plays</span>
                  <span>{beatSales} sales</span>
                  <span>${(beatRevenue / 100).toFixed(0)}</span>
                  <span>{beatConversion}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </GlassPanel>
    </div>
  );
}
