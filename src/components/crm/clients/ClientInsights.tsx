import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Target,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useCRMClients } from '@/hooks/useCRMClients';
import { useCRMDeals } from '@/hooks/useCRMDeals';
import { cn } from '@/lib/utils';

interface ClientInsightsProps {
  userType: 'artist' | 'engineer';
}

export const ClientInsights: React.FC<ClientInsightsProps> = ({ userType }) => {
  const { clients } = useCRMClients();
  const { deals } = useCRMDeals();

  // Calculate metrics
  const totalClients = clients?.length || 0;
  const activeClients = clients?.filter((c) => c.status === 'active').length || 0;
  const totalValue = clients?.reduce((sum, c) => sum + (c.total_value || 0), 0) || 0;
  
  const totalDeals = deals?.length || 0;
  const wonDeals = deals?.filter((d) => d.stage === 'won').length || 0;
  const lostDeals = deals?.filter((d) => d.stage === 'lost').length || 0;
  const activeDeals = deals?.filter((d) => !['won', 'lost'].includes(d.stage)).length || 0;
  
  const conversionRate = totalDeals > 0 ? Math.round((wonDeals / (wonDeals + lostDeals)) * 100) || 0 : 0;
  const avgDealValue = wonDeals > 0 
    ? Math.round(deals?.filter((d) => d.stage === 'won').reduce((sum, d) => sum + (d.value || 0), 0)! / wonDeals)
    : 0;

  // Client type distribution
  const clientTypeDistribution = React.useMemo(() => {
    if (!clients) return [];
    const counts: Record<string, number> = {};
    clients.forEach((c) => {
      counts[c.client_type] = (counts[c.client_type] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / totalClients) * 100),
    }));
  }, [clients, totalClients]);

  // Source distribution
  const sourceDistribution = React.useMemo(() => {
    if (!clients) return [];
    const counts: Record<string, number> = {};
    clients.forEach((c) => {
      const source = c.source || 'other';
      counts[source] = (counts[source] || 0) + 1;
    });
    return Object.entries(counts).map(([source, count]) => ({
      source,
      count,
      percentage: Math.round((count / totalClients) * 100),
    }));
  }, [clients, totalClients]);

  // Pipeline value by stage
  const pipelineByStage = React.useMemo(() => {
    if (!deals) return [];
    const stages = ['lead', 'contacted', 'proposal', 'negotiation'];
    return stages.map((stage) => {
      const stageDeals = deals.filter((d) => d.stage === stage);
      return {
        stage,
        count: stageDeals.length,
        value: stageDeals.reduce((sum, d) => sum + (d.value || 0), 0),
      };
    });
  }, [deals]);

  const maxPipelineValue = Math.max(...pipelineByStage.map((s) => s.value), 1);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Users className="h-8 w-8 text-primary" />
                <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-400/30">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +12%
                </Badge>
              </div>
              <p className="text-3xl font-bold mt-2">{totalClients}</p>
              <p className="text-sm text-muted-foreground">Total Clients</p>
              <p className="text-xs text-primary mt-1">{activeClients} active</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <DollarSign className="h-8 w-8 text-emerald-400" />
                <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-400/30">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +8%
                </Badge>
              </div>
              <p className="text-3xl font-bold mt-2">${totalValue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Lifetime Value</p>
              <p className="text-xs text-emerald-400 mt-1">${avgDealValue} avg deal</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Target className="h-8 w-8 text-purple-400" />
                <Badge variant="outline" className={cn(
                  'text-xs border-emerald-400/30',
                  conversionRate >= 50 ? 'text-emerald-400' : 'text-amber-400'
                )}>
                  {conversionRate >= 50 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                  {conversionRate}%
                </Badge>
              </div>
              <p className="text-3xl font-bold mt-2">{conversionRate}%</p>
              <p className="text-sm text-muted-foreground">Win Rate</p>
              <p className="text-xs text-purple-400 mt-1">{wonDeals} won / {lostDeals} lost</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <TrendingUp className="h-8 w-8 text-amber-400" />
                <Sparkles className="h-4 w-4 text-amber-400" />
              </div>
              <p className="text-3xl font-bold mt-2">{activeDeals}</p>
              <p className="text-sm text-muted-foreground">Active Deals</p>
              <p className="text-xs text-amber-400 mt-1">
                ${deals?.filter((d) => !['won', 'lost'].includes(d.stage))
                  .reduce((sum, d) => sum + (d.value || 0), 0)
                  .toLocaleString()} in pipeline
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Client Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              Client Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {clientTypeDistribution.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No client data yet
              </p>
            ) : (
              clientTypeDistribution.map((item, index) => (
                <motion.div
                  key={item.type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize">{item.type}</span>
                    <span className="text-muted-foreground">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Source Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Client Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sourceDistribution.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No source data yet
              </p>
            ) : (
              sourceDistribution.map((item, index) => (
                <motion.div
                  key={item.source}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize">{item.source}</span>
                    <span className="text-muted-foreground">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Pipeline Value by Stage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {pipelineByStage.map((stage, index) => (
              <motion.div
                key={stage.stage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="relative h-32 flex items-end justify-center mb-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(stage.value / maxPipelineValue) * 100}%` }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                    className="w-12 bg-gradient-to-t from-primary to-primary/50 rounded-t-lg"
                    style={{ minHeight: stage.count > 0 ? '20px' : '0' }}
                  />
                </div>
                <p className="font-semibold text-lg">${stage.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground capitalize">{stage.stage}</p>
                <Badge variant="outline" className="mt-1 text-xs">
                  {stage.count} deals
                </Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
