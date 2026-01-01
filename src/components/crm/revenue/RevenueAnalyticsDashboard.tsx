/**
 * Revenue Analytics Dashboard
 * 10-stream revenue visualization with forecasts and payout tracking
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  RefreshCw,
  Sparkles,
  Sliders,
  Disc3,
  Briefcase,
  Handshake,
  Users,
  Crown,
  Store,
  GraduationCap,
  Music,
  Tv,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRevenueStreams, type RevenueStream } from '@/hooks/useRevenueStreams';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  sliders: Sliders,
  'disc-3': Disc3,
  briefcase: Briefcase,
  handshake: Handshake,
  users: Users,
  crown: Crown,
  store: Store,
  'graduation-cap': GraduationCap,
  music: Music,
  tv: Tv,
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatCompactCurrency = (amount: number) => {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return formatCurrency(amount);
};

export function RevenueAnalyticsDashboard() {
  const { analytics, loading, error, refetch } = useRevenueStreams();
  const [selectedStream, setSelectedStream] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 rounded-xl bg-muted/50 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-muted/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <Card className="bg-destructive/10 border-destructive/20">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
          <p className="text-destructive">Failed to load revenue data</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { 
    totalRevenue, 
    thisMonth, 
    monthlyGrowth, 
    pendingPayouts, 
    completedPayouts,
    averageProjectValue,
    topPerformingStream,
    streams,
    forecasts,
    recentPayouts 
  } = analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            Revenue Analytics
          </h2>
          <p className="text-muted-foreground text-sm">
            10 income streams powering your music career
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="default" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                {monthlyGrowth >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={monthlyGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {monthlyGrowth >= 0 ? '+' : ''}{monthlyGrowth.toFixed(1)}%
                </span>
                <span className="text-muted-foreground ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">{formatCurrency(thisMonth)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <Progress value={65} className="mt-3 h-1.5" />
              <p className="text-xs text-muted-foreground mt-1">65% of monthly goal</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-amber-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Payouts</p>
                  <p className="text-2xl font-bold">{formatCurrency(pendingPayouts)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {formatCurrency(completedPayouts)} paid out total
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Project Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(averageProjectValue)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-purple-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Top stream: {topPerformingStream}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="streams" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="streams" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Revenue Streams
          </TabsTrigger>
          <TabsTrigger value="forecast" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Forecast
          </TabsTrigger>
          <TabsTrigger value="payouts" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Payouts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="streams">
          {/* 10 Revenue Streams Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <AnimatePresence mode="popLayout">
              {streams.map((stream, i) => {
                const IconComponent = iconMap[stream.icon] || DollarSign;
                const isSelected = selectedStream === stream.id;
                const percentage = totalRevenue > 0 ? (stream.amount / totalRevenue) * 100 : 0;

                return (
                  <motion.div
                    key={stream.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedStream(isSelected ? null : stream.id)}
                    className="cursor-pointer"
                  >
                    <Card 
                      className={`relative overflow-hidden transition-all hover:scale-105 ${
                        isSelected ? 'ring-2 ring-primary' : ''
                      }`}
                      style={{ 
                        background: `linear-gradient(135deg, ${stream.color}15, transparent)`,
                        borderColor: `${stream.color}30`
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div 
                            className="h-8 w-8 rounded-lg flex items-center justify-center"
                            style={{ background: `${stream.color}25` }}
                          >
                            <IconComponent 
                              className="h-4 w-4" 
                              style={{ color: stream.color }} 
                            />
                          </div>
                          <Badge 
                            variant={stream.trend >= 0 ? 'default' : 'destructive'}
                            className="text-[10px] px-1.5 py-0"
                          >
                            {stream.trend >= 0 ? '+' : ''}{stream.trend}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {stream.name}
                        </p>
                        <p className="text-lg font-bold mt-1">
                          {formatCompactCurrency(stream.amount)}
                        </p>
                        <Progress 
                          value={percentage} 
                          className="mt-2 h-1"
                          style={{ 
                            '--progress-background': stream.color 
                          } as React.CSSProperties}
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {percentage.toFixed(1)}% of total
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Selected Stream Details */}
          <AnimatePresence>
            {selectedStream && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                {streams.filter(s => s.id === selectedStream).map(stream => {
                  const IconComponent = iconMap[stream.icon] || DollarSign;
                  return (
                    <Card key={stream.id} className="border-primary/30">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <div 
                            className="h-10 w-10 rounded-lg flex items-center justify-center"
                            style={{ background: `${stream.color}25` }}
                          >
                            <IconComponent 
                              className="h-5 w-5" 
                              style={{ color: stream.color }} 
                            />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{stream.name}</CardTitle>
                            <CardDescription>{stream.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold">{formatCurrency(stream.amount)}</p>
                            <p className="text-xs text-muted-foreground">Total Earned</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-green-500">+{stream.trend}%</p>
                            <p className="text-xs text-muted-foreground">Growth</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold">
                              {((stream.amount / totalRevenue) * 100).toFixed(0)}%
                            </p>
                            <p className="text-xs text-muted-foreground">Portfolio Share</p>
                          </div>
                        </div>
                        <Button className="w-full mt-4" variant="outline">
                          <ArrowUpRight className="h-4 w-4 mr-2" />
                          Optimize This Stream
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="forecast">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                6-Month Revenue Forecast
              </CardTitle>
              <CardDescription>
                AI-powered predictions based on your performance trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {forecasts.map((forecast, i) => (
                  <motion.div
                    key={forecast.month}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-12 text-sm font-medium">{forecast.month}</div>
                    <div className="flex-1">
                      <div className="relative h-6 bg-muted rounded-full overflow-hidden">
                        {forecast.actual !== undefined && (
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(forecast.actual / Math.max(...forecasts.map(f => f.projected))) * 100}%` }}
                            transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
                            className="absolute inset-y-0 left-0 bg-green-500/70 rounded-full"
                          />
                        )}
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(forecast.projected / Math.max(...forecasts.map(f => f.projected))) * 100}%` }}
                          transition={{ delay: i * 0.1 + 0.2, duration: 0.5 }}
                          className="absolute inset-y-0 left-0 bg-primary/30 rounded-full border-2 border-dashed border-primary/50"
                          style={{ background: 'transparent' }}
                        />
                      </div>
                    </div>
                    <div className="w-24 text-right">
                      <p className="text-sm font-medium">{formatCompactCurrency(forecast.projected)}</p>
                      {forecast.actual !== undefined && (
                        <p className="text-xs text-green-500">
                          {formatCompactCurrency(forecast.actual)} actual
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500/70" />
                  Actual
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full border-2 border-dashed border-primary/50" />
                  Projected
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Payouts</CardTitle>
                  <CardDescription>Your payment history and status</CardDescription>
                </div>
                <Button size="sm">
                  Request Payout
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {recentPayouts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Wallet className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No payout history yet</p>
                    </div>
                  ) : (
                    recentPayouts.map((payout, i) => (
                      <motion.div
                        key={payout.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            payout.status === 'completed' ? 'bg-green-500/20' :
                            payout.status === 'pending' ? 'bg-amber-500/20' :
                            payout.status === 'processing' ? 'bg-blue-500/20' :
                            'bg-red-500/20'
                          }`}>
                            {payout.status === 'completed' ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : payout.status === 'pending' ? (
                              <Clock className="h-5 w-5 text-amber-500" />
                            ) : (
                              <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{formatCurrency(payout.amount)}</p>
                            <p className="text-xs text-muted-foreground">{payout.method}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            payout.status === 'completed' ? 'default' :
                            payout.status === 'pending' ? 'secondary' :
                            'outline'
                          }>
                            {payout.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(payout.date).toLocaleDateString()}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
