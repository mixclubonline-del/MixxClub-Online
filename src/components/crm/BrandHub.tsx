import React, { useState, useCallback } from "react";
import { CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  User,
  Palette,
  Globe,
  MessageSquare,
  Eye,
  Sparkles,
  MapPin,
  Link as LinkIcon,
  BadgeCheck,
  Loader2,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { GlassPanel, HubHeader, HubSkeleton } from "./design";
import {
  ProfileCanvasEditor,
  type ProfileConfig,
  DEFAULT_PROFILE_CONFIG,
} from "@/components/profile/identity";

const PROFILE_THEMES = [
  { value: "default", label: "Default", color: "bg-primary" },
  { value: "dark", label: "Midnight", color: "bg-zinc-900" },
  { value: "neon", label: "Neon", color: "bg-gradient-to-r from-pink-500 to-purple-500" },
  { value: "gold", label: "Gold", color: "bg-gradient-to-r from-yellow-500 to-amber-500" },
  { value: "ocean", label: "Ocean", color: "bg-gradient-to-r from-blue-500 to-cyan-500" },
];

const STATUS_EMOJIS = ["🎵", "🎧", "🎤", "🔥", "💫", "🎹", "🎸", "🎺", "🥁", "🎷", "✨", "💿", "📀", "🎼"];

export function BrandHub() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  // Fetch current profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["brand-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    tagline: "",
    bio: "",
    location: "",
    website_url: "",
    profile_theme: "default",
    status_emoji: "",
    status_text: "",
    is_available_for_collab: true,
  });

  // Visual identity config
  const [visualConfig, setVisualConfig] = useState<ProfileConfig>(DEFAULT_PROFILE_CONFIG);

  // Update form when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        full_name: profile.full_name || "",
        tagline: profile.tagline || "",
        bio: profile.bio || "",
        location: profile.location || "",
        website_url: profile.website_url || "",
        profile_theme: profile.profile_theme || "default",
        status_emoji: profile.status_emoji || "",
        status_text: profile.status_text || "",
        is_available_for_collab: profile.is_available_for_collab ?? true,
      });
      // Load visual identity config
      const savedConfig = (profile as Record<string, unknown>).profile_config;
      if (savedConfig && typeof savedConfig === 'object') {
        setVisualConfig({ ...DEFAULT_PROFILE_CONFIG, ...(savedConfig as Partial<ProfileConfig>) });
      }
    }
  }, [profile]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (updates: typeof formData) => {
      if (!user?.id) throw new Error("Not logged in");

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand-profile"] });
      queryClient.invalidateQueries({ queryKey: ["public-profile"] });
      toast.success("Profile saved!");
    },
    onError: (error) => {
      console.error("Save error:", error);
      toast.error("Failed to save profile");
    },
  });

  const handleSave = () => {
    setIsSaving(true);
    saveMutation.mutate(formData, {
      onSettled: () => setIsSaving(false),
    });
  };

  const initials = formData.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

  if (isLoading) {
    return <HubSkeleton variant="tabs" count={3} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <HubHeader
        icon={<Sparkles className="h-5 w-5 text-amber-400" />}
        title="Brand Hub"
        subtitle="Build and manage your professional identity"
        accent="rgba(245, 158, 11, 0.5)"
        action={
          <div className="flex gap-3">
            {formData.username && (
              <Button variant="outline" onClick={() => navigate(`/u/${formData.username}`)} className="border-white/10">
                <Eye className="h-4 w-4 mr-2" />
                View Public Profile
              </Button>
            )}
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Preview Card */}
        <GlassPanel className="lg:col-span-1">
          <HubHeader
            icon={<Eye className="h-5 w-5 text-blue-400" />}
            title="Live Preview"
            subtitle="How others see you"
            accent="rgba(59, 130, 246, 0.5)"
          />
          <div className="mt-4">
            <div className="space-y-4">
              {/* Avatar Preview */}
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                  </Avatar>
                  {formData.status_emoji && (
                    <div className="absolute -bottom-1 -right-1 text-xl bg-background rounded-full p-1 shadow-lg">
                      {formData.status_emoji}
                    </div>
                  )}
                  {profile?.is_verified && (
                    <BadgeCheck className="absolute -top-1 -right-1 h-6 w-6 text-primary" />
                  )}
                </div>

                <h3 className="font-bold text-lg mt-3">{formData.full_name || "Your Name"}</h3>
                {formData.username && (
                  <p className="text-muted-foreground text-sm">@{formData.username}</p>
                )}
                {formData.tagline && (
                  <p className="text-sm mt-1">{formData.tagline}</p>
                )}
              </div>

              {/* Status */}
              {formData.status_text && (
                <div className="text-center text-sm text-muted-foreground italic">
                  "{formData.status_text}"
                </div>
              )}

              {/* Meta */}
              <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
                {formData.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {formData.location}
                  </span>
                )}
                {formData.website_url && (
                  <span className="flex items-center gap-1">
                    <LinkIcon className="h-3 w-3" />
                    Website
                  </span>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap justify-center gap-2">
                {formData.is_available_for_collab && (
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    Open to Collab
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="flex justify-center gap-6 pt-4 border-t">
                <div className="text-center">
                  <p className="font-bold">{profile?.follower_count || 0}</p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">{profile?.following_count || 0}</p>
                  <p className="text-xs text-muted-foreground">Following</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">{profile?.profile_views_count || 0}</p>
                  <p className="text-xs text-muted-foreground">Views</p>
                </div>
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* Editor */}
        <GlassPanel className="lg:col-span-2" glow accent="rgba(245, 158, 11, 0.3)">
          <HubHeader
            icon={<User className="h-5 w-5 text-amber-400" />}
            title="Edit Your Brand"
            accent="rgba(245, 158, 11, 0.5)"
          />
          <div className="mt-4">
            <Tabs defaultValue="identity" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="identity" className="gap-2">
                  <User className="h-4 w-4" />
                  Identity
                </TabsTrigger>
                <TabsTrigger value="presence" className="gap-2">
                  <Globe className="h-4 w-4" />
                  Presence
                </TabsTrigger>
                <TabsTrigger value="theme" className="gap-2">
                  <Palette className="h-4 w-4" />
                  Theme
                </TabsTrigger>
                <TabsTrigger value="visual" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Visual ID
                </TabsTrigger>
              </TabsList>

              <TabsContent value="identity" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
                        className="pl-8"
                        placeholder="yourname"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Your unique URL: /u/{formData.username || "..."}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="full_name">Display Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Your Name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="Grammy-nominated producer | 10+ years in the game"
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">{formData.tagline.length}/100 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell your story..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Atlanta, GA"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                      placeholder="https://yoursite.com"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="presence" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Open to Collaboration</Label>
                      <p className="text-sm text-muted-foreground">Show that you're available for work</p>
                    </div>
                    <Switch
                      checked={formData.is_available_for_collab}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_available_for_collab: checked })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Status Emoji</Label>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setFormData({ ...formData, status_emoji: formData.status_emoji === emoji ? "" : emoji })}
                          className={`text-2xl p-2 rounded-lg transition-colors ${formData.status_emoji === emoji
                            ? "bg-primary/20 ring-2 ring-primary"
                            : "hover:bg-muted"
                            }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status_text">Status Message</Label>
                    <Input
                      id="status_text"
                      value={formData.status_text}
                      onChange={(e) => setFormData({ ...formData, status_text: e.target.value })}
                      placeholder="In the studio cooking up heat 🔥"
                      maxLength={50}
                    />
                    <p className="text-xs text-muted-foreground">{formData.status_text.length}/50 characters</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="theme" className="space-y-4">
                <div className="space-y-2">
                  <Label>Profile Theme</Label>
                  <div className="grid grid-cols-5 gap-3">
                    {PROFILE_THEMES.map((theme) => (
                      <button
                        key={theme.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, profile_theme: theme.value })}
                        className={`h-16 rounded-lg ${theme.color} transition-all ${formData.profile_theme === theme.value
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105"
                          : "opacity-70 hover:opacity-100"
                          }`}
                        title={theme.label}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Selected: {PROFILE_THEMES.find(t => t.value === formData.profile_theme)?.label || "Default"}
                  </p>
                </div>

                <div className="rounded-lg border border-dashed border-muted-foreground/30 p-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    💡 For advanced customization, check the <strong>Visual ID</strong> tab
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="visual" className="space-y-4">
                <ProfileCanvasEditor
                  config={visualConfig}
                  onChange={setVisualConfig}
                  onSave={handleSave}
                  saving={isSaving}
                  profile={{
                    full_name: formData.full_name,
                    username: formData.username,
                    avatar_url: profile?.avatar_url,
                    tagline: formData.tagline,
                    bio: formData.bio,
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>
        </GlassPanel>
      </div>

      {/* Analytics Preview */}
      <GlassPanel glow accent="rgba(245, 158, 11, 0.3)">
        <HubHeader
          icon={<MessageSquare className="h-5 w-5 text-amber-400" />}
          title="Brand Performance"
          subtitle="How your profile is performing"
          accent="rgba(245, 158, 11, 0.5)"
        />
        <div className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GlassPanel padding="p-4" hoverable>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{profile?.profile_views_count || 0}</p>
                <p className="text-sm text-muted-foreground">Profile Views</p>
              </div>
            </GlassPanel>
            <GlassPanel padding="p-4" hoverable>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{profile?.follower_count || 0}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </div>
            </GlassPanel>
            <GlassPanel padding="p-4" hoverable>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{profile?.following_count || 0}</p>
                <p className="text-sm text-muted-foreground">Following</p>
              </div>
            </GlassPanel>
            <GlassPanel padding="p-4" hoverable>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">Level {profile?.level || 1}</p>
                <p className="text-sm text-muted-foreground">{profile?.total_xp || 0} XP</p>
              </div>
            </GlassPanel>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
