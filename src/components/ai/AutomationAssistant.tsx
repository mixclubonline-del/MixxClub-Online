import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Upload, Download } from "lucide-react";
import { useAIGeneration } from "@/hooks/useAIGeneration";
import { toast } from "sonner";

export const AutomationAssistant = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const { generate, isGenerating, data } = useAIGeneration<{
    automation: any;
    visualization: string;
  }>({
    functionName: 'generate-automation',
    successMessage: 'Automation generated!',
    errorMessage: 'Failed to generate automation',
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

  const handleGenerate = async (automationType: string) => {
    if (!audioFile) {
      toast.error('Please upload an audio file first');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const audioData = e.target?.result as string;
      
      await generate({
        audioData,
        automationType,
      });
    };
    reader.readAsDataURL(audioFile);
  };

  const downloadAutomation = () => {
    if (data?.automation) {
      const blob = new Blob([JSON.stringify(data.automation, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'automation-data.json';
      link.click();
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Automation Assistant</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Upload Track</label>
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
              id="automation-upload"
            />
            <label htmlFor="automation-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {audioFile ? audioFile.name : 'Click to upload audio file'}
              </p>
            </label>
          </div>
        </div>

        <Tabs defaultValue="volume" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="volume">Volume</TabsTrigger>
            <TabsTrigger value="fade">Fades</TabsTrigger>
            <TabsTrigger value="crossfade">Crossfade</TabsTrigger>
            <TabsTrigger value="tempo">Tempo</TabsTrigger>
          </TabsList>

          <TabsContent value="volume" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              AI analyzes your track and suggests intelligent volume automation curves for dynamic control
            </p>
            <Button 
              onClick={() => handleGenerate('volume')} 
              disabled={isGenerating || !audioFile}
              className="w-full"
            >
              {isGenerating ? 'Analyzing...' : 'Generate Volume Automation'}
            </Button>
          </TabsContent>

          <TabsContent value="fade" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create perfect fade-in and fade-out curves with AI-optimized timing and curves
            </p>
            <Button 
              onClick={() => handleGenerate('fade')} 
              disabled={isGenerating || !audioFile}
              className="w-full"
            >
              {isGenerating ? 'Analyzing...' : 'Generate Smart Fades'}
            </Button>
          </TabsContent>

          <TabsContent value="crossfade" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Optimize crossfade transitions for DJ sets and seamless track transitions
            </p>
            <Button 
              onClick={() => handleGenerate('crossfade')} 
              disabled={isGenerating || !audioFile}
              className="w-full"
            >
              {isGenerating ? 'Analyzing...' : 'Generate Crossfade'}
            </Button>
          </TabsContent>

          <TabsContent value="tempo" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Auto-detect tempo changes and create tempo mapping for live recordings
            </p>
            <Button 
              onClick={() => handleGenerate('tempo')} 
              disabled={isGenerating || !audioFile}
              className="w-full"
            >
              {isGenerating ? 'Analyzing...' : 'Map Tempo Changes'}
            </Button>
          </TabsContent>
        </Tabs>

        {data?.visualization && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium">Automation Preview</p>
            <div className="bg-background rounded-lg p-4 h-48 flex items-center justify-center">
              <img 
                src={data.visualization} 
                alt="Automation curve" 
                className="max-w-full max-h-full"
              />
            </div>
            <Button onClick={downloadAutomation} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export Automation Data
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
