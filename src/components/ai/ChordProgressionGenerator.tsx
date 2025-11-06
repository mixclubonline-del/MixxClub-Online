import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Music, Download, Play } from "lucide-react";
import { useAIGeneration } from "@/hooks/useAIGeneration";
import { Badge } from "@/components/ui/badge";

export const ChordProgressionGenerator = () => {
  const [key, setKey] = useState("C");
  const [scale, setScale] = useState("major");
  const [mood, setMood] = useState("happy");
  const [complexity, setComplexity] = useState("simple");

  const { generate, isGenerating, data } = useAIGeneration<{
    progression: string[];
    midi: string;
    explanation: string;
  }>({
    functionName: 'generate-chords',
    successMessage: 'Chord progression generated!',
    errorMessage: 'Failed to generate chords',
  });

  const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const scales = [
    { value: "major", label: "Major" },
    { value: "minor", label: "Minor" },
    { value: "dorian", label: "Dorian" },
    { value: "mixolydian", label: "Mixolydian" },
    { value: "phrygian", label: "Phrygian" },
  ];

  const moods = [
    { value: "happy", label: "Happy" },
    { value: "sad", label: "Sad" },
    { value: "energetic", label: "Energetic" },
    { value: "chill", label: "Chill" },
    { value: "dark", label: "Dark" },
    { value: "uplifting", label: "Uplifting" },
  ];

  const complexities = [
    { value: "simple", label: "Simple (4 chords)" },
    { value: "medium", label: "Medium (6-8 chords)" },
    { value: "complex", label: "Complex (10+ chords)" },
  ];

  const handleGenerate = async () => {
    await generate({
      key,
      scale,
      mood,
      complexity,
    });
  };

  const downloadMidi = () => {
    if (data?.midi) {
      const link = document.createElement('a');
      link.href = data.midi;
      link.download = 'chord-progression.mid';
      link.click();
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Music className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Chord Progression Generator</h3>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Key</label>
            <Select value={key} onValueChange={setKey}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {keys.map(k => (
                  <SelectItem key={k} value={k}>{k}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Scale</label>
            <Select value={scale} onValueChange={setScale}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {scales.map(s => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
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

          <div>
            <label className="text-sm font-medium mb-2 block">Complexity</label>
            <Select value={complexity} onValueChange={setComplexity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {complexities.map(c => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? 'Generating...' : 'Generate Chord Progression'}
        </Button>

        {data && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium mb-2">Progression</p>
              <div className="flex flex-wrap gap-2">
                {data.progression.map((chord, i) => (
                  <Badge key={i} variant="secondary" className="text-lg px-4 py-2">
                    {chord}
                  </Badge>
                ))}
              </div>
            </div>

            {data.explanation && (
              <div>
                <p className="text-sm font-medium mb-2">Music Theory</p>
                <p className="text-sm text-muted-foreground">{data.explanation}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={downloadMidi} variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download MIDI
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
