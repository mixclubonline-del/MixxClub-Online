 import { formatDistanceToNow } from 'date-fns';
 import { Download, ExternalLink } from 'lucide-react';
 import { Card } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { Button } from '@/components/ui/button';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from '@/components/ui/table';
 import { BeatSale } from '@/hooks/useProducerSales';
 
 interface SalesTableProps {
   sales: BeatSale[];
   isLoading: boolean;
 }
 
 export function SalesTable({ sales, isLoading }: SalesTableProps) {
   const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;
 
   const statusColors: Record<string, string> = {
     pending: 'bg-amber-500/20 text-amber-400',
     completed: 'bg-emerald-500/20 text-emerald-400',
     refunded: 'bg-red-500/20 text-red-400',
     failed: 'bg-red-500/20 text-red-400',
   };
 
   const licenseColors: Record<string, string> = {
     lease: 'bg-blue-500/20 text-blue-400',
     exclusive: 'bg-purple-500/20 text-purple-400',
   };
 
   if (isLoading) {
     return (
       <Card className="p-6">
         <div className="animate-pulse space-y-4">
           {[1, 2, 3].map((i) => (
             <div key={i} className="h-12 bg-muted rounded" />
           ))}
         </div>
       </Card>
     );
   }
 
   if (sales.length === 0) {
     return (
       <Card className="p-8 text-center">
         <div className="text-4xl mb-4">📊</div>
         <h3 className="text-lg font-semibold mb-2">No Sales Yet</h3>
         <p className="text-muted-foreground">
           Your sales will appear here once customers purchase your beats.
         </p>
       </Card>
     );
   }
 
   return (
     <Card className="overflow-hidden">
       <div className="p-4 border-b border-border">
         <div className="flex items-center justify-between">
           <h3 className="font-semibold">Recent Sales</h3>
           <Badge variant="secondary">{sales.length} transactions</Badge>
         </div>
       </div>
 
       <ScrollArea className="h-[400px]">
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead>Beat</TableHead>
               <TableHead>License</TableHead>
               <TableHead>Amount</TableHead>
               <TableHead>Your Earnings</TableHead>
               <TableHead>Status</TableHead>
               <TableHead>Date</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {sales.map((sale) => (
               <TableRow key={sale.id}>
                 <TableCell>
                   <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                       🎵
                     </div>
                     <span className="font-medium">
                       {sale.beat?.title || 'Unknown Beat'}
                     </span>
                   </div>
                 </TableCell>
                 <TableCell>
                   <Badge className={licenseColors[sale.license_type]}>
                     {sale.license_type}
                   </Badge>
                 </TableCell>
                 <TableCell>{formatCurrency(sale.amount_cents)}</TableCell>
                 <TableCell className="font-semibold text-emerald-400">
                   {formatCurrency(sale.seller_earnings_cents)}
                 </TableCell>
                 <TableCell>
                   <Badge className={statusColors[sale.status]}>
                     {sale.status}
                   </Badge>
                 </TableCell>
                 <TableCell className="text-muted-foreground">
                   {formatDistanceToNow(new Date(sale.created_at), { addSuffix: true })}
                 </TableCell>
               </TableRow>
             ))}
           </TableBody>
         </Table>
       </ScrollArea>
     </Card>
   );
 }