import { useState, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  Zap, 
  Sparkles, 
  Download, 
  X, 
  Music,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useStemSeparation } from '@/hooks/useStemSeparation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface StemSeparationWindowProps {
  onClose?: () => void;
  onStemsProcessed?: (stems: Array<{
    stemType: string;
    stemName: string;
    filePath: string;
  }>) => void;
}

const StemSeparationWindow = ({ onClose, onStemsProcessed }: StemSeparationWindowProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTier, setSelectedTier] = useState<'free_4stem' | 'credit_9stem'>('free_4stem');
  const [dragActive, setDragActive] = useState(false);

  const {
    isProcessing,
    currentJob,
    credits,
    freeTierStatus,
    startSeparation,
    cancelJob,
    downloadStem,
    fetchCredits,
    checkFreeTier
  } = useStemSeparation();

  useEffect(() => {
    fetchCredits();
    checkFreeTier();
  }, [fetchCredits, checkFreeTier]);

  // Call onStemsProcessed when stems are ready
  useEffect(() => {
    if (currentJob?.status === 'completed' && currentJob?.stem_paths && onStemsProcessed) {
      const stemsData = currentJob.stem_paths.map(stem => ({
        stemType: stem.name.split('_')[0] || 'other',
        stemName: stem.displayName,
        filePath: stem.path
      }));
      onStemsProcessed(stemsData);
    }
  }, [currentJob, onStemsProcessed]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/')) {
        setSelectedFile(file);
      } else {
        toast.error('Please upload an audio file');
      }
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('audio/')) {
        setSelectedFile(file);
      } else {
        toast.error('Please upload an audio file');
      }
    }
  }, []);

  const handleStartSeparation = async () => {
    if (!selectedFile) {
      toast.error('Please select an audio file');
      return;
    }

    // Check tier availability
    if (selectedTier === 'free_4stem' && !freeTierStatus?.available) {
      toast.error('Free tier limit reached. You can do 1 free separation per day.');
      return;
    }

    if (selectedTier === 'credit_9stem' && (credits?.credits_balance || 0) < 50) {
      toast.error('Insufficient credits. You need 50 credits for 9-stem separation.');
      return;
    }

    // For demo, we'll use a mock file path
    // In production, you'd upload to storage first
    const mockAudioFileId = crypto.randomUUID();
    const mockFilePath = `temp/${mockAudioFileId}`;

    await startSeparation(
      mockAudioFileId,
      mockFilePath,
      selectedFile.name,
      selectedTier
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Stem Separation</h2>
              <p className="text-sm text-muted-foreground">
                Separate your tracks into individual stems using AI
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Credits Display */}
          <div className="flex gap-4 mb-6">
            <Card className="flex-1 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Credits Balance</p>
                  <p className="text-2xl font-bold">{credits?.credits_balance || 0}</p>
                </div>
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            </Card>
            <Card className="flex-1 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Free Tier</p>
                  <p className="text-2xl font-bold">
                    {freeTierStatus?.available ? '1' : '0'} / 1
                  </p>
                </div>
                <Zap className="h-8 w-8 text-primary" />
              </div>
            </Card>
          </div>

          <Separator className="my-6" />

          {/* Tier Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Select Separation Mode</h3>
            <div className="grid grid-cols-2 gap-4">
              <Card
                className={cn(
                  "p-4 cursor-pointer transition-all",
                  selectedTier === 'free_4stem' && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedTier('free_4stem')}
              >
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary">Free</Badge>
                  {!freeTierStatus?.available && (
                    <Badge variant="destructive">Limit Reached</Badge>
                  )}
                </div>
                <h4 className="font-semibold mb-2">4-Stem Basic</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Vocals, Drums, Bass, Other
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4" />
                  <span>1 per day</span>
                </div>
              </Card>

              <Card
                className={cn(
                  "p-4 cursor-pointer transition-all",
                  selectedTier === 'credit_9stem' && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedTier('credit_9stem')}
              >
                <div className="flex items-start justify-between mb-2">
                  <Badge>50 Credits</Badge>
                  {(credits?.credits_balance || 0) < 50 && (
                    <Badge variant="destructive">Not Enough</Badge>
                  )}
                </div>
                <h4 className="font-semibold mb-2">9-Stem Pro</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Vocals, Drums, Bass, Guitar, Piano, Synth, Strings, Brass, Other
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4" />
                  <span>Studio quality</span>
                </div>
              </Card>
            </div>
          </div>

          <Separator className="my-6" />

          {/* File Upload */}
          {!currentJob && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Upload Audio File</h3>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                  dragActive ? "border-primary bg-primary/5" : "border-border",
                  "cursor-pointer hover:border-primary hover:bg-primary/5"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-4">
                    <Music className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">
                      Drop your audio file here or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports WAV, MP3, FLAC, and more • Max 50MB
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Processing Status */}
          {currentJob && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Processing Status</h3>
              <Card className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {currentJob.status === 'processing' && (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      )}
                      {currentJob.status === 'completed' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {currentJob.status === 'failed' && (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      )}
                      <span className="font-medium capitalize">{currentJob.status}</span>
                    </div>
                    <Badge>{currentJob.tier === 'free_4stem' ? '4-Stem' : '9-Stem'}</Badge>
                  </div>

                  {currentJob.status === 'processing' && (
                    <>
                      <Progress value={currentJob.progress} className="h-2" />
                      <p className="text-sm text-muted-foreground text-center">
                        {currentJob.progress}% complete
                      </p>
                    </>
                  )}

                  {currentJob.status === 'completed' && currentJob.stem_paths && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium mb-2">Download Stems:</p>
                      {currentJob.stem_paths.map((stem, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 rounded bg-secondary/50"
                        >
                          <span className="text-sm">{stem.displayName}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => downloadStem(stem.path, stem.name)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {currentJob.status === 'failed' && (
                    <p className="text-sm text-destructive">{currentJob.error_message}</p>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!currentJob && (
              <Button
                className="flex-1"
                size="lg"
                onClick={handleStartSeparation}
                disabled={!selectedFile || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Start Separation
                  </>
                )}
              </Button>
            )}

            {currentJob && currentJob.status === 'processing' && (
              <Button
                variant="destructive"
                size="lg"
                onClick={() => cancelJob(currentJob.id)}
              >
                Cancel
              </Button>
            )}

            {currentJob && currentJob.status === 'completed' && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setSelectedFile(null);
                  setSelectedTier('free_4stem');
                }}
              >
                New Separation
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StemSeparationWindow;
