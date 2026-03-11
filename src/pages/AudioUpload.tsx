import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, Music, Check, Trash2, Play, Pause, 
  ArrowLeft, Copy, ExternalLink, Loader2, FileAudio, LogIn, Sparkles, Users, AlertTriangle, ArrowUpRight
} from 'lucide-react';
import mixclubLogo from '@/assets/mixxclub-3d-logo.png';
import { useUsageEnforcement } from '@/hooks/useUsageEnforcement';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  url: string;
  path: string;
}

export default function AudioUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [creatingDemo, setCreatingDemo] = useState(false);
  
  const navigate = useNavigate();
  const { canUseFeature, getFeatureUsage, refreshUsage, tier } = useUsageEnforcement();
  const uploadUsage = getFeatureUsage('audio_uploads');

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Create demo session for insider access
  const createDemoSession = async () => {
    setCreatingDemo(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-demo-session', {
        body: { role: 'client' }
      });

      if (error) throw error;

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (signInError) throw signInError;

      toast.success('Demo session started! You can now upload audio.');
    } catch (error) {
      console.error('Demo session error:', error);
      toast.error('Failed to create demo session');
    } finally {
      setCreatingDemo(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { data, error } = await supabase.storage
      .from('audio-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('audio-files')
      .getPublicUrl(filePath);

    return {
      id: fileName,
      name: file.name,
      size: file.size,
      url: urlData.publicUrl,
      path: filePath
    };
  };

  const handleFiles = async (files: FileList | File[]) => {
    const audioFiles = Array.from(files).filter(file => 
      file.type.startsWith('audio/') || 
      ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac'].some(ext => 
        file.name.toLowerCase().endsWith(ext)
      )
    );

    if (audioFiles.length === 0) {
      toast.error('Please select audio files (MP3, WAV, OGG, FLAC, M4A, AAC)');
      return;
    }

    // Usage limit check
    if (!canUseFeature('audio_uploads')) {
      toast.error(`Upload limit reached on your ${tier} plan. Upgrade to upload more.`, {
        action: {
          label: 'Upgrade',
          onClick: () => navigate('/pricing?feature=audio_uploads'),
        },
      });
      return;
    }

    // Check if batch exceeds remaining quota
    if (!uploadUsage.isUnlimited && audioFiles.length > uploadUsage.remaining) {
      toast.error(
        `You can only upload ${uploadUsage.remaining} more file(s) on your ${tier} plan. You selected ${audioFiles.length}.`
      );
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploaded: UploadedFile[] = [];
      
      for (let i = 0; i < audioFiles.length; i++) {
        const file = audioFiles[i];
        const result = await uploadFile(file);
        uploaded.push(result);
        setUploadProgress(((i + 1) / audioFiles.length) * 100);
      }

      setUploadedFiles(prev => [...prev, ...uploaded]);
      await refreshUsage();
      toast.success(`${uploaded.length} file(s) uploaded successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files. Make sure you are logged in.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [canUseFeature, uploadUsage.remaining]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard!');
  };

  const deleteFile = async (file: UploadedFile) => {
    try {
      const { error } = await supabase.storage
        .from('audio-files')
        .remove([file.path]);

      if (error) throw error;

      setUploadedFiles(prev => prev.filter(f => f.id !== file.id));
      toast.success('File deleted');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete file');
    }
  };

  const togglePlay = (url: string) => {
    if (currentlyPlaying === url) {
      audioElement?.pause();
      setCurrentlyPlaying(null);
    } else {
      if (audioElement) {
        audioElement.pause();
      }
      const audio = new Audio(url);
      audio.play();
      audio.onended = () => setCurrentlyPlaying(null);
      setAudioElement(audio);
      setCurrentlyPlaying(url);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <img src={mixclubLogo} alt="Mixxclub" className="w-10 h-10" />
            <div>
              <h1 className="font-bold text-lg">Audio Upload</h1>
              <p className="text-xs text-muted-foreground">Upload music files to Mixxclub</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Usage badge */}
            {isAuthenticated && !uploadUsage.isUnlimited && (
              <Badge
                variant={uploadUsage.limitReached ? 'destructive' : 'outline'}
                className={uploadUsage.limitReached ? '' : 'border-primary/50 text-primary'}
              >
                {uploadUsage.current}/{uploadUsage.limit} uploads
              </Badge>
            )}
            <Badge variant="outline" className="border-primary/50 text-primary">
              <Music className="w-3 h-3 mr-1" /> Audio Manager
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Auth Check - Show Demo Login if not authenticated */}
        {isAuthenticated === false && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
              <div className="text-center">
                <div className="inline-flex p-4 rounded-full bg-primary/20 mb-4">
                  <LogIn className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold mb-2">Login Required</h2>
                <p className="text-muted-foreground mb-6">
                  You need to be logged in to upload audio files.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={() => navigate('/auth')} variant="outline">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                  <Button onClick={createDemoSession} disabled={creatingDemo} className="bg-gradient-to-r from-primary to-accent">
                    {creatingDemo ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    {creatingDemo ? 'Starting Demo...' : 'Start Demo Session'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Demo sessions are temporary and expire after 4 hours
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Limit Reached Banner */}
        {isAuthenticated && (
          <UsageLimitBanner feature="audio_uploads" variant="banner" showAlways className="mb-8" />
        )}

        {/* Upload Zone - Only show when authenticated and not at limit */}
        {isAuthenticated && !uploadUsage.limitReached && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Usage progress bar above drop zone */}
            <UsageLimitBanner feature="audio_uploads" variant="inline" showAlways className="mb-4" />

            <Card
              className={`p-12 border-2 border-dashed transition-all duration-300 cursor-pointer ${
                isDragging 
                  ? 'border-primary bg-primary/10 scale-[1.02]' 
                  : 'border-border hover:border-primary/50 hover:bg-card/80'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept="audio/*,.mp3,.wav,.ogg,.flac,.m4a,.aac"
                multiple
                className="hidden"
                onChange={handleFileInput}
              />
              
              <div className="text-center">
                <motion.div
                  animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                  className="inline-flex p-6 rounded-full bg-primary/10 mb-6"
                >
                  {uploading ? (
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  ) : (
                    <Upload className="w-12 h-12 text-primary" />
                  )}
                </motion.div>
                
                <h2 className="text-2xl font-bold mb-2">
                  {uploading ? 'Uploading...' : isDragging ? 'Drop files here!' : 'Drag & Drop Audio Files'}
                </h2>
                <p className="text-muted-foreground mb-4">
                  or click to browse • MP3, WAV, OGG, FLAC, M4A, AAC • Max 50MB
                </p>
                
                {uploading && (
                  <div className="max-w-xs mx-auto">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">{Math.round(uploadProgress)}%</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Uploaded Files */}
        <AnimatePresence>
          {uploadedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-500" />
                Uploaded Files ({uploadedFiles.length})
              </h3>
              
              <div className="space-y-3">
                {uploadedFiles.map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-4 flex items-center gap-4 bg-card/50">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <FileAudio className="w-6 h-6 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{formatSize(file.size)}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePlay(file.url);
                          }}
                        >
                          {currentlyPlaying === file.url ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyUrl(file.url);
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(file.url, '_blank');
                          }}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFile(file);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
              
              {/* Find an Engineer CTA */}
              <Card className="mt-6 p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/20">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground">Ready to mix your tracks?</h4>
                    <p className="text-sm text-muted-foreground">
                      Find a professional engineer to mix and master your uploaded audio
                    </p>
                  </div>
                  <Button 
                    onClick={() => navigate('/matching')}
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Find an Engineer
                  </Button>
                </div>
              </Card>

              {/* URL Copy Helper */}
              <Card className="mt-4 p-4 bg-muted/50 border-border">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Tip:</strong> Click the copy icon to get the URL for use in your app code or database.
                </p>
                <code className="text-xs bg-background/50 px-2 py-1 rounded block overflow-x-auto">
                  {uploadedFiles[uploadedFiles.length - 1]?.url || 'Upload a file to see its URL'}
                </code>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
