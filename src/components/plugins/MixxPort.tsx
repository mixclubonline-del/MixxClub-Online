import React, { useState } from 'react';
import { Upload, FileAudio, AudioLines, Brain, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PluginWindow } from './shared/PluginWindow';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MixxPortProps {
  isOpen: boolean;
  onClose: () => void;
  onAudioLoaded: (file: File, analysis: any) => void;
}

export const MixxPort: React.FC<MixxPortProps> = ({ isOpen, onClose, onAudioLoaded }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('audio-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Call AI analysis edge function
      const { data, error } = await supabase.functions.invoke('analyze-audio-upload', {
        body: { fileName, fileSize: file.size }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      onAudioLoaded(file, data);
      
      toast({
        title: "Audio Analyzed! 🎵",
        description: `${file.name} uploaded and analyzed successfully`,
      });

      setTimeout(() => {
        setIsAnalyzing(false);
        setProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  return (
    <PluginWindow
      title="MixxPort"
      category="Audio Upload Hub"
      isOpen={isOpen}
      onClose={onClose}
      width={500}
      height={400}
    >
      <div className="flex flex-col items-center justify-center h-full gap-6">
        {!isAnalyzing ? (
          <>
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 
                flex items-center justify-center border-2 border-dashed border-primary/30">
                <Upload className="w-12 h-12 text-primary" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary 
                flex items-center justify-center shadow-glow">
                <Brain className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Upload Your Audio</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Drop your track here for instant AI analysis, stem separation, and mixing suggestions
              </p>
            </div>

            <label htmlFor="audio-upload">
              <Button className="cursor-pointer" asChild>
                <span>
                  <FileAudio className="w-4 h-4 mr-2" />
                  Choose Audio File
                </span>
              </Button>
              <input
                id="audio-upload"
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>

            <div className="flex gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <AudioLines className="w-3 h-3" />
                <span>Stem Separation</span>
              </div>
              <div className="flex items-center gap-1">
                <Brain className="w-3 h-3" />
                <span>AI Analysis</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Auto Suggestions</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-6 w-full max-w-sm">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke="hsl(var(--primary) / 0.2)"
                  strokeWidth="8"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="8"
                  strokeDasharray={`${(progress / 100) * 251}, 251`}
                  className="transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">{progress}%</span>
              </div>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Analyzing Audio...</h3>
              <p className="text-sm text-muted-foreground">
                AI is processing your track and generating insights
              </p>
            </div>

            <div className="w-full space-y-2">
              {[
                { label: 'Uploading file', done: progress > 20 },
                { label: 'Analyzing frequency content', done: progress > 40 },
                { label: 'Detecting tempo & key', done: progress > 60 },
                { label: 'Generating AI suggestions', done: progress > 80 },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${step.done ? 'bg-primary shadow-glow' : 'bg-white/20'}`} />
                  <span className={`text-sm ${step.done ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PluginWindow>
  );
};
