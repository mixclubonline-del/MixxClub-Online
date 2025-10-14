import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getStorageUrl } from "@/lib/storage/signedUrls";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Upload, Loader2, Sparkles, User } from "lucide-react";
import { useBackgroundRemoval } from "@/hooks/useBackgroundRemoval";

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoUploaded: (url: string) => void;
}

export default function ProfilePhotoUpload({
  currentPhotoUrl,
  onPhotoUploaded,
}: ProfilePhotoUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { removeBackground, isProcessing } = useBackgroundRemoval();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async (withBackgroundRemoval: boolean = false) => {
    if (!user || !fileInputRef.current?.files?.[0]) return;

    setUploading(true);
    try {
      let fileToUpload = fileInputRef.current.files[0];

      // Apply background removal if requested
      if (withBackgroundRemoval) {
        const processedBlob = await removeBackground(fileToUpload);
        fileToUpload = new File([processedBlob], fileToUpload.name, {
          type: "image/png",
        });
      }

      // Upload to Supabase Storage
      const fileExt = fileToUpload.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("project-files")
        .upload(filePath, fileToUpload, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const url = await getStorageUrl("project-files", filePath, { 
        expiresIn: 365 * 24 * 60 * 60 // 1 year for profile photos
      });

      if (url) onPhotoUploaded(url);
      toast.success("Photo uploaded successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col items-center gap-4">
        <Avatar className="w-32 h-32">
          <AvatarImage src={previewUrl || currentPhotoUrl} />
          <AvatarFallback>
            <User className="w-16 h-16" />
          </AvatarFallback>
        </Avatar>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || isProcessing}
          >
            <Upload className="mr-2 h-4 w-4" />
            Choose Photo
          </Button>

          {previewUrl && (
            <>
              <Button
                onClick={() => handleUpload(false)}
                disabled={uploading || isProcessing}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload"
                )}
              </Button>

              <Button
                variant="secondary"
                onClick={() => handleUpload(true)}
                disabled={uploading || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Remove Background
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Upload a professional photo. Use AI background removal for a clean look.
        </p>
      </div>
    </Card>
  );
}
