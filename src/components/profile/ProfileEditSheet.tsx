import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUsernameValidation } from '@/hooks/useUsernameValidation';
import { toast } from 'sonner';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  AtSign, Loader2, Check, X, Save, User, Camera,
} from 'lucide-react';

const GENRES = [
  'Hip-Hop', 'R&B', 'Pop', 'Trap', 'Drill', 'Electronic',
  'Rock', 'Jazz', 'Soul', 'Afrobeats', 'Latin', 'Indie', 'Lo-Fi',
];

interface ProfileEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileEditSheet({ open, onOpenChange }: ProfileEditSheetProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const {
    username, setUsername, isChecking, isAvailable, error: usernameError, isValid: isUsernameValid,
  } = useUsernameValidation();

  // Load current profile data when sheet opens
  useEffect(() => {
    if (!open || !user) return;

    const loadProfile = async () => {
      setLoading(true);
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, username, bio, avatar_url, genre_specialties')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setFullName(profile.full_name || '');
        setBio(profile.bio || '');
        setAvatarUrl(profile.avatar_url || '');
        setSelectedGenres(
          Array.isArray(profile.genre_specialties) ? profile.genre_specialties : []
        );
        if (profile.username) {
          setUsername(profile.username);
        }
      }
      setLoading(false);
    };

    loadProfile();
  }, [open, user]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `avatars/${user.id}/profile.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path);

      setAvatarUrl(`${publicUrl}?t=${Date.now()}`);
    } catch (err) {
      console.error('Avatar upload error:', err);
      toast.error('Failed to upload photo');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    if (!fullName.trim()) {
      toast.error('Name is required');
      return;
    }

    if (username && !isUsernameValid) {
      toast.error('Please fix the username before saving');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          username: username || undefined,
          bio: bio.trim() || null,
          avatar_url: avatarUrl || null,
          genre_specialties: selectedGenres.length > 0 ? selectedGenres : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated!');
      onOpenChange(false);
    } catch (err) {
      console.error('Profile save error:', err);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Profile</SheetTitle>
          <SheetDescription>Update your Mixxclub profile details</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6 mt-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    <User className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  {uploadingAvatar ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>
              <p className="text-xs text-muted-foreground">Click to change photo</p>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <AtSign className="h-4 w-4" />
                </span>
                <Input
                  id="edit-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9 pr-10"
                  placeholder="yourname"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isChecking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  {!isChecking && isAvailable === true && <Check className="h-4 w-4 text-green-500" />}
                  {!isChecking && isAvailable === false && <X className="h-4 w-4 text-destructive" />}
                </div>
              </div>
              {usernameError && <p className="text-xs text-destructive">{usernameError}</p>}
              {!usernameError && isAvailable === false && <p className="text-xs text-destructive">Username taken</p>}
              {!usernameError && isAvailable === true && <p className="text-xs text-green-500">Available</p>}
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="edit-bio">Bio</Label>
              <Textarea
                id="edit-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell people about yourself..."
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Genres */}
            <div className="space-y-2">
              <Label>Genre Preferences</Label>
              <div className="flex flex-wrap gap-1.5">
                {GENRES.map((genre) => (
                  <Badge
                    key={genre}
                    variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                    className={`cursor-pointer text-xs py-1 px-2.5 transition-all ${
                      selectedGenres.includes(genre)
                        ? 'bg-primary hover:bg-primary/90'
                        : 'hover:bg-primary/10 border-border'
                    }`}
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Save button */}
            <Button
              onClick={handleSave}
              disabled={saving || !fullName.trim()}
              className="w-full gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
