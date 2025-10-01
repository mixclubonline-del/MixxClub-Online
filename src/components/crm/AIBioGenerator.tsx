import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";
import { useProfileAI } from "@/hooks/useProfileAI";

interface AIBioGeneratorProps {
  onBioGenerated: (bio: string) => void;
}

export default function AIBioGenerator({ onBioGenerated }: AIBioGeneratorProps) {
  const { user } = useAuth();
  const { generateBio, isGenerating } = useProfileAI();
  const [tone, setTone] = useState<"professional" | "creative" | "casual">("professional");

  const handleGenerate = async () => {
    if (!user) return;

    try {
      const bio = await generateBio(tone);
      onBioGenerated(bio);
      toast.success("AI bio generated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate bio");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={tone}
        onChange={(e) => setTone(e.target.value as any)}
        className="px-3 py-2 rounded-md border bg-background"
        disabled={isGenerating}
      >
        <option value="professional">Professional</option>
        <option value="creative">Creative</option>
        <option value="casual">Casual</option>
      </select>
      
      <Button
        variant="secondary"
        size="sm"
        onClick={handleGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate with AI
          </>
        )}
      </Button>
    </div>
  );
}
