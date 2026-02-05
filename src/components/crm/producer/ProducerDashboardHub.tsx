 import { motion } from 'framer-motion';
 import { CharacterEmptyState } from '@/components/characters/CharacterEmptyState';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Disc3, TrendingUp, DollarSign, Users } from 'lucide-react';
 
 export const ProducerDashboardHub = () => {
   // TODO: Fetch real stats from producer_stats table
   const hasData = false;
 
   if (!hasData) {
     return (
       <CharacterEmptyState
         type="beats"
         characterId="tempo"
         title="Your Command Center Awaits"
         actionLabel="Upload Your First Beat"
         onAction={() => {}}
       />
     );
   }
 
   return (
     <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
         >
           <Card className="bg-card/50 backdrop-blur-sm border-border/50">
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                 <Disc3 className="w-4 h-4" />
                 Total Beats
               </CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-2xl font-bold">0</p>
             </CardContent>
           </Card>
         </motion.div>
         
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
         >
           <Card className="bg-card/50 backdrop-blur-sm border-border/50">
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                 <TrendingUp className="w-4 h-4" />
                 Total Plays
               </CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-2xl font-bold">0</p>
             </CardContent>
           </Card>
         </motion.div>
         
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
         >
           <Card className="bg-card/50 backdrop-blur-sm border-border/50">
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                 <DollarSign className="w-4 h-4" />
                 Revenue
               </CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-2xl font-bold">$0</p>
             </CardContent>
           </Card>
         </motion.div>
         
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
         >
           <Card className="bg-card/50 backdrop-blur-sm border-border/50">
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                 <Users className="w-4 h-4" />
                 Active Collabs
               </CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-2xl font-bold">0</p>
             </CardContent>
           </Card>
         </motion.div>
       </div>
     </div>
   );
 };