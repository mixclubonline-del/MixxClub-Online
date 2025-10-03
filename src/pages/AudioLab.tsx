import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, LineChart, Activity, GitCompare } from 'lucide-react';
import { SpectrumAnalyzer } from '@/components/audio/SpectrumAnalyzer';
import { AudioMetering } from '@/components/audio/AudioMetering';
import { AudioComparison } from '@/components/audio/AudioComparison';
import { toast } from 'sonner';

export default function AudioLab() {
  const [audioFileA, setAudioFileA] = useState<string | null>(null);
  const [audioFileB, setAudioFileB] = useState<string | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioSource, setAudioSource] = useState<MediaElementAudioSourceNode | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const ctx = new AudioContext();
    setAudioContext(ctx);

    return () => {
      ctx.close();
    };
  }, []);

  const handleFileUpload = (file: File, slot: 'A' | 'B') => {
    const url = URL.createObjectURL(file);
    
    if (slot === 'A') {
      setAudioFileA(url);
      
      // Connect audio for analysis
      if (audioRef.current && audioContext) {
        try {
          const source = audioContext.createMediaElementSource(audioRef.current);
          source.connect(audioContext.destination);
          setAudioSource(source);
        } catch (e) {
          console.error('Audio source already connected');
        }
      }
    } else {
      setAudioFileB(url);
    }

    toast.success(`Audio file loaded in slot ${slot}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audio Lab</h1>
          <p className="text-muted-foreground">Professional audio analysis and comparison tools</p>
        </div>
      </div>

      {/* Hidden audio element for analysis */}
      {audioFileA && (
        <audio ref={audioRef} src={audioFileA} crossOrigin="anonymous" />
      )}

      <Tabs defaultValue="analyze" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analyze" className="flex items-center gap-2">
            <LineChart className="w-4 h-4" />
            Analyze
          </TabsTrigger>
          <TabsTrigger value="meter" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Metering
          </TabsTrigger>
          <TabsTrigger value="compare" className="flex items-center gap-2">
            <GitCompare className="w-4 h-4" />
            Compare
          </TabsTrigger>
        </TabsList>

        {/* Upload Section */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Audio File A</h3>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'A')}
              className="hidden"
              id="upload-a"
            />
            <label htmlFor="upload-a">
              <Button variant="outline" className="w-full" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Audio A
                </span>
              </Button>
            </label>
            {audioFileA && (
              <div className="mt-4 p-3 bg-secondary rounded-lg">
                <audio src={audioFileA} controls className="w-full" />
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Audio File B</h3>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'B')}
              className="hidden"
              id="upload-b"
            />
            <label htmlFor="upload-b">
              <Button variant="outline" className="w-full" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Audio B
                </span>
              </Button>
            </label>
            {audioFileB && (
              <div className="mt-4 p-3 bg-secondary rounded-lg">
                <audio src={audioFileB} controls className="w-full" />
              </div>
            )}
          </Card>
        </div>

        <TabsContent value="analyze" className="space-y-6">
          {audioContext && audioSource ? (
            <SpectrumAnalyzer audioContext={audioContext} audioSource={audioSource} />
          ) : (
            <Card className="p-12 text-center text-muted-foreground">
              <LineChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Upload an audio file to see spectrum analysis</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="meter" className="space-y-6">
          {audioContext && audioSource ? (
            <AudioMetering audioContext={audioContext} audioSource={audioSource} />
          ) : (
            <Card className="p-12 text-center text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Upload an audio file to see live metering</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="compare" className="space-y-6">
          {audioFileA && audioFileB ? (
            <AudioComparison 
              audioFileA={audioFileA} 
              audioFileB={audioFileB}
              titleA="Original"
              titleB="Processed"
            />
          ) : (
            <Card className="p-12 text-center text-muted-foreground">
              <GitCompare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Upload two audio files to compare them</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
