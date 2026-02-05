 import { motion } from 'framer-motion';
 import { Star, Crown, Gem, Award, Sparkles, TrendingUp } from 'lucide-react';
 import { Card } from '@/components/ui/card';
 import { Progress } from '@/components/ui/progress';
 import { Badge } from '@/components/ui/badge';
 
 const TIERS = [
   { name: 'Newcomer', threshold: 0, icon: Star, color: 'text-zinc-400', bgColor: 'bg-zinc-500/10' },
   { name: 'Supporter', threshold: 500, icon: Award, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
   { name: 'Advocate', threshold: 2000, icon: Sparkles, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
   { name: 'Champion', threshold: 5000, icon: Crown, color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
   { name: 'Legend', threshold: 10000, icon: Gem, color: 'text-pink-400', bgColor: 'bg-pink-500/10' },
 ];
 
 interface TierProgressCardProps {
   totalEarned: number;
 }
 
 export function TierProgressCard({ totalEarned }: TierProgressCardProps) {
   // Find current tier
   // Find current tier (find last matching tier)
   let currentTierIndex = 0;
   for (let i = TIERS.length - 1; i >= 0; i--) {
     if (totalEarned >= TIERS[i].threshold) {
       currentTierIndex = i;
       break;
     }
   }
   const currentTier = TIERS[currentTierIndex] || TIERS[0];
   const nextTier = TIERS[currentTierIndex + 1];
 
   // Calculate progress to next tier
   const progressToNext = nextTier
     ? ((totalEarned - currentTier.threshold) / (nextTier.threshold - currentTier.threshold)) * 100
     : 100;
 
   const coinzToNext = nextTier ? nextTier.threshold - totalEarned : 0;
 
   const CurrentIcon = currentTier.icon;
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
     >
       <Card className={`p-6 ${currentTier.bgColor} border-0 overflow-hidden relative`}>
         {/* Background decoration */}
         <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
           <CurrentIcon className="w-full h-full" />
         </div>
 
         <div className="relative z-10">
           {/* Current Tier */}
           <div className="flex items-center gap-4 mb-4">
             <div className={`p-3 rounded-xl ${currentTier.bgColor}`}>
               <CurrentIcon className={`h-8 w-8 ${currentTier.color}`} />
             </div>
             <div>
               <p className="text-sm text-muted-foreground">Current Tier</p>
               <h3 className={`text-2xl font-bold ${currentTier.color}`}>
                 {currentTier.name}
               </h3>
             </div>
           </div>
 
           {/* Progress to Next */}
           {nextTier ? (
             <div className="space-y-2">
               <div className="flex items-center justify-between text-sm">
                 <span className="text-muted-foreground">
                   Progress to {nextTier.name}
                 </span>
                 <span className={nextTier.color}>
                   {coinzToNext.toLocaleString()} coinz to go
                 </span>
               </div>
               <Progress value={progressToNext} className="h-2" />
               <div className="flex items-center gap-2 text-xs text-muted-foreground">
                 <TrendingUp className="h-3 w-3" />
                 <span>
                   {totalEarned.toLocaleString()} / {nextTier.threshold.toLocaleString()} earned coinz
                 </span>
               </div>
             </div>
           ) : (
             <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
               Max Tier Reached! 🎉
             </Badge>
           )}
 
           {/* Tier Benefits Preview */}
           <div className="mt-4 pt-4 border-t border-border/50">
             <p className="text-xs text-muted-foreground mb-2">Tier Benefits</p>
             <div className="flex flex-wrap gap-1">
               <Badge variant="outline" className="text-xs">Early Access</Badge>
               <Badge variant="outline" className="text-xs">Exclusive Drops</Badge>
               {currentTierIndex >= 2 && (
                 <Badge variant="outline" className="text-xs">2x Missions</Badge>
               )}
               {currentTierIndex >= 3 && (
                 <Badge variant="outline" className="text-xs">VIP Support</Badge>
               )}
             </div>
           </div>
         </div>
       </Card>
     </motion.div>
   );
 }