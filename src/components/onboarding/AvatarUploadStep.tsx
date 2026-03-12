import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AvatarUploadStepProps {
  userId: string;
  currentUrl: string | null;
  onUploaded: (url: string) => void;
  accentColor?: string;
  roleName?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function AvatarUploadStep({
  userId,
  currentUrl,
  onUploaded,
  accentColor = 'hsl(var(--primary))',
  roleName = 'Creator',
}: AvatarUploadStepProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Image must be under 5 MB.');
      return;
    }

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setIsUploading(true);

    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${userId}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path);

      // Bust cache with timestamp
      const freshUrl = `${publicUrl}?t=${Date.now()}`;
      setPreview(freshUrl);
      onUploaded(freshUrl);
      toast.success('Looking good! 🔥');
    } catch (err) {
      console.error('Avatar upload error:', err);
      toast.error('Upload failed. Try again.');
      setPreview(currentUrl);
    } finally {
      setIsUploading(false);
    }
  }, [userId, currentUrl, onUploaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleRemove = () => {
    setPreview(null);
    onUploaded('');
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold mb-1">Your Profile Picture</h2>
        <p className="text-muted-foreground text-sm">
          First impressions count — add a photo so people recognize you
        </p>
      </div>

      {/* Upload area */}
      <div
        className="relative mx-auto w-36 h-36 group cursor-pointer"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {/* Ring */}
        <div
          className="absolute inset-0 rounded-full transition-all"
          style={{
            border: `3px solid ${preview ? accentColor : 'hsl(var(--muted-foreground) / 0.3)'}`,
            boxShadow: preview ? `0 0 20px ${accentColor}40` : 'none',
          }}
        />

        {preview ? (
          <>
            <img
              src={preview}
              alt="Avatar preview"
              className="w-full h-full rounded-full object-cover"
            />
            {/* Remove button */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleRemove(); }}
              className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="w-full h-full rounded-full bg-muted/30 flex flex-col items-center justify-center gap-1 border border-dashed border-muted-foreground/30 group-hover:border-muted-foreground/60 transition-colors">
            <Camera className="w-8 h-8 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground font-medium">Add Photo</span>
          </div>
        )}

        {/* Uploading overlay */}
        {isUploading && (
          <div className="absolute inset-0 rounded-full bg-background/70 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: accentColor }} />
          </div>
        )}
      </div>

      {/* Upload button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg border border-white/10 hover:border-white/20"
        >
          <Upload className="w-4 h-4" />
          {preview ? 'Change Photo' : 'Upload Photo'}
        </button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        JPG, PNG, or WebP • Max 5 MB • You can change this anytime
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
