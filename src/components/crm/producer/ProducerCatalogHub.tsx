import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CharacterEmptyState } from '@/components/characters/CharacterEmptyState';
import { useProducerBeats, type ProducerBeat } from '@/hooks/useProducerBeats';
import { BeatCard } from '@/components/producer/BeatCard';
import { BeatUploadModal } from '@/components/producer/BeatUploadModal';
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
import { Disc3, Eye, Archive, Plus, Search, SlidersHorizontal, FileText, Tag, Star, BarChart3, Package } from 'lucide-react';
import { GlassPanel, HubHeader, HubSkeleton } from '../design';
import { LicenseBuilder } from './LicenseBuilder';
import { PromoCodeManager } from './PromoCodeManager';
import { FeaturedRotation } from './FeaturedRotation';
import { BeatAnalytics } from '@/components/producer/BeatAnalytics';
import { SamplePackBuilder } from '@/components/producer/SamplePackBuilder';

type SortOption = 'newest' | 'oldest' | 'plays' | 'price';

export const ProducerCatalogHub = () => {
  const { beats, publishedBeats, draftBeats, archivedBeats, isLoading, publishBeat, archiveBeat, deleteBeat } = useProducerBeats();

  const [catalogMode, setCatalogMode] = useState<'catalog' | 'licenses' | 'promos' | 'featured'>('catalog');
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
    return <HubSkeleton variant="cards" count={4} />;
  }

  const showEmptyCatalog = beats.length === 0 && !searchQuery && catalogMode === 'catalog';

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
      {/* Top-level mode tabs: Catalog / Licenses / Promos / Featured */}
      <HubHeader
        icon={<Disc3 className="h-5 w-5 text-purple-400" />}
        title="Beat Catalog"
        subtitle={`${beats.length} beats · ${publishedBeats.length} published`}
        accent="rgba(168, 85, 247, 0.5)"
        action={
          <Button onClick={() => setUploadModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload Beat
          </Button>
        }
      />

      <GlassPanel padding="p-1">
        <div className="flex gap-1">
          {(['catalog', 'licenses', 'promos', 'featured'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setCatalogMode(mode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${catalogMode === mode
                ? 'bg-white/10 text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
            >
              {mode === 'catalog' && <Disc3 className="h-4 w-4" />}
              {mode === 'licenses' && <FileText className="h-4 w-4" />}
              {mode === 'promos' && <Tag className="h-4 w-4" />}
              {mode === 'featured' && <Star className="h-4 w-4" />}
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </GlassPanel>

      {catalogMode === 'licenses' && <LicenseBuilder />}
      {catalogMode === 'promos' && <PromoCodeManager />}
      {catalogMode === 'featured' && <FeaturedRotation />}

      {catalogMode === 'catalog' && showEmptyCatalog && (
        <>
          <CharacterEmptyState
            type="catalog"
            characterId="rell"
            title="Your Beat Catalog"
            actionLabel="Upload Your First Beat"
            onAction={() => setUploadModalOpen(true)}
          />
        </>
      )}

      {catalogMode === 'catalog' && !showEmptyCatalog && (
        <>
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
        </>)}
    </div>
  );
};
