import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Upload, Music, Trash2, Edit, Save, X } from 'lucide-react';

interface AudioSample {
  id: string;
  title: string;
  description: string | null;
  genre: string | null;
  category: string;
  before_file_path: string;
  after_file_path: string;
  before_file_name: string;
  after_file_name: string;
  is_featured: boolean;
  display_order: number;
  created_at: string;
}

export default function AdminAudio() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [samples, setSamples] = useState<AudioSample[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [category, setCategory] = useState('mixing');
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      checkAdminStatus();
      fetchSamples();
    }
  }, [user, loading, navigate]);

  const checkAdminStatus = async () => {
    const { data, error } = await supabase.rpc('is_admin', { user_uuid: user?.id });
    if (error || !data) {
      navigate('/');
    }
  };

  const fetchSamples = async () => {
    try {
      const { data, error } = await supabase
        .from('showcase_audio_samples')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setSamples(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch audio samples',
        variant: 'destructive',
      });
    } finally {
      setDataLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!beforeFile || !afterFile || !title) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      // Verify admin status before upload
      const { data: isAdminUser, error: adminError } = await supabase.rpc('is_admin', { 
        user_uuid: user?.id 
      });
      
      if (adminError || !isAdminUser) {
        throw new Error('Admin access required. Please ensure you have admin privileges.');
      }

      // Upload before file
      const beforePath = `${Date.now()}-${beforeFile.name}`;
      const { error: beforeError } = await supabase.storage
        .from('showcase-audio')
        .upload(beforePath, beforeFile);

      if (beforeError) throw beforeError;

      // Upload after file
      const afterPath = `${Date.now()}-${afterFile.name}`;
      const { error: afterError } = await supabase.storage
        .from('showcase-audio')
        .upload(afterPath, afterFile);

      if (afterError) throw afterError;

      // Create database record
      const { error: dbError } = await supabase
        .from('showcase_audio_samples')
        .insert({
          title,
          description: description || null,
          genre: genre || null,
          category,
          before_file_path: beforePath,
          after_file_path: afterPath,
          before_file_name: beforeFile.name,
          after_file_name: afterFile.name,
          created_by: user?.id,
        });

      if (dbError) {
        console.error('Database insert error:', dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }

      toast({
        title: 'Success',
        description: 'Audio sample uploaded successfully',
      });

      // Reset form
      setTitle('');
      setDescription('');
      setGenre('');
      setCategory('mixing');
      setBeforeFile(null);
      setAfterFile(null);
      fetchSamples();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload audio sample',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, beforePath: string, afterPath: string) => {
    if (!confirm('Are you sure you want to delete this audio sample?')) return;

    try {
      // Delete files from storage
      await supabase.storage.from('showcase-audio').remove([beforePath, afterPath]);

      // Delete database record
      const { error } = await supabase
        .from('showcase_audio_samples')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Audio sample deleted successfully',
      });

      fetchSamples();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete audio sample',
        variant: 'destructive',
      });
    }
  };

  if (loading || dataLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Audio Samples Management</h1>
          <p className="text-muted-foreground">Manage before/after audio samples for showcase</p>
        </div>

        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload New Audio Sample
            </CardTitle>
            <CardDescription>
              Upload before and after audio files to showcase your work
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Hip Hop Beat Mix"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Input
                    id="genre"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="e.g., Hip Hop, Rock, Electronic"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the changes made..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mixing">Mixing</SelectItem>
                    <SelectItem value="mastering">Mastering</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="before">Before Audio File *</Label>
                  <Input
                    id="before"
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setBeforeFile(e.target.files?.[0] || null)}
                    required
                  />
                  {beforeFile && (
                    <p className="text-sm text-muted-foreground">{beforeFile.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="after">After Audio File *</Label>
                  <Input
                    id="after"
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setAfterFile(e.target.files?.[0] || null)}
                    required
                  />
                  {afterFile && (
                    <p className="text-sm text-muted-foreground">{afterFile.name}</p>
                  )}
                </div>
              </div>

              <Button type="submit" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload Audio Sample'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Samples List */}
        <Card>
          <CardHeader>
            <CardTitle>Existing Audio Samples</CardTitle>
            <CardDescription>
              {samples.length} sample(s) total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {samples.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No audio samples uploaded yet</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Genre</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Before File</TableHead>
                      <TableHead>After File</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {samples.map((sample) => (
                      <TableRow key={sample.id}>
                        <TableCell className="font-medium">{sample.title}</TableCell>
                        <TableCell>{sample.genre || '-'}</TableCell>
                        <TableCell className="capitalize">{sample.category}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {sample.before_file_name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {sample.after_file_name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(sample.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleDelete(
                                sample.id,
                                sample.before_file_path,
                                sample.after_file_path
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4" />
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
      </div>
    </AdminLayout>
  );
}
