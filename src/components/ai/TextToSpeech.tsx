import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, Play, Download } from "lucide-react";
import { useAIGeneration } from "@/hooks/useAIGeneration";

export const TextToSpeech = () => {
  const [text, setText] = useState("");
  const [voiceId, setVoiceId] = useState("9BWtsMINqrJLrRacOk9x"); // Aria
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const { generate, isGenerating } = useAIGeneration<{ audioUrl: string }>({
    functionName: 'text-to-speech',
    successMessage: 'Voice generated!',
    errorMessage: 'Failed to generate voice',
  });

  const voices = [
    { id: "9BWtsMINqrJLrRacOk9x", name: "Aria", description: "Expressive, natural" },
    { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", description: "Soft, calm" },
    { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura", description: "Professional, clear" },
    { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie", description: "Friendly, warm" },
    { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", description: "Deep, authoritative" },
    { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam", description: "Young, energetic" },
    { id: "XB0fDUnXU5powFXDhCwa", name: "Charlotte", description: "Elegant, refined" },
    { id: "bIHbv24MWmeRgasZH58o", name: "Will", description: "Confident, strong" },
  ];

  const handleGenerate = async () => {
    if (!text.trim()) return;

    const data = await generate({
      text,
      voiceId,
      modelId: 'eleven_turbo_v2_5',
    });

    if (data?.audioUrl) {
      setAudioUrl(data.audioUrl);
    }
  };

  const playAudio = () => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audio.play();
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = 'voice-output.mp3';
    link.click();
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Mic className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Text-to-Speech</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Voice</label>
          <Select value={voiceId} onValueChange={setVoiceId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {voices.map(v => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name} - {v.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Text to Speak</label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to convert to speech..."
            rows={6}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {text.length} characters
          </p>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !text.trim()}
          className="w-full"
        >
          {isGenerating ? "Generating Voice..." : "Generate Speech"}
        </Button>

        {audioUrl && (
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium">Voice Ready</p>
            <div className="flex gap-2">
              <Button onClick={playAudio} variant="outline" size="sm" className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                Play
              </Button>
              <Button onClick={downloadAudio} variant="outline" size="sm" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
