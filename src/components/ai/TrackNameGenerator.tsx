import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, RefreshCw, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TrackNameGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName?: string;
  audioAnalysis?: {
    tempo?: number;
    key?: string;
    genre?: string;
    energy?: number;
    mood?: string;
  };
  onSelectName: (name: string) => void;
}

export const TrackNameGenerator = ({
  open,
  onOpenChange,
  currentName,
  audioAnalysis,
  onSelectName,
}: TrackNameGeneratorProps) => {
  const [suggestions, setSuggestions] = useState<Array<{ name: string; reason: string }>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const generateNames = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-track-name', {
        body: { trackName: currentName, audioAnalysis }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setSuggestions(data.suggestions || []);
      toast.success("AI generated creative track names!");
    } catch (error: any) {
      console.error('Error generating names:', error);
      toast.error(error.message || "Failed to generate names");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectName = (name: string) => {
    setSelectedName(name);
    onSelectName(name);
    toast.success(`Track name set to: ${name}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Track Name Generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {audioAnalysis && (
            <Card className="p-4 bg-muted/50">
              <div className="grid grid-cols-2 gap-2 text-sm">
                {audioAnalysis.tempo && <div>Tempo: {audioAnalysis.tempo} BPM</div>}
                {audioAnalysis.key && <div>Key: {audioAnalysis.key}</div>}
                {audioAnalysis.genre && <div>Genre: {audioAnalysis.genre}</div>}
                {audioAnalysis.mood && <div>Mood: {audioAnalysis.mood}</div>}
              </div>
            </Card>
          )}

          <div className="flex gap-2">
            <Button
              onClick={generateNames}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {suggestions.length > 0 ? 'Regenerate' : 'Generate Names'}
                </>
              )}
            </Button>
          </div>

          {suggestions.length > 0 && (
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <Card
                  key={index}
                  className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleSelectName(suggestion.name)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{suggestion.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {suggestion.reason}
                      </div>
                    </div>
                    {selectedName === suggestion.name && (
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
