import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AssetGrid } from '@/components/admin/assets/AssetGrid';
import { AssetFilters } from '@/components/admin/assets/AssetFilters';
import { AssetDetailModal } from '@/components/admin/assets/AssetDetailModal';
import { StorageSyncButton } from '@/components/admin/assets/StorageSyncButton';
import { BulkActions } from '@/components/admin/assets/BulkActions';
import { BrandAsset } from '@/components/admin/assets/AssetCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Image as ImageIcon, 
  Video, 
  Star, 
  FolderOpen,
  Users,
  Palette,
  Layers,
  HelpCircle
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const categoryIcons: Record<string, React.ReactNode> = {
  all: <FolderOpen className="w-4 h-4" />,
  characters: <Users className="w-4 h-4" />,
  logos: <Palette className="w-4 h-4" />,
  backgrounds: <ImageIcon className="w-4 h-4" />,
  videos: <Video className="w-4 h-4" />,
  ui_elements: <Layers className="w-4 h-4" />,
  uncategorized: <HelpCircle className="w-4 h-4" />,
};

export default function AdminAssetGallery() {
  const queryClient = useQueryClient();
  
  // State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewAsset, setPreviewAsset] = useState<BrandAsset | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ ids: string[]; open: boolean }>({ ids: [], open: false });

  // Fetch assets
  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['brand-assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_assets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BrandAsset[];
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, category }: { id: string; category: string }) => {
      const { error } = await supabase
        .from('brand_assets')
        .update({ category })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-assets'] });
      toast.success('Category updated');
    },
  });

  // Apply asset mutation
  const applyAssetMutation = useMutation({
    mutationFn: async ({ id, context }: { id: string; context: string }) => {
      // First, remove is_active from any asset with the same context
      await supabase
        .from('brand_assets')
        .update({ is_active: false, asset_context: null })
        .eq('asset_context', context);
      
      // Then set this asset as active
      const { error } = await supabase
        .from('brand_assets')
        .update({ is_active: true, asset_context: context })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { context }) => {
      queryClient.invalidateQueries({ queryKey: ['brand-assets'] });
      toast.success(`Applied as ${context}`);
      setPreviewAsset(null);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('brand_assets')
        .delete()
        .in('id', ids);
      if (error) throw error;
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ['brand-assets'] });
      toast.success(`Deleted ${ids.length} asset(s)`);
      setSelectedIds([]);
      setDeleteConfirm({ ids: [], open: false });
    },
  });

  // Filtered and sorted assets
  const filteredAssets = useMemo(() => {
    let result = [...assets];

    // Filter by search
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter((a) => 
        a.name.toLowerCase().includes(lowerSearch) ||
        a.storage_path.toLowerCase().includes(lowerSearch)
      );
    }

    // Filter by category
    if (category !== 'all') {
      result = result.filter((a) => a.category === category);
    }

    // Sort
    switch (sortBy) {
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [assets, search, category, sortBy]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: assets.length };
    assets.forEach((a) => {
      const cat = a.category || 'uncategorized';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [assets]);

  // Stats
  const stats = useMemo(() => ({
    total: assets.length,
    active: assets.filter((a) => a.is_active).length,
    images: assets.filter((a) => a.asset_type === 'image').length,
    videos: assets.filter((a) => a.asset_type === 'video').length,
  }), [assets]);

  // Handlers
  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkCategoryChange = (newCategory: string) => {
    selectedIds.forEach((id) => {
      updateCategoryMutation.mutate({ id, category: newCategory });
    });
    setSelectedIds([]);
  };

  const handleApply = (asset: BrandAsset, context: string) => {
    applyAssetMutation.mutate({ id: asset.id, context });
  };

  const selectedUrls = selectedIds
    .map((id) => assets.find((a) => a.id === id)?.public_url)
    .filter(Boolean) as string[];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Brand Asset Gallery</h1>
            <p className="text-muted-foreground">
              Manage and organize your brand assets from cloud storage
            </p>
          </div>
          <StorageSyncButton />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass-mid">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FolderOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Assets</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-mid">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-mid">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <ImageIcon className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.images}</p>
                <p className="text-xs text-muted-foreground">Images</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-mid">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Video className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.videos}</p>
                <p className="text-xs text-muted-foreground">Videos</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category tabs */}
        <Tabs value={category} onValueChange={setCategory}>
          <TabsList className="flex-wrap h-auto gap-1 bg-muted/50 p-1">
            {['all', 'characters', 'logos', 'backgrounds', 'videos', 'ui_elements', 'uncategorized'].map((cat) => (
              <TabsTrigger key={cat} value={cat} className="gap-2 data-[state=active]:bg-background">
                {categoryIcons[cat]}
                <span className="capitalize">{cat.replace('_', ' ')}</span>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {categoryCounts[cat] || 0}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Filters */}
        <AssetFilters
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Grid */}
        <AssetGrid
          assets={filteredAssets}
          isLoading={isLoading}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onPreview={setPreviewAsset}
          onCategoryChange={(id, cat) => updateCategoryMutation.mutate({ id, category: cat })}
          onApply={(asset) => setPreviewAsset(asset)}
          onDelete={(id) => setDeleteConfirm({ ids: [id], open: true })}
        />

        {/* Detail modal */}
        <AssetDetailModal
          asset={previewAsset}
          open={!!previewAsset}
          onOpenChange={(open) => !open && setPreviewAsset(null)}
          onApply={handleApply}
        />

        {/* Bulk actions */}
        <BulkActions
          selectedCount={selectedIds.length}
          onClearSelection={() => setSelectedIds([])}
          onBulkCategoryChange={handleBulkCategoryChange}
          onBulkDelete={() => setDeleteConfirm({ ids: selectedIds, open: true })}
          selectedUrls={selectedUrls}
        />

        {/* Delete confirmation */}
        <AlertDialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {deleteConfirm.ids.length} asset(s)?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the asset(s) from the database. Files in storage will not be deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate(deleteConfirm.ids)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
