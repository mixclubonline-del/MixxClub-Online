 import { motion } from 'framer-motion';
 import { Play, Pause, MoreHorizontal, Edit, Trash2, Archive, Eye, Download, DollarSign } from 'lucide-react';
 import { useState } from 'react';
 import { Card } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
 import type { ProducerBeat } from '@/hooks/useProducerBeats';
 
 interface BeatCardProps {
   beat: ProducerBeat;
   onEdit?: (beat: ProducerBeat) => void;
   onDelete?: (beatId: string) => void;
   onArchive?: (beatId: string) => void;
   onPublish?: (beatId: string) => void;
 }
 
 export function BeatCard({ beat, onEdit, onDelete, onArchive, onPublish }: BeatCardProps) {
   const [isPlaying, setIsPlaying] = useState(false);
 
   const formatPrice = (cents: number | null) => {
     return `$${((cents || 0) / 100).toFixed(2)}`;
   };
 
   const statusColors: Record<string, string> = {
     draft: 'bg-muted text-muted-foreground',
     published: 'bg-emerald-500/20 text-emerald-400',
     archived: 'bg-amber-500/20 text-amber-400',
   };
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 10 }}
       animate={{ opacity: 1, y: 0 }}
       whileHover={{ y: -2 }}
     >
       <Card className="overflow-hidden group">
         {/* Cover Image / Waveform Area */}
         <div className="aspect-square relative bg-gradient-to-br from-primary/20 to-accent/20">
           {beat.cover_image_url ? (
             <img 
               src={beat.cover_image_url} 
               alt={beat.title}
               className="w-full h-full object-cover"
             />
           ) : (
             <div className="w-full h-full flex items-center justify-center">
             <div className="text-6xl opacity-30">🎵</div>
             </div>
           )}
           
           {/* Play Button Overlay */}
           <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
             <Button
               size="lg"
               variant="secondary"
               className="rounded-full h-14 w-14"
               onClick={() => setIsPlaying(!isPlaying)}
             >
               {isPlaying ? (
                 <Pause className="h-6 w-6" />
               ) : (
                 <Play className="h-6 w-6 ml-1" />
               )}
             </Button>
           </div>
 
           {/* Status Badge */}
           <Badge 
             className={`absolute top-2 left-2 ${statusColors[beat.status || 'draft']}`}
           >
             {beat.status || 'draft'}
           </Badge>
 
           {/* Actions Menu */}
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button
                 size="icon"
                 variant="ghost"
                 className="absolute top-2 right-2 h-8 w-8 bg-black/50 hover:bg-black/70"
               >
                 <MoreHorizontal className="h-4 w-4" />
               </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="end">
               <DropdownMenuItem onClick={() => onEdit?.(beat)}>
                 <Edit className="h-4 w-4 mr-2" />
                 Edit Details
               </DropdownMenuItem>
               {beat.status === 'draft' && (
                 <DropdownMenuItem onClick={() => onPublish?.(beat.id)}>
                   <Eye className="h-4 w-4 mr-2" />
                   Publish
                 </DropdownMenuItem>
               )}
               {beat.status === 'published' && (
                 <DropdownMenuItem onClick={() => onArchive?.(beat.id)}>
                   <Archive className="h-4 w-4 mr-2" />
                   Archive
                 </DropdownMenuItem>
               )}
               <DropdownMenuSeparator />
               <DropdownMenuItem 
                 onClick={() => onDelete?.(beat.id)}
                 className="text-destructive"
               >
                 <Trash2 className="h-4 w-4 mr-2" />
                 Delete
               </DropdownMenuItem>
             </DropdownMenuContent>
           </DropdownMenu>
         </div>
 
         {/* Beat Info */}
         <div className="p-4 space-y-3">
           <div>
             <h3 className="font-semibold truncate">{beat.title}</h3>
             <div className="flex items-center gap-2 text-sm text-muted-foreground">
               {beat.bpm && <span>{beat.bpm} BPM</span>}
               {beat.key_signature && (
                 <>
                   <span>•</span>
                   <span>{beat.key_signature}</span>
                 </>
               )}
             </div>
           </div>
 
           {/* Genre Tags */}
           <div className="flex flex-wrap gap-1">
             {beat.genre && (
               <Badge variant="outline" className="text-xs">
                 {beat.genre}
               </Badge>
             )}
             {beat.tags?.slice(0, 2).map((tag, i) => (
               <Badge key={i} variant="secondary" className="text-xs">
                 {tag}
               </Badge>
             ))}
           </div>
 
           {/* Stats */}
           <div className="flex items-center justify-between text-sm">
           <div className="flex items-center gap-3 text-muted-foreground">
               <span className="flex items-center gap-1">
                 <Play className="h-3 w-3" />
                 {beat.plays || 0}
               </span>
               <span className="flex items-center gap-1">
                 <Download className="h-3 w-3" />
                 {beat.downloads || 0}
               </span>
             </div>
             <div className="flex items-center gap-1 font-semibold text-primary">
               <DollarSign className="h-3 w-3" />
               {formatPrice(beat.price_cents)}
             </div>
           </div>
         </div>
       </Card>
     </motion.div>
   );
 }