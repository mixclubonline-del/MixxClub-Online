import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface StorageFile {
  name: string;
  bucket: string;
  path: string;
  size: number;
  url: string;
}

export function StorageInspector() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const allFiles: StorageFile[] = [];

      // List showcase-audio files
      const { data: showcaseFiles, error: showcaseError } = await supabase.storage
        .from('showcase-audio')
        .list('', { limit: 100 });

      if (showcaseError) throw showcaseError;

      showcaseFiles?.forEach(file => {
        const { data } = supabase.storage.from('showcase-audio').getPublicUrl(file.name);
        allFiles.push({
          name: file.name,
          bucket: 'showcase-audio',
          path: file.name,
          size: file.metadata?.size || 0,
          url: data.publicUrl,
        });
      });

      // List media-library/beats files
      const { data: beatFiles, error: beatError } = await supabase.storage
        .from('media-library')
        .list('beats', { limit: 100 });

      if (beatError) throw beatError;

      beatFiles?.forEach(file => {
        const { data } = supabase.storage.from('media-library').getPublicUrl(`beats/${file.name}`);
        allFiles.push({
          name: file.name,
          bucket: 'media-library',
          path: `beats/${file.name}`,
          size: file.metadata?.size || 0,
          url: data.publicUrl,
        });
      });

      setFiles(allFiles);
    } catch (error: any) {
      console.error('Storage inspector error:', error);
      toast.error(`Failed to load files: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Storage Inspector</CardTitle>
            <CardDescription>
              View all audio files in showcase-audio and media-library buckets
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchFiles}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Loading files...</p>
        ) : files.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No files found</p>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Bucket</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file, idx) => (
                  <TableRow key={`${file.bucket}-${file.path}-${idx}`}>
                    <TableCell className="font-medium">{file.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{file.bucket}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{file.path}</TableCell>
                    <TableCell className="text-sm">{formatSize(file.size)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}