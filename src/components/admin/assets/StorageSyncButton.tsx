import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface StorageSyncButtonProps {
  onSyncComplete?: (count: number) => void;
}

export function StorageSyncButton({ onSyncComplete }: StorageSyncButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();

  const syncFromStorage = async () => {
    setIsSyncing(true);
    let syncedCount = 0;

    try {
      // Get all files from brand-assets bucket
      const { data: storageFiles, error: listError } = await supabase.storage
        .from('brand-assets')
        .list('', { limit: 1000 });

      if (listError) throw listError;

      // Also check subfolders
      const allFiles: { name: string; path: string; metadata?: { size?: number; mimetype?: string } }[] = [];
      
      for (const item of storageFiles || []) {
        if (item.id === null) {
          // It's a folder, list its contents
          const { data: subFiles } = await supabase.storage
            .from('brand-assets')
            .list(item.name, { limit: 1000 });
          
          if (subFiles) {
            for (const subFile of subFiles) {
              if (subFile.id !== null) {
                allFiles.push({
                  name: subFile.name,
                  path: `${item.name}/${subFile.name}`,
                  metadata: subFile.metadata as { size?: number; mimetype?: string },
                });
              }
            }
          }
        } else {
          allFiles.push({
            name: item.name,
            path: item.name,
            metadata: item.metadata as { size?: number; mimetype?: string },
          });
        }
      }

      // Get existing assets from database
      const { data: existingAssets } = await supabase
        .from('brand_assets')
        .select('storage_path');

      const existingPaths = new Set(existingAssets?.map((a) => a.storage_path) || []);

      // Filter for new files only
      const newFiles = allFiles.filter((f) => !existingPaths.has(f.path));

      if (newFiles.length === 0) {
        toast.info('All storage files are already synced');
        setIsSyncing(false);
        return;
      }

      // Insert new assets
      const assetsToInsert = newFiles.map((file) => {
        const { data: urlData } = supabase.storage
          .from('brand-assets')
          .getPublicUrl(file.path);

        // Determine asset type from extension
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const isVideo = ['mp4', 'webm', 'mov'].includes(ext);
        const assetType = isVideo ? 'video' : 'image';

        // Auto-categorize based on path/name
        let category = 'uncategorized';
        const lowerPath = file.path.toLowerCase();
        if (lowerPath.includes('logo')) category = 'logos';
        else if (lowerPath.includes('prime') || lowerPath.includes('character')) category = 'characters';
        else if (lowerPath.includes('background') || lowerPath.includes('landscape')) category = 'backgrounds';
        else if (isVideo) category = 'videos';

        return {
          name: file.name,
          asset_type: assetType,
          storage_path: file.path,
          public_url: urlData.publicUrl,
          category,
          is_active: false,
          metadata: file.metadata ? { size: file.metadata.size, mimetype: file.metadata.mimetype } : {},
        };
      });

      const { error: insertError } = await supabase
        .from('brand_assets')
        .insert(assetsToInsert);

      if (insertError) throw insertError;

      syncedCount = assetsToInsert.length;
      toast.success(`Synced ${syncedCount} new assets from storage`);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['brand-assets'] });
      onSyncComplete?.(syncedCount);
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync from storage');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button onClick={syncFromStorage} disabled={isSyncing} variant="outline">
      <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
      {isSyncing ? 'Syncing...' : 'Sync from Storage'}
    </Button>
  );
}
