import { useState } from "react";
import { HapticWaveformVisualizer } from "@/components/audio/HapticWaveformVisualizer";
import { Button } from "@/components/ui/button";
import { Upload, Wand2 } from "lucide-react";
import { toast } from "sonner";

const HapticStudio = () => {
  const [audioUrl, setAudioUrl] = useState<string>("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        toast.error('Please upload an audio file');
        return;
      }
      
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      toast.success('Audio file loaded successfully');
    }
  };

  const loadDemoTrack = () => {
    // Use a demo audio URL (you can replace with actual demo track)
    setAudioUrl('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
    toast.success('Demo track loaded');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                Haptic Studio
              </h1>
              <p className="text-muted-foreground mt-1">
                Immersive audio visualization with device haptic feedback
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={loadDemoTrack}
              >
                <Wand2 className="w-4 h-4" />
                Load Demo
              </Button>
              
              <Button
                className="gap-2"
                onClick={() => document.getElementById('audio-upload')?.click()}
              >
                <Upload className="w-4 h-4" />
                Upload Audio
              </Button>
              
              <input
                id="audio-upload"
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 py-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Mobile-Optimized Experience
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold">
              Feel Your Music
            </h2>
            
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience audio like never before. Our haptic visualizer syncs device vibrations 
              with audio intensity, creating an immersive tactile experience for audio engineers.
            </p>
          </div>

          {/* Visualizer */}
          <HapticWaveformVisualizer 
            audioUrl={audioUrl}
            barsCount={64}
            sensitivity={1.5}
          />

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 pt-8">
            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Wand2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Real-time Analysis</h3>
              <p className="text-sm text-muted-foreground">
                64-band frequency analysis with instant haptic response to audio peaks
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Custom Audio</h3>
              <p className="text-sm text-muted-foreground">
                Upload your own tracks or use our demo to experience the technology
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="font-semibold mb-2">Mobile First</h3>
              <p className="text-sm text-muted-foreground">
                Optimized for mobile devices with adjustable haptic intensity levels
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className="p-6 rounded-lg bg-primary/5 border border-primary/20">
            <h3 className="font-semibold mb-3">💡 Pro Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Use headphones for the best audio experience</li>
              <li>• Hold your phone while playing for maximum haptic feedback</li>
              <li>• Adjust haptic intensity based on your device's capabilities</li>
              <li>• Try different music genres to experience varied haptic patterns</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HapticStudio;
