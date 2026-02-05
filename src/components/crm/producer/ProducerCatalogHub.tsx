 import { CharacterEmptyState } from '@/components/characters/CharacterEmptyState';
 import { useProducerBeats } from '@/hooks/useProducerBeats';
 import { BeatCard } from '@/components/producer/BeatCard';
 import { Skeleton } from '@/components/ui/skeleton';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { Disc3, Eye, Archive } from 'lucide-react';
 
 export const ProducerCatalogHub = () => {
   const { beats, publishedBeats, draftBeats, archivedBeats, isLoading, publishBeat, archiveBeat, deleteBeat } = useProducerBeats();
 
   if (isLoading) {
     return (
       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
         {[1, 2, 3, 4].map((i) => (
           <Skeleton key={i} className="aspect-square rounded-lg" />
         ))}
       </div>
     );
   }
 
   if (beats.length === 0) {
     return (
       <CharacterEmptyState
         type="catalog"
         characterId="tempo"
         title="Your Beat Catalog"
         actionLabel="Upload Your First Beat"
         onAction={() => {}}
       />
     );
   }
 
   return (
     <div className="space-y-6">
       <Tabs defaultValue="all" className="w-full">
         <TabsList>
           <TabsTrigger value="all" className="gap-2">
             <Disc3 className="h-4 w-4" />
             All ({beats.length})
           </TabsTrigger>
           <TabsTrigger value="published" className="gap-2">
             <Eye className="h-4 w-4" />
             Published ({publishedBeats.length})
           </TabsTrigger>
           <TabsTrigger value="drafts" className="gap-2">
             Drafts ({draftBeats.length})
           </TabsTrigger>
           <TabsTrigger value="archived" className="gap-2">
             <Archive className="h-4 w-4" />
             Archived ({archivedBeats.length})
           </TabsTrigger>
         </TabsList>
 
         <TabsContent value="all" className="mt-4">
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
             {beats.map((beat) => (
               <BeatCard
                 key={beat.id}
                 beat={beat}
                 onPublish={publishBeat}
                 onArchive={archiveBeat}
                 onDelete={deleteBeat}
               />
             ))}
           </div>
         </TabsContent>
 
         <TabsContent value="published" className="mt-4">
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
             {publishedBeats.map((beat) => (
               <BeatCard key={beat.id} beat={beat} onArchive={archiveBeat} />
             ))}
           </div>
         </TabsContent>
 
         <TabsContent value="drafts" className="mt-4">
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
             {draftBeats.map((beat) => (
               <BeatCard key={beat.id} beat={beat} onPublish={publishBeat} onDelete={deleteBeat} />
             ))}
           </div>
         </TabsContent>
 
         <TabsContent value="archived" className="mt-4">
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
             {archivedBeats.map((beat) => (
               <BeatCard key={beat.id} beat={beat} onDelete={deleteBeat} />
             ))}
           </div>
         </TabsContent>
       </Tabs>
     </div>
   );
 };