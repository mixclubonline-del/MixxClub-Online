import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, Sparkles, Music, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { PrimeAvatar } from '@/components/prime/PrimeAvatar';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface IntelligentUploadProps {
  onUploadComplete?: (files: File[]) => void;
  projectTitle?: string;
}

export const IntelligentUpload = ({ onUploadComplete, projectTitle }: IntelligentUploadProps) => {
  const { user } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!user) {
      toast.error('Please sign in to upload files');
      return;
    }

    setError(null);
    const fileArray = Array.from(files);
    const audioFile = fileArray[0]; // Handle first file for now
    
    // Validate file
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp3', 'audio/aiff', 'audio/flac'];
    if (!validTypes.some(type => audioFile.type === type) && !audioFile.name.match(/\.(mp3|wav|aiff|flac)$/i)) {
      setError('Please upload an audio file (MP3, WAV, AIFF, or FLAC)');
      toast.error('Invalid file type');
      return;
    }

    if (audioFile.size > 100 * 1024 * 1024) {
      setError('File size must be less than 100MB');
      toast.error('File too large');
      return;
    }

    setUploadedFiles(fileArray);
    setUploading(true);
    setAnalysisProgress(0);

    try {
      // Upload to Supabase
      const filePath = `${user.id}/${Date.now()}-${audioFile.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio-files')
        .upload(filePath, audioFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setAnalysisProgress(50);

      // Create database record (need a project first in real implementation)
      // For now, just proceed with AI analysis
      setAnalysisProgress(70);
      setUploading(false);
      setAnalyzing(true);

      // Analyze with AI
      toast.info('Analyzing your track with AI...', { duration: 2000 });

      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-audio', {
        body: {
          fileId: filePath,
          filePath: filePath,
          fileName: audioFile.name
        }
      });

      if (analysisError) {
        console.error('Analysis error:', analysisError);
        toast.warning('Upload successful, but AI analysis failed. You can still proceed.');
        setAiInsights({
          format: audioFile.type,
          sampleRate: 'Unknown',
          duration: 'Unknown',
          quality: 'Unknown',
          suggestions: ['File uploaded successfully', 'Analysis unavailable - manual review recommended']
        });
      } else {
        const analysis = analysisData?.analysis || {};
        setAiInsights({
          genre: analysis.genre || 'Unknown',
          key: analysis.keySignature || 'Unknown',
          bpm: analysis.bpm || 'Unknown',
          timeSignature: analysis.timeSignature || 'Unknown',
          quality: analysis.audioQuality || 'Unknown',
          confidence: analysis.confidence ? `${Math.round(analysis.confidence * 100)}%` : 'Unknown',
          suggestions: analysis.recommendations?.suggestedEffects || ['Ready for mixing']
        });
        toast.success('AI analysis complete! 🎵');
      }

      setAnalysisProgress(100);

    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload file');
      toast.error(error.message || 'Failed to upload file');
      setUploadedFiles([]);
      setAiInsights(null);
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-6">
      {!projectTitle && (
        <div className="space-y-2">
          <label className="text-sm font-semibold">Project Title</label>
          <Input placeholder="Enter your track name..." className="text-lg" />
        </div>
      )}

      <Card
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && !analyzing && fileInputRef.current?.click()}
        className={`relative overflow-hidden transition-all duration-300 ${
          !uploading && !analyzing ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
        } ${isDragging ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.wav,.mp3,.aiff,.flac"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={uploading || analyzing}
        />
        
        <div className="p-12 text-center">
          <AnimatePresence mode="wait">
            {!uploading && !analyzing && !error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="mb-6">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Upload className="w-10 h-10 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <PrimeAvatar size="sm" animate />
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2">
                  {isDragging ? 'Drop your files here' : 'Upload Your Track'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  Drag & drop or click to browse • WAV, MP3, AIFF, FLAC
                </p>

                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Instant AI Analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Auto Format Detection</span>
                  </div>
                </div>
              </motion.div>
            )}

            {(uploading || analyzing) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="mb-6">
                  <Loader2 className="w-20 h-20 mx-auto text-primary animate-spin mb-4" />
                </div>

                <h3 className="text-xl font-bold mb-2">
                  {uploading ? 'Uploading...' : 'Prime is analyzing your track...'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {uploading 
                    ? 'Uploading your file securely...' 
                    : 'Checking format, quality, and optimal settings'}
                </p>
                <Progress value={analysisProgress} className="h-2 max-w-md mx-auto" />
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                    <AlertCircle className="w-10 h-10 text-destructive" />
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2 text-destructive">Upload Failed</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => { setError(null); fileInputRef.current?.click(); }}>
                  Try Again
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      <AnimatePresence>
        {aiInsights && !analyzing && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 bg-green-500/5 border-green-500/20">
              <div className="flex items-start gap-3">
                <PrimeAvatar size="md" />
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="font-bold mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Analysis Complete!
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="p-3 bg-background rounded-lg">
                        <div className="text-xs text-muted-foreground">Genre</div>
                        <div className="font-semibold">{aiInsights.genre}</div>
                      </div>
                      <div className="p-3 bg-background rounded-lg">
                        <div className="text-xs text-muted-foreground">Key</div>
                        <div className="font-semibold">{aiInsights.key}</div>
                      </div>
                      <div className="p-3 bg-background rounded-lg">
                        <div className="text-xs text-muted-foreground">BPM</div>
                        <div className="font-semibold">{aiInsights.bpm}</div>
                      </div>
                      <div className="p-3 bg-background rounded-lg">
                        <div className="text-xs text-muted-foreground">Quality</div>
                        <div className="font-semibold text-green-500">{aiInsights.quality}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold mb-2">Prime's Tips:</div>
                    <ul className="space-y-2">
                      {aiInsights.suggestions.map((suggestion: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {uploadedFiles.length > 0 && !error && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Uploaded Files ({uploadedFiles.length})</h3>
          {uploadedFiles.map((file, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Music className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{file.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {uploadedFiles.length > 0 && aiInsights && !error && (
        <Button
          onClick={() => onUploadComplete?.(uploadedFiles)}
          size="lg"
          className="w-full gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Continue to Engineer Matching
        </Button>
      )}
    </div>
  );
};