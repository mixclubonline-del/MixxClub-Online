import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image, Download, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AlbumArtworkGeneratorProps {
  trackAnalysis?: {
    genre?: string;
    mood?: string;
  };
  onArtworkGenerated?: (imageUrl: string) => void;
}

export const AlbumArtworkGenerator = ({
  trackAnalysis,
  onArtworkGenerated,
}: AlbumArtworkGeneratorProps) => {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("modern");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const styles = [
    { value: "modern", label: "Modern" },
    { value: "vintage", label: "Vintage" },
    { value: "abstract", label: "Abstract" },
    { value: "minimalist", label: "Minimalist" },
    { value: "futuristic", label: "Futuristic" },
  ];

  const generateArtwork = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-album-art', {
        body: { prompt, style, trackAnalysis }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setGeneratedImageUrl(data.imageUrl);
      onArtworkGenerated?.(data.imageUrl);
      toast.success("Album artwork generated!");
    } catch (error: any) {
      console.error('Error generating artwork:', error);
      toast.error(error.message || "Failed to generate artwork");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImageUrl) return;
    
    const link = document.createElement('a');
    link.href = generatedImageUrl;
    link.download = 'album-artwork.png';
    link.click();
    toast.success("Download started");
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Image className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Album Artwork Generator</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Style</label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {styles.map(s => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Describe your album artwork</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Neon cityscape at night with vibrant purple and blue tones..."
            rows={4}
          />
        </div>

        <Button
          onClick={generateArtwork}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            "Generating..."
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Artwork
            </>
          )}
        </Button>

        {generatedImageUrl && (
          <div className="space-y-3">
            <img
              src={generatedImageUrl}
              alt="Generated album artwork"
              className="w-full rounded-lg border"
            />
            <Button onClick={downloadImage} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download Artwork
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
