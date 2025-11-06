import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Music, Sparkles } from "lucide-react";
import { useAIGeneration } from "@/hooks/useAIGeneration";

export const MusicGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState("electronic");
  const [mood, setMood] = useState("energetic");
  const [generateType, setGenerateType] = useState("beat");

  const { generate, isGenerating } = useAIGeneration<{ jobId: string; status: string }>({
    functionName: 'generate-music',
    successMessage: 'Music generation started!',
    errorMessage: 'Failed to generate music',
  });

  const genres = [
    { value: "electronic", label: "Electronic" },
    { value: "hiphop", label: "Hip-Hop" },
    { value: "rock", label: "Rock" },
    { value: "pop", label: "Pop" },
    { value: "jazz", label: "Jazz" },
    { value: "classical", label: "Classical" },
    { value: "ambient", label: "Ambient" },
  ];

  const moods = [
    { value: "energetic", label: "Energetic" },
    { value: "chill", label: "Chill" },
    { value: "dark", label: "Dark" },
    { value: "uplifting", label: "Uplifting" },
    { value: "melancholic", label: "Melancholic" },
    { value: "aggressive", label: "Aggressive" },
  ];

  const types = [
    { value: "beat", label: "Beat/Drum Pattern" },
    { value: "melody", label: "Melody" },
    { value: "full", label: "Full Track" },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    await generate({
      prompt,
      genre,
      mood,
      duration: 30,
      generateType,
    });
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Music className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Music Generator</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">What to Generate</label>
          <Select value={generateType} onValueChange={setGenerateType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {types.map(t => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Genre</label>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {genres.map(g => (
                  <SelectItem key={g.value} value={g.value}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Mood</label>
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {moods.map(m => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Describe Your Idea</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Dark techno with driving bassline and industrial textures..."
            rows={4}
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
        >
          {isGenerating ? (
            "Generating..."
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Music (30s)
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Music generation takes 30-60 seconds. You'll be notified when ready.
        </p>
      </div>
    </Card>
  );
};
