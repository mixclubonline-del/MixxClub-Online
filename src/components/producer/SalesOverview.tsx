 import { motion } from 'framer-motion';
 import { DollarSign, TrendingUp, TrendingDown, ShoppingBag, Disc3, Crown } from 'lucide-react';
 import { Card } from '@/components/ui/card';
 import { Skeleton } from '@/components/ui/skeleton';
 import { SalesAnalytics } from '@/hooks/useProducerSales';
 
 interface SalesOverviewProps {
   analytics: SalesAnalytics | undefined;
   isLoading: boolean;
 }
 
 export function SalesOverview({ analytics, isLoading }: SalesOverviewProps) {
   if (isLoading) {
     return (
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[1, 2, 3, 4].map((i) => (
           <Card key={i} className="p-4">
             <Skeleton className="h-4 w-20 mb-2" />
             <Skeleton className="h-8 w-24" />
           </Card>
         ))}
       </div>
     );
   }
 
   if (!analytics) return null;
 
   const formatCurrency = (cents: number) => {
     return `$${(cents / 100).toFixed(2)}`;
   };
 
   const stats = [
     {
       label: 'Total Revenue',
       value: formatCurrency(analytics.totalRevenue),
       icon: DollarSign,
       color: 'text-emerald-400',
       bgColor: 'bg-emerald-500/10',
     },
     {
       label: 'This Month',
       value: formatCurrency(analytics.thisMonthRevenue),
       icon: analytics.monthlyGrowth >= 0 ? TrendingUp : TrendingDown,
       color: analytics.monthlyGrowth >= 0 ? 'text-emerald-400' : 'text-red-400',
       bgColor: analytics.monthlyGrowth >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10',
       trend: `${analytics.monthlyGrowth >= 0 ? '+' : ''}${analytics.monthlyGrowth.toFixed(1)}%`,
     },
     {
       label: 'Lease Sales',
       value: analytics.leaseSales.toString(),
       icon: Disc3,
       color: 'text-blue-400',
       bgColor: 'bg-blue-500/10',
     },
     {
       label: 'Exclusive Sales',
       value: analytics.exclusiveSales.toString(),
       icon: Crown,
       color: 'text-amber-400',
       bgColor: 'bg-amber-500/10',
     },
   ];
 
   return (
     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
       {stats.map((stat, i) => (
         <motion.div
           key={stat.label}
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: i * 0.1 }}
         >
           <Card className={`p-4 ${stat.bgColor} border-0`}>
             <div className="flex items-center justify-between mb-2">
               <span className="text-sm text-muted-foreground">{stat.label}</span>
               <stat.icon className={`h-4 w-4 ${stat.color}`} />
             </div>
             <div className="flex items-end gap-2">
               <span className={`text-2xl font-bold ${stat.color}`}>
                 {stat.value}
               </span>
               {stat.trend && (
                 <span className={`text-xs ${stat.color} mb-1`}>
                   {stat.trend}
                 </span>
               )}
             </div>
           </Card>
         </motion.div>
       ))}
     </div>
   );
 }