 import { useState } from 'react';
 import { Card, CardContent } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
 import { Play, Pause, ShoppingCart, Music, Crown } from 'lucide-react';
 import type { MarketplaceBeat } from '@/hooks/useBeatMarketplace';
 
 interface BeatMarketplaceCardProps {
   beat: MarketplaceBeat;
   onSelect: (beat: MarketplaceBeat) => void;
   isPlaying?: boolean;
   onPlayToggle?: () => void;
 }
 
 export function BeatMarketplaceCard({ 
   beat, 
   onSelect, 
   isPlaying = false,
   onPlayToggle 
 }: BeatMarketplaceCardProps) {
   const [isHovered, setIsHovered] = useState(false);
 
   const formatPrice = (cents: number) => {
     return (cents / 100).toLocaleString('en-US', {
       style: 'currency',
       currency: 'USD',
       minimumFractionDigits: 0,
     });
   };
 
   const producerName = beat.producer?.full_name || beat.producer?.username || 'Producer';
   const producerInitial = producerName.charAt(0).toUpperCase();
 
   return (
     <Card 
       className="group overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50"
       onMouseEnter={() => setIsHovered(true)}
       onMouseLeave={() => setIsHovered(false)}
       onClick={() => onSelect(beat)}
     >
       <div className="relative aspect-square bg-gradient-to-br from-primary/20 to-accent/20">
         {beat.cover_image_url ? (
           <img 
             src={beat.cover_image_url} 
             alt={beat.title}
             className="w-full h-full object-cover"
           />
         ) : (
           <div className="w-full h-full flex items-center justify-center">
             <Music className="h-16 w-16 text-muted-foreground/30" />
           </div>
         )}
 
         {/* Play overlay */}
         <div 
           className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
             isHovered || isPlaying ? 'opacity-100' : 'opacity-0'
           }`}
         >
           <Button
             size="icon"
             variant="secondary"
             className="h-14 w-14 rounded-full"
             onClick={(e) => {
               e.stopPropagation();
               onPlayToggle?.();
             }}
           >
             {isPlaying ? (
               <Pause className="h-6 w-6" />
             ) : (
               <Play className="h-6 w-6 ml-1" />
             )}
           </Button>
         </div>
 
         {/* License badge */}
         {!beat.is_exclusive_available && beat.license_type !== 'lease' && (
           <Badge className="absolute top-2 right-2 bg-destructive">
             Exclusive Sold
           </Badge>
         )}
       </div>
 
       <CardContent className="p-3 space-y-2">
         <div className="flex items-start justify-between gap-2">
           <div className="min-w-0">
             <h3 className="font-semibold truncate">{beat.title}</h3>
             <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
               <Avatar className="h-4 w-4">
                 <AvatarImage src={beat.producer?.avatar_url || undefined} />
                 <AvatarFallback className="text-[8px]">{producerInitial}</AvatarFallback>
               </Avatar>
               <span className="truncate">{producerName}</span>
             </div>
           </div>
         </div>
 
         {/* Metadata */}
         <div className="flex flex-wrap gap-1">
           {beat.bpm && (
             <Badge variant="secondary" className="text-xs">
               {beat.bpm} BPM
             </Badge>
           )}
           {beat.key_signature && (
             <Badge variant="secondary" className="text-xs">
               {beat.key_signature}
             </Badge>
           )}
           {beat.genre && (
             <Badge variant="outline" className="text-xs">
               {beat.genre}
             </Badge>
           )}
         </div>
 
         {/* Pricing */}
         <div className="flex items-center justify-between pt-1">
           <div className="space-y-0.5">
             <div className="flex items-center gap-1 text-sm">
               <Music className="h-3 w-3" />
               <span className="font-semibold">{formatPrice(beat.price_cents)}</span>
             </div>
             {beat.license_type !== 'lease' && beat.is_exclusive_available && (
               <div className="flex items-center gap-1 text-xs text-muted-foreground">
                 <Crown className="h-3 w-3 text-yellow-500" />
                 <span>{formatPrice(beat.exclusive_price_cents)}</span>
               </div>
             )}
           </div>
           <Button size="sm" variant="secondary" className="h-8">
             <ShoppingCart className="h-3 w-3 mr-1" />
             Buy
           </Button>
         </div>
 
         {/* Stats */}
         <div className="flex items-center gap-3 text-xs text-muted-foreground">
           <span>{beat.plays.toLocaleString()} plays</span>
           <span>{beat.downloads} sales</span>
         </div>
       </CardContent>
     </Card>
   );
 }