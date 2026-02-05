 import { motion } from 'framer-motion';
 import { ShoppingBag, Gift, Star, Unlock, Music, Ticket } from 'lucide-react';
 import { Card } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 
 interface SpendingDestination {
   id: string;
   name: string;
   description: string;
   icon: React.ElementType;
   color: string;
   bgColor: string;
   minCost: number;
 }
 
 const DESTINATIONS: SpendingDestination[] = [
   {
     id: 'merch',
     name: 'Artist Merch',
     description: 'Exclusive drops & collabs',
     icon: ShoppingBag,
     color: 'text-purple-400',
     bgColor: 'bg-purple-500/10',
     minCost: 100,
   },
   {
     id: 'tips',
     name: 'Tip Artists',
     description: 'Support your favorites',
     icon: Gift,
     color: 'text-pink-400',
     bgColor: 'bg-pink-500/10',
     minCost: 10,
   },
   {
     id: 'premium',
     name: 'Premium Access',
     description: 'Unlock exclusive content',
     icon: Unlock,
     color: 'text-amber-400',
     bgColor: 'bg-amber-500/10',
     minCost: 500,
   },
   {
     id: 'events',
     name: 'Event Tickets',
     description: 'VIP access & meet-ups',
     icon: Ticket,
     color: 'text-blue-400',
     bgColor: 'bg-blue-500/10',
     minCost: 200,
   },
   {
     id: 'music',
     name: 'Beat Marketplace',
     description: 'Buy beats & samples',
     icon: Music,
     color: 'text-emerald-400',
     bgColor: 'bg-emerald-500/10',
     minCost: 50,
   },
   {
     id: 'votes',
     name: 'Power Votes',
     description: 'Boost your favorites',
     icon: Star,
     color: 'text-orange-400',
     bgColor: 'bg-orange-500/10',
     minCost: 25,
   },
 ];
 
 interface SpendingDestinationsProps {
   balance: number;
   onNavigate?: (destination: string) => void;
 }
 
 export function SpendingDestinations({ balance, onNavigate }: SpendingDestinationsProps) {
   return (
     <div className="space-y-4">
       <div className="flex items-center justify-between">
         <h3 className="font-semibold">Ways to Spend</h3>
         <span className="text-sm text-muted-foreground">
           Balance: <span className="text-primary font-medium">{balance.toLocaleString()}</span>
         </span>
       </div>
 
       <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
         {DESTINATIONS.map((dest, i) => {
           const canAfford = balance >= dest.minCost;
           
           return (
             <motion.div
               key={dest.id}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.05 }}
             >
               <Card
                 className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                   canAfford ? dest.bgColor : 'bg-muted/50 opacity-60'
                 }`}
                 onClick={() => canAfford && onNavigate?.(dest.id)}
               >
                 <div className={`p-2 rounded-lg ${dest.bgColor} w-fit mb-3`}>
                   <dest.icon className={`h-5 w-5 ${dest.color}`} />
                 </div>
                 <h4 className="font-medium text-sm">{dest.name}</h4>
                 <p className="text-xs text-muted-foreground mb-2">
                   {dest.description}
                 </p>
                 <p className={`text-xs ${canAfford ? dest.color : 'text-muted-foreground'}`}>
                   From {dest.minCost} coinz
                 </p>
               </Card>
             </motion.div>
           );
         })}
       </div>
     </div>
   );
 }