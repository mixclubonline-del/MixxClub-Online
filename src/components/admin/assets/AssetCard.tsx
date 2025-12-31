import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Eye, 
  MoreVertical, 
  Star, 
  Download, 
  Trash2,
  Tag,
  ImageIcon,
  Video,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BrandAsset {
  id: string;
  name: string;
  asset_type: string;
  storage_path: string;
  public_url: string;
  thumbnail_url?: string;
  category?: string;
  is_active?: boolean;
  asset_context?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

interface AssetCardProps {
  asset: BrandAsset;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onPreview: (asset: BrandAsset) => void;
  onCategoryChange: (id: string, category: string) => void;
  onApply: (asset: BrandAsset) => void;
  onDelete: (id: string) => void;
}

const categoryColors: Record<string, string> = {
  characters: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  logos: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  backgrounds: 'bg-green-500/20 text-green-300 border-green-500/30',
  videos: 'bg-red-500/20 text-red-300 border-red-500/30',
  ui_elements: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  uncategorized: 'bg-muted text-muted-foreground border-border',
};

export function AssetCard({
  asset,
  isSelected,
  onSelect,
  onPreview,
  onCategoryChange,
  onApply,
  onDelete,
}: AssetCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const isVideo = asset.asset_type?.includes('video') || asset.public_url?.includes('.mp4');
  const category = asset.category || 'uncategorized';

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = asset.public_url;
    link.download = asset.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card
      className={cn(
        'group relative overflow-hidden glass-mid border transition-all duration-200 hover:border-primary/50',
        isSelected && 'ring-2 ring-primary border-primary'
      )}
    >
      {/* Selection checkbox */}
      {onSelect && (
        <button
          onClick={() => onSelect(asset.id)}
          className={cn(
            'absolute top-2 left-2 z-20 w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
            isSelected
              ? 'bg-primary border-primary text-primary-foreground'
              : 'bg-background/80 border-muted-foreground/50 opacity-0 group-hover:opacity-100'
          )}
        >
          {isSelected && <Check className="w-3 h-3" />}
        </button>
      )}

      {/* Active indicator */}
      {asset.is_active && (
        <div className="absolute top-2 right-2 z-20">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        </div>
      )}

      {/* Image/Video preview */}
      <div 
        className="aspect-square bg-muted/50 relative cursor-pointer overflow-hidden"
        onClick={() => onPreview(asset)}
      >
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center animate-pulse">
            {isVideo ? (
              <Video className="w-8 h-8 text-muted-foreground" />
            ) : (
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
        )}
        
        {isVideo ? (
          <video
            src={asset.public_url}
            className={cn(
              'w-full h-full object-cover transition-opacity',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoadedData={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            muted
            playsInline
          />
        ) : (
          <img
            src={asset.thumbnail_url || asset.public_url}
            alt={asset.name}
            className={cn(
              'w-full h-full object-cover transition-all duration-200 group-hover:scale-105',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}

        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); onPreview(asset); }}>
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>
        </div>
      </div>

      {/* Info section */}
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium truncate flex-1" title={asset.name}>
            {asset.name}
          </p>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onPreview(asset)}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onApply(asset)}>
                <Star className="w-4 h-4 mr-2" />
                Apply to Site
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
                <Tag className="w-4 h-4 mr-2" />
                Set Category
              </DropdownMenuItem>
              {['characters', 'logos', 'backgrounds', 'videos', 'ui_elements', 'uncategorized'].map((cat) => (
                <DropdownMenuItem 
                  key={cat} 
                  onClick={() => onCategoryChange(asset.id, cat)}
                  className="pl-8"
                >
                  {cat.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}
                  {category === cat && <Check className="w-4 h-4 ml-auto" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(asset.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Badge 
          variant="outline" 
          className={cn('text-xs', categoryColors[category])}
        >
          {category.replace('_', ' ')}
        </Badge>
      </div>
    </Card>
  );
}
