 import { useEffect } from 'react';
 import { AppLayout } from '@/components/layouts/AppLayout';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { Separator } from '@/components/ui/separator';
 import { useMyPurchases } from '@/hooks/useBeatPurchase';
 import { 
   Download, 
   Music, 
   Calendar, 
   Crown, 
   Loader2,
   ShoppingBag,
   ExternalLink 
 } from 'lucide-react';
 import { Link } from 'react-router-dom';
 import { toast } from 'sonner';
 
 export default function MyPurchases() {
   const { purchases, loading, fetchPurchases, markAsDownloaded } = useMyPurchases();
 
   useEffect(() => {
     fetchPurchases();
   }, []);
 
   const handleDownload = async (purchase: any) => {
     if (!purchase.beat?.audio_url) {
       toast.error('Download not available');
       return;
     }
 
     // Open download in new tab
     window.open(purchase.beat.audio_url, '_blank');
     
     // Mark as downloaded if first time
     if (!purchase.downloaded_at) {
       await markAsDownloaded(purchase.id);
     }
 
     toast.success('Download started');
   };
 
   const formatPrice = (cents: number) => {
     return (cents / 100).toLocaleString('en-US', {
       style: 'currency',
       currency: 'USD',
     });
   };
 
   const formatDate = (dateString: string) => {
     return new Date(dateString).toLocaleDateString('en-US', {
       year: 'numeric',
       month: 'short',
       day: 'numeric',
     });
   };
 
   return (
     <AppLayout>
       <div className="container py-6 max-w-4xl space-y-6">
         <div>
           <h1 className="text-3xl font-bold">My Purchases</h1>
           <p className="text-muted-foreground">
             Access and download your purchased beats
           </p>
         </div>
 
         {loading ? (
           <div className="flex items-center justify-center py-12">
             <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
           </div>
         ) : purchases.length === 0 ? (
           <Card className="p-12 text-center">
             <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
             <h3 className="text-xl font-semibold mb-2">No purchases yet</h3>
             <p className="text-muted-foreground mb-4">
               Browse the Beat Store to find your next hit
             </p>
             <Button asChild>
               <Link to="/beats">
                 <Music className="h-4 w-4 mr-2" />
                 Browse Beats
               </Link>
             </Button>
           </Card>
         ) : (
           <div className="space-y-4">
             {purchases.map((purchase) => (
               <Card key={purchase.id}>
                 <CardContent className="p-4">
                   <div className="flex items-center gap-4">
                     {/* Beat Cover */}
                     <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden shrink-0">
                       {purchase.beat?.cover_image_url ? (
                         <img 
                           src={purchase.beat.cover_image_url} 
                           alt={purchase.beat?.title}
                           className="w-full h-full object-cover"
                         />
                       ) : (
                         <Music className="h-8 w-8 text-muted-foreground/50" />
                       )}
                     </div>
 
                     {/* Beat Info */}
                     <div className="flex-1 min-w-0">
                       <h3 className="font-semibold truncate">
                         {purchase.beat?.title || 'Beat'}
                       </h3>
                       <p className="text-sm text-muted-foreground">
                         by {purchase.beat?.producer?.full_name || purchase.beat?.producer?.username || 'Producer'}
                       </p>
                       <div className="flex items-center gap-2 mt-1">
                         <Badge variant={purchase.license_type === 'exclusive' ? 'default' : 'secondary'}>
                           {purchase.license_type === 'exclusive' && (
                             <Crown className="h-3 w-3 mr-1" />
                           )}
                           {purchase.license_type === 'exclusive' ? 'Exclusive' : 'Lease'}
                         </Badge>
                         <span className="text-sm text-muted-foreground">
                           {formatPrice(purchase.amount_cents)}
                         </span>
                       </div>
                     </div>
 
                     {/* Actions */}
                     <div className="flex flex-col items-end gap-2">
                       <Button
                         size="sm"
                         onClick={() => handleDownload(purchase)}
                         disabled={!purchase.beat?.audio_url}
                       >
                         <Download className="h-4 w-4 mr-1" />
                         Download
                       </Button>
                       <div className="flex items-center gap-1 text-xs text-muted-foreground">
                         <Calendar className="h-3 w-3" />
                         {formatDate(purchase.created_at)}
                       </div>
                       {purchase.downloaded_at && (
                         <span className="text-xs text-green-600">
                           Downloaded
                         </span>
                       )}
                     </div>
                   </div>
                 </CardContent>
               </Card>
             ))}
           </div>
         )}
 
         <Separator />
 
         <div className="text-center text-sm text-muted-foreground">
           <p>Need help with a purchase? <Link to="/support" className="text-primary hover:underline">Contact Support</Link></p>
         </div>
       </div>
     </AppLayout>
   );
 }