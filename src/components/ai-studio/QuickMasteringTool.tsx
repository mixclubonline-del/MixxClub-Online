import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Sparkles, Music } from 'lucide-react';

export default function QuickMasteringTool() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const genrePresets = [
    { name: 'Hip Hop', value: 'hip-hop' },
    { name: 'Rock', value: 'rock' },
    { name: 'Electronic', value: 'electronic' },
    { name: 'Pop', value: 'pop' },
    { name: 'Jazz', value: 'jazz' },
    { name: 'Classical', value: 'classical' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleMaster = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
    }, 3000);
  };

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-card/30 to-accent-cyan/10 backdrop-blur-sm border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Quick AI Mastering
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/50 transition-all cursor-pointer">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
            id="audio-upload"
          />
          <label htmlFor="audio-upload" className="cursor-pointer">
            {selectedFile ? (
              <div className="flex items-center justify-center gap-2">
                <Music className="w-6 h-6 text-primary" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Drop your audio file here or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports WAV, MP3, FLAC
                </p>
              </>
            )}
          </label>
        </div>

        <div>
          <p className="text-sm font-medium mb-3">Select Genre Preset</p>
          <div className="grid grid-cols-3 gap-2">
            {genrePresets.map((preset) => (
              <Badge
                key={preset.value}
                variant="outline"
                className="justify-center cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all"
              >
                {preset.name}
              </Badge>
            ))}
          </div>
        </div>

        <Button
          className="w-full gap-2"
          disabled={!selectedFile || isProcessing}
          onClick={handleMaster}
        >
          {isProcessing ? (
            <>Processing...</>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Master Now
            </>
          )}
        </Button>

        {isProcessing && (
          <div className="space-y-2">
            <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }} />
            </div>
            <p className="text-xs text-center text-muted-foreground">
              AI is analyzing and mastering your track...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
