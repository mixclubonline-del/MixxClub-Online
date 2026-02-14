import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const BUCKET = 'brand-assets';

export function usePressBrandAssets() {
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  const download = useCallback(async (storagePath: string, zipName: string) => {
    if (loadingPath) return;
    setLoadingPath(storagePath);

    try {
      const { data: files, error } = await supabase.storage
        .from(BUCKET)
        .list(storagePath);

      // Filter out folder placeholders (.emptyFolderPlaceholder, etc.)
      const realFiles = (files ?? []).filter(
        (f) => f.name && !f.name.startsWith('.') && f.id
      );

      if (error || realFiles.length === 0) {
        toast.info('Press kit coming soon — check back shortly.');
        return;
      }

      if (realFiles.length === 1) {
        // Single file — direct download
        const filePath = `${storagePath}/${realFiles[0].name}`;
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
        triggerDownload(data.publicUrl, realFiles[0].name);
        toast.success('Download started');
        return;
      }

      // Multiple files — bundle as zip
      const zip = new JSZip();
      const fetchPromises = realFiles.map(async (file) => {
        const filePath = `${storagePath}/${file.name}`;
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
        const response = await fetch(data.publicUrl);
        if (!response.ok) return;
        const blob = await response.blob();
        zip.file(file.name, blob);
      });

      await Promise.all(fetchPromises);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      triggerDownload(url, `${zipName}.zip`);
      URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (err) {
      console.error('Press asset download failed:', err);
      toast.error('Download failed — please try again.');
    } finally {
      setLoadingPath(null);
    }
  }, [loadingPath]);

  return { download, loadingPath };
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
