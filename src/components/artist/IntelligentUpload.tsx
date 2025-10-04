import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, Sparkles, Music, CheckCircle } from 'lucide-react';
import { PrimeAvatar } from '@/components/prime/PrimeAvatar';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

interface IntelligentUploadProps {
  onUploadComplete?: (files: File[]) => void;
  projectTitle?: string;
}

export const IntelligentUpload = ({ onUploadComplete, projectTitle }: IntelligentUploadProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    setUploadedFiles(fileArray);
    setAnalyzing(true);
    setAnalysisProgress(0);

    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    setTimeout(() => {
      setAiInsights({
        format: 'WAV 24-bit',
        sampleRate: '48kHz',
        duration: '3:45',
        quality: 'Excellent',
        suggestions: [
          'Perfect format for mixing',
          'Good headroom for processing',
          'Clean audio signal detected',
        ],
      });
      setAnalyzing(false);
    }, 2500);
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
        onClick={() => fileInputRef.current?.click()}
        className={`relative overflow-hidden transition-all duration-300 cursor-pointer ${
          isDragging ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.wav,.mp3,.aiff,.flac"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        
        <div className="p-12 text-center">
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
        </div>
      </Card>

      <AnimatePresence>
        {analyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6 bg-primary/5">
              <div className="flex items-center gap-3 mb-4">
                <PrimeAvatar size="md" animate />
                <div className="flex-1">
                  <h3 className="font-bold">Prime is analyzing your track...</h3>
                  <p className="text-sm text-muted-foreground">
                    Checking format, quality, and optimal settings
                  </p>
                </div>
                <Badge variant="secondary" className="gap-2">
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  Analyzing
                </Badge>
              </div>
              <Progress value={analysisProgress} className="h-2" />
            </Card>
          </motion.div>
        )}

        {aiInsights && !analyzing && (
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
                        <div className="text-xs text-muted-foreground">Format</div>
                        <div className="font-semibold">{aiInsights.format}</div>
                      </div>
                      <div className="p-3 bg-background rounded-lg">
                        <div className="text-xs text-muted-foreground">Sample Rate</div>
                        <div className="font-semibold">{aiInsights.sampleRate}</div>
                      </div>
                      <div className="p-3 bg-background rounded-lg">
                        <div className="text-xs text-muted-foreground">Duration</div>
                        <div className="font-semibold">{aiInsights.duration}</div>
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

      {uploadedFiles.length > 0 && (
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

      {uploadedFiles.length > 0 && aiInsights && (
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
