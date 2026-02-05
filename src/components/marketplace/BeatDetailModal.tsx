 import { useState } from 'react';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
 } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
 import { Separator } from '@/components/ui/separator';
 import { BeatAudioPlayer } from './BeatAudioPlayer';
 import { LicenseSelector } from './LicenseSelector';
 import { useBeatPurchase } from '@/hooks/useBeatPurchase';
 import { Loader2, ShoppingCart, User, Music, Clock, Hash } from 'lucide-react';
 import type { MarketplaceBeat } from '@/hooks/useBeatMarketplace';
 import { Link } from 'react-router-dom';
 
 interface BeatDetailModalProps {
   beat: MarketplaceBeat | null;
   open: boolean;
   onOpenChange: (open: boolean) => void;
 }
 
 export function BeatDetailModal({ beat, open, onOpenChange }: BeatDetailModalProps) {
   const [selectedLicense, setSelectedLicense] = useState<'lease' | 'exclusive'>('lease');
   const { createBeatCheckout, loading, isAuthenticated } = useBeatPurchase();
 
   if (!beat) return null;
 
   const handlePurchase = async () => {
     const sessionId = await createBeatCheckout(beat.id, selectedLicense);
     if (sessionId) {
       onOpenChange(false);
     }
   };
 
   const producerName = beat.producer?.full_name || beat.producer?.username || 'Producer';
   const producerInitial = producerName.charAt(0).toUpperCase();
   const audioUrl = beat.preview_url || beat.audio_url;
 
   const selectedPrice = selectedLicense === 'exclusive' 
     ? beat.exclusive_price_cents 
     : beat.price_cents;
 
   const formatPrice = (cents: number) => {
     return (cents / 100).toLocaleString('en-US', {
       style: 'currency',
       currency: 'USD',
     });
   };
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
         <DialogHeader>
           <DialogTitle className="text-2xl">{beat.title}</DialogTitle>
         </DialogHeader>
 
         <div className="space-y-6">
           {/* Cover Image */}
           <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg overflow-hidden">
             {beat.cover_image_url ? (
               <img 
                 src={beat.cover_image_url} 
                 alt={beat.title}
                 className="w-full h-full object-cover"
               />
             ) : (
               <div className="w-full h-full flex items-center justify-center">
                 <Music className="h-24 w-24 text-muted-foreground/30" />
               </div>
             )}
           </div>
 
           {/* Audio Player */}
           {audioUrl && (
             <BeatAudioPlayer audioUrl={audioUrl} title={beat.title} />
           )}
 
           {/* Producer Info */}
           <div className="flex items-center gap-3 p-3 bg-accent/30 rounded-lg">
             <Avatar className="h-12 w-12">
               <AvatarImage src={beat.producer?.avatar_url || undefined} />
               <AvatarFallback>{producerInitial}</AvatarFallback>
             </Avatar>
             <div className="flex-1">
               <p className="text-sm text-muted-foreground">Produced by</p>
               <Link 
                 to={`/u/${beat.producer?.username}`}
                 className="font-semibold hover:text-primary transition-colors"
               >
                 {producerName}
               </Link>
             </div>
             <Button variant="outline" size="sm" asChild>
               <Link to={`/u/${beat.producer?.username}`}>
                 <User className="h-4 w-4 mr-1" />
                 View Profile
               </Link>
             </Button>
           </div>
 
           {/* Beat Details */}
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
             {beat.bpm && (
               <div className="text-center p-3 bg-muted/50 rounded-lg">
                 <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                 <p className="font-semibold">{beat.bpm}</p>
                 <p className="text-xs text-muted-foreground">BPM</p>
               </div>
             )}
             {beat.key_signature && (
               <div className="text-center p-3 bg-muted/50 rounded-lg">
                 <Hash className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                 <p className="font-semibold">{beat.key_signature}</p>
                 <p className="text-xs text-muted-foreground">Key</p>
               </div>
             )}
             <div className="text-center p-3 bg-muted/50 rounded-lg">
               <Music className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
               <p className="font-semibold">{beat.plays.toLocaleString()}</p>
               <p className="text-xs text-muted-foreground">Plays</p>
             </div>
             <div className="text-center p-3 bg-muted/50 rounded-lg">
               <ShoppingCart className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
               <p className="font-semibold">{beat.downloads}</p>
               <p className="text-xs text-muted-foreground">Sales</p>
             </div>
           </div>
 
           {/* Tags */}
           {beat.tags && beat.tags.length > 0 && (
             <div className="flex flex-wrap gap-2">
               <span className="text-sm text-muted-foreground">Tags:</span>
               {beat.tags.map((tag, i) => (
                 <Badge key={i} variant="outline">{tag}</Badge>
               ))}
             </div>
           )}
 
           <Separator />
 
           {/* License Selection */}
           <div className="space-y-3">
             <h3 className="font-semibold">Select License</h3>
             <LicenseSelector
               licenseType={beat.license_type}
               leasePriceCents={beat.price_cents}
               exclusivePriceCents={beat.exclusive_price_cents}
               isExclusiveAvailable={beat.is_exclusive_available}
               selectedLicense={selectedLicense}
               onSelect={(license) => {
                 if (license === 'exclusive' && !beat.is_exclusive_available) return;
                 setSelectedLicense(license);
               }}
             />
           </div>
 
           <Separator />
 
           {/* Purchase Button */}
           <div className="flex items-center justify-between">
             <div>
               <p className="text-sm text-muted-foreground">Total</p>
               <p className="text-2xl font-bold">{formatPrice(selectedPrice)}</p>
             </div>
             {isAuthenticated ? (
               <Button 
                 size="lg" 
                 onClick={handlePurchase}
                 disabled={loading}
               >
                 {loading ? (
                   <>
                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                     Processing...
                   </>
                 ) : (
                   <>
                     <ShoppingCart className="h-4 w-4 mr-2" />
                     Purchase Now
                   </>
                 )}
               </Button>
             ) : (
               <Button size="lg" asChild>
                 <Link to="/auth?redirect=/beats">
                   Sign in to Purchase
                 </Link>
               </Button>
             )}
           </div>
 
           <p className="text-xs text-center text-muted-foreground">
             By purchasing, you agree to our Terms of Service and License Agreement
           </p>
         </div>
       </DialogContent>
     </Dialog>
   );
 }