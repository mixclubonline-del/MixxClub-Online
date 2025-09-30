import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, Image as ImageIcon, Trash2, Copy } from 'lucide-react';

interface MediaFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number | null;
  alt_text: string | null;
  tags: string[];
  category: string;
  created_at: string;
}

export default function AdminMedia() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');
  const [category, setCategory] = useState('general');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      checkAdminStatus();
      fetchMediaFiles();
    }
  }, [user, loading, navigate]);

  const checkAdminStatus = async () => {
    const { data, error } = await supabase.rpc('is_admin', { user_uuid: user?.id });
    if (error || !data) {
      navigate('/');
    }
  };

  const fetchMediaFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMediaFiles(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch media files',
        variant: 'destructive',
      });
    } finally {
      setDataLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      // Upload file to storage
      const filePath = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('media-library')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create database record
      const tagsArray = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const { error: dbError } = await supabase.from('media_library').insert({
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        alt_text: altText || null,
        tags: tagsArray,
        category,
        uploaded_by: user?.id,
      });

      if (dbError) throw dbError;

      toast({
        title: 'Success',
        description: 'Media file uploaded successfully',
      });

      // Reset form
      setFile(null);
      setAltText('');
      setCategory('general');
      setTags('');
      fetchMediaFiles();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload media file',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, filePath: string) => {
    if (!confirm('Are you sure you want to delete this media file?')) return;

    try {
      // Delete file from storage
      await supabase.storage.from('media-library').remove([filePath]);

      // Delete database record
      const { error } = await supabase.from('media_library').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Media file deleted successfully',
      });

      fetchMediaFiles();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete media file',
        variant: 'destructive',
      });
    }
  };

  const getPublicUrl = (filePath: string) => {
    const { data } = supabase.storage.from('media-library').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const copyUrl = (filePath: string) => {
    const url = getPublicUrl(filePath);
    navigator.clipboard.writeText(url);
    toast({
      title: 'Copied!',
      description: 'URL copied to clipboard',
    });
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  if (loading || dataLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">
            Manage images and assets for your website
          </p>
        </div>

        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload New Media
            </CardTitle>
            <CardDescription>
              Upload images and assets to use across your site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">File *</Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                />
                {file && <p className="text-sm text-muted-foreground">{file.name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="altText">Alt Text</Label>
                  <Input
                    id="altText"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Describe the image for accessibility"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="hero">Hero Images</SelectItem>
                      <SelectItem value="showcase">Showcase</SelectItem>
                      <SelectItem value="testimonials">Testimonials</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="logos">Logos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g., mixing, studio, equipment"
                />
              </div>

              <Button type="submit" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload Media'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Media Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Media Library</CardTitle>
            <CardDescription>{mediaFiles.length} file(s) total</CardDescription>
          </CardHeader>
          <CardContent>
            {mediaFiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No media files uploaded yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mediaFiles.map((media) => (
                  <Card key={media.id} className="overflow-hidden">
                    <div className="aspect-video bg-muted relative">
                      {media.file_type.startsWith('image/') ? (
                        <img
                          src={getPublicUrl(media.file_path)}
                          alt={media.alt_text || media.file_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ImageIcon className="h-12 w-12 opacity-50" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium truncate mb-1">{media.file_name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {formatFileSize(media.file_size)} • {media.category}
                      </p>
                      {media.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {media.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="text-xs bg-secondary px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyUrl(media.file_path)}
                          className="flex-1"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy URL
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(media.id, media.file_path)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
