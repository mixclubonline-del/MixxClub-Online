import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Music, FileAudio, X, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TrackUploadManagerProps {
  projectId: string;
  onUploadComplete?: () => void;
}

export const TrackUploadManager = ({ projectId, onUploadComplete }: TrackUploadManagerProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [comment, setComment] = useState('');
  const [aiProcessing, setAiProcessing] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp3'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|flac)$/i)) {
        toast.error('Please upload a valid audio file (MP3, WAV, or FLAC)');
        return;
      }
      
      // Validate file size (max 500MB)
      if (file.size > 500 * 1024 * 1024) {
        toast.error('File size must be less than 500MB');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const simulateAIAnalysis = () => {
    setAiProcessing(true);
    const suggestions = [
      "🎵 AI Suggestion: Consider adding compression to vocals",
      "🎛️ AI Suggestion: Low-end frequency detected - recommend high-pass filter at 80Hz",
      "✨ AI Suggestion: Stereo width could be enhanced in the chorus",
      "🎸 AI Suggestion: Guitar levels are balanced well",
      "🥁 AI Suggestion: Drums could benefit from parallel compression"
    ];
    
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    setTimeout(() => {
      toast.success(randomSuggestion, { duration: 5000 });
      setAiProcessing(false);
    }, 2000);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      // Upload to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${projectId}/${fileName}`;

      // Simulate progress animation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const { error: uploadError } = await supabase.storage
        .from('audio-files')
        .upload(filePath, selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) throw uploadError;

      // Create database record
      const { error: dbError } = await supabase
        .from('audio_files')
        .insert({
          project_id: projectId,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id,
          file_name: selectedFile.name,
          file_path: filePath,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
          processing_status: 'completed'
        });

      if (dbError) throw dbError;

      // Run AI analysis simulation
      simulateAIAnalysis();

      // Award points for upload
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (userId) {
        await supabase.rpc('award_points', {
          user_id: userId,
          points_to_add: 25
        });
      }

      // Add comment if provided
      if (comment) {
        await supabase.from('collaboration_comments').insert({
          project_id: projectId,
          user_id: userId,
          comment_text: comment
        });
      }

      toast.success('Track uploaded successfully! +25 points');
      setSelectedFile(null);
      setComment('');
      setUploadProgress(0);
      onUploadComplete?.();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload track');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          Upload Track
        </h3>
        <p className="text-sm text-muted-foreground">
          Upload your audio files (MP3, WAV, FLAC) - max 500MB
        </p>
      </div>

      {/* File Selection */}
      <div className="space-y-4">
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
            ${selectedFile ? 'border-primary bg-primary/5' : 'border-border hover:border-primary hover:bg-primary/5'}
          `}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".mp3,.wav,.flac,audio/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          
          {selectedFile ? (
            <div className="flex items-center justify-center gap-3">
              <FileAudio className="w-8 h-8 text-primary" />
              <div className="text-left">
                <p className="font-semibold">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
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
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <Music className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="font-semibold mb-1">Click to select audio file</p>
              <p className="text-sm text-muted-foreground">or drag and drop</p>
            </>
          )}
        </div>

        {/* Comment/Instructions */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Add instructions or comments (optional)
          </label>
          <Textarea
            placeholder="Any specific requirements or notes for the engineer..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={uploading}
            rows={3}
          />
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Uploading...</span>
              <span className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* AI Processing Indicator */}
        {aiProcessing && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <div>
                <p className="font-semibold text-sm">AI Analyzing Track...</p>
                <p className="text-xs text-muted-foreground">Detecting frequencies, dynamics, and mix quality</p>
              </div>
            </div>
          </Card>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploading || aiProcessing}
          className="w-full gap-2"
          size="lg"
        >
          {uploading ? (
            <>Uploading...</>
          ) : aiProcessing ? (
            <>
              <AlertCircle className="w-4 h-4" />
              AI Processing...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Upload & Analyze with AI
            </>
          )}
        </Button>
      </div>

      {/* AI Features Info */}
      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          ✨ Our AI will automatically analyze your track for mix quality, frequency balance, and provide intelligent suggestions
        </p>
      </div>
    </Card>
  );
};
