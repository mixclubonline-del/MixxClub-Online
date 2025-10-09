import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Save, Sparkles } from "lucide-react";
import ProfilePhotoUpload from "./ProfilePhotoUpload";
import AIBioGenerator from "./AIBioGenerator";
import { AIAvatarGenerator } from "./AIAvatarGenerator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfileEditor() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    bio: "",
    avatar_url: "",
  });
  const [engineerProfile, setEngineerProfile] = useState({
    specialties: [] as string[],
    years_experience: 0,
    portfolio_links: [] as string[],
    equipment_list: [] as string[],
    certifications: [] as string[],
  });

  const handleAutoSave = async (field: string, value: any) => {
    if (!user) return;
    
    setAutoSaving(true);
    try {
      await supabase
        .from("profiles")
        .update({ [field]: value })
        .eq("id", user.id);
    } catch (error) {
      console.error("Auto-save error:", error);
    } finally {
      setAutoSaving(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Update main profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update(profile)
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update engineer profile if exists
      const { error: engineerError } = await supabase
        .from("engineer_profiles")
        .upsert({
          user_id: user.id,
          ...engineerProfile,
        });

      if (engineerError) throw engineerError;

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBioGenerated = (bio: string) => {
    setProfile({ ...profile, bio });
    handleAutoSave("bio", bio);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Profile Editor
            {autoSaving && (
              <span className="text-sm text-muted-foreground">Auto-saving...</span>
            )}
          </CardTitle>
          <CardDescription>
            Create a compelling professional profile with AI assistance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="professional">Professional</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => {
                    setProfile({ ...profile, full_name: e.target.value });
                    handleAutoSave("full_name", e.target.value);
                  }}
                  placeholder="Your professional name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => {
                    setProfile({ ...profile, bio: e.target.value });
                  }}
                  onBlur={(e) => handleAutoSave("bio", e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={6}
                />
                <AIBioGenerator onBioGenerated={handleBioGenerated} />
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-4">
              <ProfilePhotoUpload
                currentPhotoUrl={profile.avatar_url}
                onPhotoUploaded={(url) => {
                  setProfile({ ...profile, avatar_url: url });
                  handleAutoSave("avatar_url", url);
                }}
              />
              
              <AIAvatarGenerator 
                onAvatarGenerated={(url) => {
                  setProfile({ ...profile, avatar_url: url });
                  handleAutoSave("avatar_url", url);
                }}
              />
            </TabsContent>

            <TabsContent value="portfolio" className="space-y-4">
              <div className="space-y-2">
                <Label>Portfolio Links</Label>
                <div className="space-y-2">
                  {engineerProfile.portfolio_links.map((link, index) => (
                    <Input
                      key={index}
                      value={link}
                      onChange={(e) => {
                        const newLinks = [...engineerProfile.portfolio_links];
                        newLinks[index] = e.target.value;
                        setEngineerProfile({ ...engineerProfile, portfolio_links: newLinks });
                      }}
                      placeholder="https://soundcloud.com/..."
                    />
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEngineerProfile({
                        ...engineerProfile,
                        portfolio_links: [...engineerProfile.portfolio_links, ""],
                      });
                    }}
                  >
                    Add Portfolio Link
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="professional" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="years_experience">Years of Experience</Label>
                <Input
                  id="years_experience"
                  type="number"
                  value={engineerProfile.years_experience}
                  onChange={(e) =>
                    setEngineerProfile({
                      ...engineerProfile,
                      years_experience: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Equipment</Label>
                <div className="space-y-2">
                  {engineerProfile.equipment_list.map((equipment, index) => (
                    <Input
                      key={index}
                      value={equipment}
                      onChange={(e) => {
                        const newEquipment = [...engineerProfile.equipment_list];
                        newEquipment[index] = e.target.value;
                        setEngineerProfile({ ...engineerProfile, equipment_list: newEquipment });
                      }}
                      placeholder="SSL Console, UAD Apollo, etc."
                    />
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEngineerProfile({
                        ...engineerProfile,
                        equipment_list: [...engineerProfile.equipment_list, ""],
                      });
                    }}
                  >
                    Add Equipment
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end mt-6">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
