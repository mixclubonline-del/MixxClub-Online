import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Sparkles, Loader2, Download, Upload } from 'lucide-react';

interface AIAvatarGeneratorProps {
  onAvatarGenerated?: (url: string) => void;
}

export const AIAvatarGenerator = ({ onAvatarGenerated }: AIAvatarGeneratorProps) => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('professional musician portrait');
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe your desired avatar');
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-avatar', {
        body: { 
          prompt: `${style}, ${prompt}. High quality, professional headshot, centered composition`,
          userId: user?.id 
        }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast.success('Avatar generated! Click "Use as Profile Photo" to apply it.');
      }
    } catch (error: any) {
      console.error('Error generating avatar:', error);
      toast.error(error.message || 'Failed to generate avatar');
    } finally {
      setGenerating(false);
    }
  };

  const handleUploadToProfile = async () => {
    if (!generatedImage || !user) return;

    setUploading(true);
    try {
      // Convert base64 to blob
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      
      const fileName = `avatar-${user.id}-${Date.now()}.png`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('media-library')
        .upload(filePath, blob, {
          contentType: 'image/png',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media-library')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success('Profile photo updated!');
      if (onAvatarGenerated) {
        onAvatarGenerated(publicUrl);
      }
      setGeneratedImage(null);
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `avatar-${Date.now()}.png`;
    link.click();
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Avatar Generator</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="style">Style</Label>
          <Input
            id="style"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            placeholder="professional musician portrait"
            disabled={generating}
          />
        </div>

        <div>
          <Label htmlFor="prompt">Describe Your Avatar</Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., hip hop producer with headphones, studio background, confident expression..."
            rows={4}
            disabled={generating}
          />
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={generating || !prompt.trim()}
          className="w-full"
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Avatar...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate AI Avatar
            </>
          )}
        </Button>

        {generatedImage && (
          <div className="space-y-4 animate-in fade-in">
            <div className="relative rounded-lg overflow-hidden border-2 border-primary/20">
              <img 
                src={generatedImage} 
                alt="Generated avatar" 
                className="w-full h-auto"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleUploadToProfile}
                disabled={uploading}
                className="flex-1"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Use as Profile Photo
                  </>
                )}
              </Button>
              
              <Button 
                onClick={downloadImage}
                variant="outline"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
