import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Download,
  Star,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Video,
  Calendar,
  HardDrive,
} from 'lucide-react';
import { BrandAsset } from './AssetCard';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AssetDetailModalProps {
  asset: BrandAsset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (asset: BrandAsset, context: string) => void;
}

const applyContexts = [
  { value: 'hero', label: 'Hero Background' },
  { value: 'navigation', label: 'Navigation Logo' },
  { value: 'favicon', label: 'Favicon' },
  { value: 'splash', label: 'Splash Screen' },
  { value: 'general', label: 'General Asset' },
];

export function AssetDetailModal({
  asset,
  open,
  onOpenChange,
  onApply,
}: AssetDetailModalProps) {
  if (!asset) return null;

  const isVideo = asset.asset_type?.includes('video') || asset.public_url?.includes('.mp4');

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(asset.public_url);
    toast.success('URL copied to clipboard');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = asset.public_url;
    link.download = asset.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  };

  const handleOpenExternal = () => {
    window.open(asset.public_url, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isVideo ? <Video className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
            {asset.name}
            {asset.is_active && (
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preview */}
          <div className="bg-muted/30 rounded-lg overflow-hidden flex items-center justify-center min-h-[300px]">
            {isVideo ? (
              <video
                src={asset.public_url}
                controls
                className="max-w-full max-h-[400px] object-contain"
              />
            ) : (
              <img
                src={asset.public_url}
                alt={asset.name}
                className="max-w-full max-h-[400px] object-contain"
              />
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            {/* Quick actions */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyUrl}>
                <Copy className="w-4 h-4 mr-2" />
                Copy URL
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleOpenExternal}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Open
              </Button>
            </div>

            <Separator />

            {/* Metadata */}
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Category</p>
                <Badge variant="outline">
                  {(asset.category || 'uncategorized').replace('_', ' ')}
                </Badge>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Type</p>
                <p className="text-sm">{asset.asset_type || 'Unknown'}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Storage Path</p>
                <p className="text-sm font-mono text-xs break-all bg-muted/50 p-2 rounded">
                  {asset.storage_path}
                </p>
              </div>

              <div className="flex gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Created
                  </p>
                  <p className="text-sm">
                    {format(new Date(asset.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
                {asset.metadata?.size && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <HardDrive className="w-3 h-3" /> Size
                    </p>
                    <p className="text-sm">
                      {formatFileSize(asset.metadata.size as number)}
                    </p>
                  </div>
                )}
              </div>

              {asset.asset_context && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Currently Applied As</p>
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    {asset.asset_context}
                  </Badge>
                </div>
              )}
            </div>

            <Separator />

            {/* Apply to site */}
            <div>
              <p className="text-sm font-medium mb-2">Apply to Site</p>
              <div className="grid grid-cols-2 gap-2">
                {applyContexts.map((ctx) => (
                  <Button
                    key={ctx.value}
                    variant={asset.asset_context === ctx.value ? 'default' : 'outline'}
                    size="sm"
                    className="justify-start"
                    onClick={() => onApply(asset, ctx.value)}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    {ctx.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
