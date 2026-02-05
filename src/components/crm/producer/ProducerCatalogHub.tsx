import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CharacterEmptyState } from '@/components/characters/CharacterEmptyState';
import { useProducerBeats, type ProducerBeat } from '@/hooks/useProducerBeats';
import { BeatCard } from '@/components/producer/BeatCard';
import { BeatUploadModal } from '@/components/producer/BeatUploadModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Disc3, Eye, Archive, Plus, Search, SlidersHorizontal } from 'lucide-react';

type SortOption = 'newest' | 'oldest' | 'plays' | 'price';

export const ProducerCatalogHub = () => {
  const { beats, publishedBeats, draftBeats, archivedBeats, isLoading, publishBeat, archiveBeat, deleteBeat } = useProducerBeats();
  
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editingBeat, setEditingBeat] = useState<ProducerBeat | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Filter and sort beats
  const filterAndSortBeats = (beatList: ProducerBeat[]) => {
    let filtered = beatList;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(beat => 
        beat.title.toLowerCase().includes(query) ||
        beat.genre?.toLowerCase().includes(query) ||
        beat.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'plays':
          return (b.plays || 0) - (a.plays || 0);
        case 'price':
          return (b.price_cents || 0) - (a.price_cents || 0);
        default:
          return 0;
      }
    });
  };

  const filteredBeats = useMemo(() => filterAndSortBeats(beats), [beats, searchQuery, sortBy]);
  const filteredPublished = useMemo(() => filterAndSortBeats(publishedBeats), [publishedBeats, searchQuery, sortBy]);
  const filteredDrafts = useMemo(() => filterAndSortBeats(draftBeats), [draftBeats, searchQuery, sortBy]);
  const filteredArchived = useMemo(() => filterAndSortBeats(archivedBeats), [archivedBeats, searchQuery, sortBy]);

  const handleEdit = (beat: ProducerBeat) => {
    setEditingBeat(beat);
  };

  const handleEditClose = () => {
    setEditingBeat(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (beats.length === 0 && !searchQuery) {
    return (
      <>
        <CharacterEmptyState
          type="catalog"
          characterId="tempo"
          title="Your Beat Catalog"
          actionLabel="Upload Your First Beat"
          onAction={() => setUploadModalOpen(true)}
        />
        <BeatUploadModal 
          open={uploadModalOpen} 
          onOpenChange={setUploadModalOpen}
        />
      </>
    );
  }

  const renderBeatGrid = (beatList: ProducerBeat[], showPublish = false, showArchive = false, showDelete = true) => {
    if (beatList.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <p>No beats found</p>
          {searchQuery && <p className="text-sm mt-1">Try adjusting your search</p>}
        </div>
      );
    }

    return (
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
          }
        }}
      >
        {beatList.map((beat) => (
          <BeatCard
            key={beat.id}
            beat={beat}
            onEdit={handleEdit}
            onPublish={showPublish ? publishBeat : undefined}
            onArchive={showArchive ? archiveBeat : undefined}
            onDelete={showDelete ? deleteBeat : undefined}
          />
        ))}
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Upload Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search beats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[140px]">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="plays">Most Plays</SelectItem>
              <SelectItem value="price">Highest Price</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setUploadModalOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Upload Beat
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:flex">
          <TabsTrigger value="all" className="gap-2">
            <Disc3 className="h-4 w-4 hidden sm:block" />
            All ({filteredBeats.length})
          </TabsTrigger>
          <TabsTrigger value="published" className="gap-2">
            <Eye className="h-4 w-4 hidden sm:block" />
            Published ({filteredPublished.length})
          </TabsTrigger>
          <TabsTrigger value="drafts" className="gap-2">
            Drafts ({filteredDrafts.length})
          </TabsTrigger>
          <TabsTrigger value="archived" className="gap-2">
            <Archive className="h-4 w-4 hidden sm:block" />
            Archived ({filteredArchived.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {renderBeatGrid(filteredBeats, true, true, true)}
        </TabsContent>

        <TabsContent value="published" className="mt-4">
          {renderBeatGrid(filteredPublished, false, true, false)}
        </TabsContent>

        <TabsContent value="drafts" className="mt-4">
          {renderBeatGrid(filteredDrafts, true, false, true)}
        </TabsContent>

        <TabsContent value="archived" className="mt-4">
          {renderBeatGrid(filteredArchived, false, false, true)}
        </TabsContent>
      </Tabs>

      {/* Upload Modal */}
      <BeatUploadModal 
        open={uploadModalOpen} 
        onOpenChange={setUploadModalOpen}
      />

      {/* Edit Modal */}
      {editingBeat && (
        <BeatUploadModal
          open={!!editingBeat}
          onOpenChange={handleEditClose}
          mode="edit"
          editBeat={{
            id: editingBeat.id,
            title: editingBeat.title,
            bpm: editingBeat.bpm ?? undefined,
            key_signature: editingBeat.key_signature ?? undefined,
            genre: editingBeat.genre ?? undefined,
            tags: editingBeat.tags ?? undefined,
            description: editingBeat.description ?? undefined,
            mood: editingBeat.mood ?? undefined,
            price_cents: editingBeat.price_cents ?? undefined,
            exclusive_price_cents: editingBeat.exclusive_price_cents ?? undefined,
            license_type: editingBeat.license_type ?? undefined,
            audioUrl: editingBeat.audio_url ?? undefined,
            coverUrl: editingBeat.cover_image_url ?? undefined,
          }}
        />
      )}
    </div>
  );
};
