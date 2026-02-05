 import { useState, useRef, useEffect } from 'react';
 import { AppLayout } from '@/components/layouts/AppLayout';
 import { Card, CardContent } from '@/components/ui/card';
 import { Input } from '@/components/ui/input';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import { BeatMarketplaceCard, BeatDetailModal } from '@/components/marketplace';
 import { useBeatMarketplace, type MarketplaceBeat, type MarketplaceFilters } from '@/hooks/useBeatMarketplace';
 import { Search, SlidersHorizontal, Loader2, Music, X } from 'lucide-react';
 import { Skeleton } from '@/components/ui/skeleton';
 
 const GENRES = ['Hip Hop', 'Trap', 'R&B', 'Pop', 'Drill', 'Lo-Fi', 'Afrobeat', 'Reggaeton'];
 const KEY_SIGNATURES = ['C Major', 'C Minor', 'D Major', 'D Minor', 'E Major', 'E Minor', 'F Major', 'F Minor', 'G Major', 'G Minor', 'A Major', 'A Minor', 'B Major', 'B Minor'];
 
 export default function BeatMarketplace() {
   const [filters, setFilters] = useState<MarketplaceFilters>({
     sortBy: 'newest',
   });
   const [searchInput, setSearchInput] = useState('');
   const [selectedBeat, setSelectedBeat] = useState<MarketplaceBeat | null>(null);
   const [showFilters, setShowFilters] = useState(false);
   const [playingBeatId, setPlayingBeatId] = useState<string | null>(null);
   const audioRef = useRef<HTMLAudioElement | null>(null);
 
   const { beats, loading, error, hasMore, loadMore } = useBeatMarketplace(filters);
 
   // Handle search with debounce
   useEffect(() => {
     const timer = setTimeout(() => {
       setFilters(prev => ({ ...prev, search: searchInput || undefined }));
     }, 300);
     return () => clearTimeout(timer);
   }, [searchInput]);
 
   // Handle audio playback
   const handlePlayToggle = (beat: MarketplaceBeat) => {
     const audioUrl = beat.preview_url || beat.audio_url;
     if (!audioUrl) return;
 
     if (playingBeatId === beat.id) {
       audioRef.current?.pause();
       setPlayingBeatId(null);
     } else {
       if (audioRef.current) {
         audioRef.current.pause();
       }
       audioRef.current = new Audio(audioUrl);
       audioRef.current.play();
       audioRef.current.onended = () => setPlayingBeatId(null);
       setPlayingBeatId(beat.id);
     }
   };
 
   // Cleanup audio on unmount
   useEffect(() => {
     return () => {
       audioRef.current?.pause();
     };
   }, []);
 
   const clearFilters = () => {
     setFilters({ sortBy: 'newest' });
     setSearchInput('');
   };
 
   const activeFilterCount = Object.keys(filters).filter(
     k => k !== 'sortBy' && filters[k as keyof MarketplaceFilters]
   ).length;
 
   return (
     <AppLayout>
       <div className="container py-6 space-y-6">
         {/* Header */}
         <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
           <div>
             <h1 className="text-3xl font-bold">Beat Store</h1>
             <p className="text-muted-foreground">
               Discover and license beats from talented producers
             </p>
           </div>
         </div>
 
         {/* Search & Filters */}
         <div className="flex flex-col sm:flex-row gap-3">
           <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input
               placeholder="Search beats by title or tags..."
               value={searchInput}
               onChange={(e) => setSearchInput(e.target.value)}
               className="pl-10"
             />
           </div>
 
           <Select
             value={filters.sortBy || 'newest'}
             onValueChange={(value) => setFilters(prev => ({ 
               ...prev, 
               sortBy: value as MarketplaceFilters['sortBy'] 
             }))}
           >
             <SelectTrigger className="w-[160px]">
               <SelectValue placeholder="Sort by" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="newest">Newest</SelectItem>
               <SelectItem value="popular">Most Popular</SelectItem>
               <SelectItem value="price_low">Price: Low to High</SelectItem>
               <SelectItem value="price_high">Price: High to Low</SelectItem>
             </SelectContent>
           </Select>
 
           <Button
             variant={showFilters ? 'secondary' : 'outline'}
             onClick={() => setShowFilters(!showFilters)}
           >
             <SlidersHorizontal className="h-4 w-4 mr-2" />
             Filters
             {activeFilterCount > 0 && (
               <Badge variant="secondary" className="ml-2">
                 {activeFilterCount}
               </Badge>
             )}
           </Button>
         </div>
 
         {/* Filter Panel */}
         {showFilters && (
           <Card>
             <CardContent className="pt-4 space-y-4">
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                 <div className="space-y-2">
                   <label className="text-sm font-medium">Genre</label>
                   <Select
                     value={filters.genre || ''}
                     onValueChange={(value) => setFilters(prev => ({ 
                       ...prev, 
                       genre: value || undefined 
                     }))}
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Any genre" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="">Any genre</SelectItem>
                       {GENRES.map(genre => (
                         <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
 
                 <div className="space-y-2">
                   <label className="text-sm font-medium">Key</label>
                   <Select
                     value={filters.keySignature || ''}
                     onValueChange={(value) => setFilters(prev => ({ 
                       ...prev, 
                       keySignature: value || undefined 
                     }))}
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Any key" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="">Any key</SelectItem>
                       {KEY_SIGNATURES.map(key => (
                         <SelectItem key={key} value={key}>{key}</SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
 
                 <div className="space-y-2">
                   <label className="text-sm font-medium">BPM Range</label>
                   <div className="flex gap-2">
                     <Input
                       type="number"
                       placeholder="Min"
                       value={filters.bpmMin || ''}
                       onChange={(e) => setFilters(prev => ({ 
                         ...prev, 
                         bpmMin: e.target.value ? Number(e.target.value) : undefined 
                       }))}
                       className="w-20"
                     />
                     <Input
                       type="number"
                       placeholder="Max"
                       value={filters.bpmMax || ''}
                       onChange={(e) => setFilters(prev => ({ 
                         ...prev, 
                         bpmMax: e.target.value ? Number(e.target.value) : undefined 
                       }))}
                       className="w-20"
                     />
                   </div>
                 </div>
 
                 <div className="space-y-2">
                   <label className="text-sm font-medium">Price Range</label>
                   <div className="flex gap-2">
                     <Input
                       type="number"
                       placeholder="Min $"
                       value={filters.priceMin || ''}
                       onChange={(e) => setFilters(prev => ({ 
                         ...prev, 
                         priceMin: e.target.value ? Number(e.target.value) : undefined 
                       }))}
                       className="w-20"
                     />
                     <Input
                       type="number"
                       placeholder="Max $"
                       value={filters.priceMax || ''}
                       onChange={(e) => setFilters(prev => ({ 
                         ...prev, 
                         priceMax: e.target.value ? Number(e.target.value) : undefined 
                       }))}
                       className="w-20"
                     />
                   </div>
                 </div>
               </div>
 
               {activeFilterCount > 0 && (
                 <Button variant="ghost" size="sm" onClick={clearFilters}>
                   <X className="h-4 w-4 mr-1" />
                   Clear all filters
                 </Button>
               )}
             </CardContent>
           </Card>
         )}
 
         {/* Results */}
         {error ? (
           <Card className="p-8 text-center">
             <p className="text-destructive">{error}</p>
             <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
               Try Again
             </Button>
           </Card>
         ) : loading && beats.length === 0 ? (
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
             {Array.from({ length: 8 }).map((_, i) => (
               <Card key={i} className="overflow-hidden">
                 <Skeleton className="aspect-square" />
                 <CardContent className="p-3 space-y-2">
                   <Skeleton className="h-5 w-3/4" />
                   <Skeleton className="h-4 w-1/2" />
                   <Skeleton className="h-6 w-20" />
                 </CardContent>
               </Card>
             ))}
           </div>
         ) : beats.length === 0 ? (
           <Card className="p-12 text-center">
             <Music className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
             <h3 className="text-xl font-semibold mb-2">No beats found</h3>
             <p className="text-muted-foreground mb-4">
               Try adjusting your filters or search term
             </p>
             <Button variant="outline" onClick={clearFilters}>
               Clear Filters
             </Button>
           </Card>
         ) : (
           <>
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
               {beats.map((beat) => (
                 <BeatMarketplaceCard
                   key={beat.id}
                   beat={beat}
                   onSelect={setSelectedBeat}
                   isPlaying={playingBeatId === beat.id}
                   onPlayToggle={() => handlePlayToggle(beat)}
                 />
               ))}
             </div>
 
             {/* Load More */}
             {hasMore && (
               <div className="flex justify-center pt-4">
                 <Button
                   variant="outline"
                   onClick={loadMore}
                   disabled={loading}
                 >
                   {loading ? (
                     <>
                       <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                       Loading...
                     </>
                   ) : (
                     'Load More Beats'
                   )}
                 </Button>
               </div>
             )}
           </>
         )}
 
         {/* Beat Detail Modal */}
         <BeatDetailModal
           beat={selectedBeat}
           open={!!selectedBeat}
           onOpenChange={(open) => !open && setSelectedBeat(null)}
         />
       </div>
     </AppLayout>
   );
 }