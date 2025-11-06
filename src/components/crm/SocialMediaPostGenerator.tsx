import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const SocialMediaPostGenerator = () => {
  const [trackName, setTrackName] = useState("");
  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");
  const [vibe, setVibe] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [targetPlatform, setTargetPlatform] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [posts, setPosts] = useState<any>({});
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const platforms = [
    { value: "all", label: "All Platforms" },
    { value: "instagram", label: "Instagram" },
    { value: "twitter", label: "Twitter/X" },
    { value: "tiktok", label: "TikTok" },
    { value: "facebook", label: "Facebook" },
  ];

  const generatePosts = async () => {
    if (!trackName.trim()) {
      toast.error("Please enter a track name");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-social-posts', {
        body: { trackName, genre, mood, vibe, additionalDetails, targetPlatform }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setPosts(data.posts || {});
      toast.success("Social media posts generated!");
    } catch (error: any) {
      console.error('Error generating posts:', error);
      toast.error(error.message || "Failed to generate posts");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Share2 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Social Media Post Generator</h3>
      </div>

      <div className="grid gap-4">
        <Input
          placeholder="Track Name"
          value={trackName}
          onChange={(e) => setTrackName(e.target.value)}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="Genre (e.g., Hip-Hop)"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          />
          <Input
            placeholder="Mood (e.g., Energetic)"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
          />
        </div>

        <Input
          placeholder="Vibe (e.g., Summer vibes)"
          value={vibe}
          onChange={(e) => setVibe(e.target.value)}
        />

        <Textarea
          placeholder="Additional details (optional)"
          value={additionalDetails}
          onChange={(e) => setAdditionalDetails(e.target.value)}
          rows={2}
        />

        <Select value={targetPlatform} onValueChange={setTargetPlatform}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {platforms.map(p => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={generatePosts} disabled={isGenerating} className="w-full">
          {isGenerating ? "Generating..." : "Generate Posts"}
        </Button>
      </div>

      {Object.keys(posts).length > 0 && (
        <div className="space-y-4">
          {Object.entries(posts).map(([platform, variations]: [string, any]) => (
            <div key={platform} className="space-y-2">
              <h4 className="font-semibold capitalize">{platform}</h4>
              {Array.isArray(variations) && variations.map((post: string, idx: number) => (
                <Card key={idx} className="p-4">
                  <div className="flex justify-between items-start gap-3">
                    <p className="text-sm flex-1 whitespace-pre-wrap">{post}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(post, `${platform}-${idx}`)}
                    >
                      {copiedIndex === `${platform}-${idx}` ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {post.length} characters
                  </div>
                </Card>
              ))}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
