import { useState, useEffect, useId } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Upload, 
  File, 
  Music, 
  Image, 
  FileText, 
  Download,
  Trash2,
  Grid,
  List,
  Search,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ProjectFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  category: string;
  version: number;
  created_at: string;
}

interface ProjectFilesProps {
  projectId: string;
}

const categoryIcons: Record<string, React.ElementType> = {
  audio: Music,
  stems: Music,
  mix: Music,
  master: Music,
  artwork: Image,
  document: FileText,
  other: File,
};

const MAX_FILE_SIZE_MB = 250;

const categoryColors: Record<string, string> = {
  audio: 'bg-purple-500/10 text-purple-500',
  stems: 'bg-blue-500/10 text-blue-500',
  mix: 'bg-green-500/10 text-green-500',
  master: 'bg-yellow-500/10 text-yellow-500',
  artwork: 'bg-pink-500/10 text-pink-500',
  document: 'bg-orange-500/10 text-orange-500',
  other: 'bg-muted text-muted-foreground',
};

export const ProjectFiles = ({ projectId }: ProjectFilesProps) => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [uploading, setUploading] = useState(false);
  const uploadInputId = useId();

  useEffect(() => {
    fetchFiles();
  }, [projectId]);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('project_files')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      // Get current user once for the batch
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let uploadedCount = 0;

      for (const file of selectedFiles) {
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          toast.error(`${file.name} is too large (max ${MAX_FILE_SIZE_MB}MB)`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const filePath = `projects/${projectId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('project-files')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Error uploading file to storage:', uploadError);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        // Determine category based on file type
        let category = 'other';
        if (file.type.startsWith('audio/')) category = 'audio';
        else if (file.type.startsWith('image/')) category = 'artwork';
        else if (file.type.includes('pdf') || file.type.includes('document')) category = 'document';

        const { error: dbError } = await supabase
          .from('project_files')
          .insert({
            project_id: projectId,
            file_name: file.name,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
            category,
            version: 1,
            user_id: user.id
          });

        if (dbError) {
          console.error('Error creating file record:', dbError);
          toast.error(`Uploaded ${file.name}, but failed to index it`);
          await supabase.storage.from('project-files').remove([filePath]);
          continue;
        }

        uploadedCount += 1;
      }

      if (uploadedCount > 0) {
        toast.success(uploadedCount === 1 ? 'File uploaded successfully' : `${uploadedCount} files uploaded successfully`);
        fetchFiles();
      }
    } catch (error) {
      console.error('Error uploading file(s):', error);
      toast.error('Failed to upload file(s)');
    } finally {
      event.target.value = '';
      setUploading(false);
    }
  };

  const handleDeleteFile = async (file: ProjectFile) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('project-files')
        .remove([file.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('project_files')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;

      toast.success('File deleted');
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const handleDownloadFile = async (file: ProjectFile) => {
    try {
      const { data, error } = await supabase.storage
        .from('project-files')
        .download(file.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.file_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || file.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(files.map(f => f.category))];

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3 rounded-md border bg-background text-sm"
          >
            {categories.map(cat => (
              <option key={cat} value={cat} className="capitalize">
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Upload Button */}
      <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
        <input
          type="file"
          id={uploadInputId}
          multiple
          className="hidden"
          onChange={handleFileUpload}
          disabled={uploading}
        />
        <label htmlFor={uploadInputId} className="cursor-pointer">
          <Upload className={`w-8 h-8 mx-auto mb-2 ${uploading ? 'animate-pulse' : 'text-muted-foreground'}`} />
          <p className="text-sm text-muted-foreground">
            {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
          </p>
        </label>
      </div>

      {/* Files List */}
      {filteredFiles.length === 0 ? (
        <Card className="p-8 text-center">
          <File className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">
            {files.length === 0 ? 'No files uploaded yet' : 'No files match your search'}
          </p>
        </Card>
      ) : viewMode === 'list' ? (
        <div className="space-y-2">
          <AnimatePresence>
            {filteredFiles.map((file, index) => {
              const Icon = categoryIcons[file.category] || File;
              const colorClass = categoryColors[file.category] || categoryColors.other;

              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card className="hover:border-primary/30 transition-colors">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.file_name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatFileSize(file.file_size)}</span>
                          <span>•</span>
                          <span>{format(new Date(file.created_at), 'MMM d, yyyy')}</span>
                          {file.version > 1 && (
                            <>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">v{file.version}</Badge>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge className={`${colorClass} border-0 capitalize`}>
                        {file.category}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDownloadFile(file)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteFile(file)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filteredFiles.map((file, index) => {
            const Icon = categoryIcons[file.category] || File;
            const colorClass = categoryColors[file.category] || categoryColors.other;

            return (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className="hover:border-primary/30 transition-colors">
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 rounded-lg ${colorClass} mx-auto mb-3 flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className="font-medium truncate text-sm mb-1">{file.file_name}</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      {formatFileSize(file.file_size)}
                    </p>
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadFile(file)}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteFile(file)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
