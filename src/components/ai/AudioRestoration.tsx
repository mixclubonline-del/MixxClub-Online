import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, Upload, Download } from "lucide-react";
import { useAIGeneration } from "@/hooks/useAIGeneration";
import { toast } from "sonner";

export const AudioRestoration = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [noiseReduction, setNoiseReduction] = useState([50]);
  const [deClipping, setDeClipping] = useState([50]);
  const [deEsser, setDeEsser] = useState([50]);
  const [breathRemoval, setBreathRemoval] = useState([30]);

  const { generate, isGenerating, data } = useAIGeneration<{ audioUrl: string }>({
    functionName: 'restore-audio',
    successMessage: 'Audio restoration complete!',
    errorMessage: 'Failed to restore audio',
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        toast.error('Please upload an audio file');
        return;
      }
      setAudioFile(file);
    }
  };

  const handleRestore = async (restorationType: string) => {
    if (!audioFile) {
      toast.error('Please upload an audio file first');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const audioData = e.target?.result as string;
      
      await generate({
        audioData,
        restorationType,
        settings: {
          noiseReduction: noiseReduction[0],
          deClipping: deClipping[0],
          deEsser: deEsser[0],
          breathRemoval: breathRemoval[0],
        },
      });
    };
    reader.readAsDataURL(audioFile);
  };

  const downloadRestored = () => {
    if (data?.audioUrl) {
      const link = document.createElement('a');
      link.href = data.audioUrl;
      link.download = 'restored-audio.wav';
      link.click();
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Wrench className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Audio Restoration</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Upload Audio</label>
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
              id="audio-upload"
            />
            <label htmlFor="audio-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {audioFile ? audioFile.name : 'Click to upload audio file'}
              </p>
            </label>
          </div>
        </div>

        <Tabs defaultValue="noise" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="noise">Noise</TabsTrigger>
            <TabsTrigger value="clipping">Clipping</TabsTrigger>
            <TabsTrigger value="sibilance">Sibilance</TabsTrigger>
            <TabsTrigger value="breath">Breath</TabsTrigger>
          </TabsList>

          <TabsContent value="noise" className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Noise Reduction Strength: {noiseReduction[0]}%
              </label>
              <Slider
                value={noiseReduction}
                onValueChange={setNoiseReduction}
                max={100}
                step={1}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Remove background noise, hiss, and hum
              </p>
            </div>
            <Button 
              onClick={() => handleRestore('noise')} 
              disabled={isGenerating || !audioFile}
              className="w-full"
            >
              {isGenerating ? 'Processing...' : 'Apply Noise Reduction'}
            </Button>
          </TabsContent>

          <TabsContent value="clipping" className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                De-Clipping Strength: {deClipping[0]}%
              </label>
              <Slider
                value={deClipping}
                onValueChange={setDeClipping}
                max={100}
                step={1}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Restore clipped and distorted audio
              </p>
            </div>
            <Button 
              onClick={() => handleRestore('declip')} 
              disabled={isGenerating || !audioFile}
              className="w-full"
            >
              {isGenerating ? 'Processing...' : 'Apply De-Clipping'}
            </Button>
          </TabsContent>

          <TabsContent value="sibilance" className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                De-Esser Strength: {deEsser[0]}%
              </label>
              <Slider
                value={deEsser}
                onValueChange={setDeEsser}
                max={100}
                step={1}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Intelligently remove harsh sibilance (S, T sounds)
              </p>
            </div>
            <Button 
              onClick={() => handleRestore('deess')} 
              disabled={isGenerating || !audioFile}
              className="w-full"
            >
              {isGenerating ? 'Processing...' : 'Apply De-Esser'}
            </Button>
          </TabsContent>

          <TabsContent value="breath" className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Breath Removal: {breathRemoval[0]}%
              </label>
              <Slider
                value={breathRemoval}
                onValueChange={setBreathRemoval}
                max={100}
                step={1}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Clean up breathing sounds in vocals
              </p>
            </div>
            <Button 
              onClick={() => handleRestore('breath')} 
              disabled={isGenerating || !audioFile}
              className="w-full"
            >
              {isGenerating ? 'Processing...' : 'Remove Breaths'}
            </Button>
          </TabsContent>
        </Tabs>

        {data?.audioUrl && (
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium">Restoration Complete</p>
            <div className="flex gap-2">
              <audio controls src={data.audioUrl} className="w-full" />
            </div>
            <Button onClick={downloadRestored} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download Restored Audio
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
