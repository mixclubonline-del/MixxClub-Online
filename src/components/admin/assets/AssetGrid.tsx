import { AssetCard, BrandAsset } from './AssetCard';
import { Skeleton } from '@/components/ui/skeleton';

interface AssetGridProps {
  assets: BrandAsset[];
  isLoading?: boolean;
  selectedIds: string[];
  onSelect: (id: string) => void;
  onPreview: (asset: BrandAsset) => void;
  onCategoryChange: (id: string, category: string) => void;
  onApply: (asset: BrandAsset) => void;
  onDelete: (id: string) => void;
}

export function AssetGrid({
  assets,
  isLoading,
  selectedIds,
  onSelect,
  onPreview,
  onCategoryChange,
  onApply,
  onDelete,
}: AssetGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-2xl">🖼️</span>
        </div>
        <h3 className="text-lg font-medium mb-1">No assets found</h3>
        <p className="text-muted-foreground text-sm">
          Try adjusting your filters or sync from storage
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {assets.map((asset) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          isSelected={selectedIds.includes(asset.id)}
          onSelect={onSelect}
          onPreview={onPreview}
          onCategoryChange={onCategoryChange}
          onApply={onApply}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
