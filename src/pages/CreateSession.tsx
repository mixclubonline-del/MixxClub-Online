import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUnlockContribution } from "@/hooks/useUnlockContribution";
import { attributionToasts } from "@/components/unlock/UnlockAttributionToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Music, DollarSign, Clock, Sparkles, Users, Zap } from "lucide-react";
import { toast } from "sonner";

const GENRES = [
  "Hip-Hop", "R&B", "Trap", "Pop", "Rock", "Electronic",
  "Jazz", "Soul", "Latin", "Country", "Indie", "Other"
];

const SERVICE_TYPES = [
  { value: "mixing", label: "Mixing", description: "Full mix of your track" },
  { value: "mastering", label: "Mastering", description: "Final polish and loudness" },
  { value: "vocal_mixing", label: "Vocal Mixing", description: "Focus on vocals only" },
  { value: "full_production", label: "Full Production", description: "Mixing + Mastering" },
];

const CreateSession = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { getContributionMessage } = useUnlockContribution();
  const [loading, setLoading] = useState(false);
  const collaboratorId = searchParams.get('with');
  const [collaborator, setCollaborator] = useState<{
    id: string;
    full_name: string;
    username: string;
    avatar_url: string | null;
    role: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    genre: "",
    serviceType: "mixing",
    budget: 150,
    deadline: "",
    visibility: collaboratorId ? "private" : "public",
  });

  // Fetch collaborator profile when pre-selected via ?with= param
  useEffect(() => {
    if (!collaboratorId) return;
    const fetchCollaborator = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, role')
        .eq('id', collaboratorId)
        .single();
      if (data) setCollaborator(data);
    };
    fetchCollaborator();
  }, [collaboratorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to create a session");
      navigate("/auth?mode=signup");
      return;
    }

    if (!formData.title || !formData.genre) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const { data: session, error } = await supabase.from("collaboration_sessions").insert({
        host_user_id: user.id,
        title: formData.title,
        description: formData.description,
        session_type: formData.serviceType,
        visibility: formData.visibility,
        status: "active",
        session_state: {
          genre: formData.genre,
          budget: formData.budget,
          deadline: formData.deadline,
          invited_collaborator: collaborator?.id || null,
        },
      }).select('id').single();

      if (error) throw error;

      // If we have a pre-selected collaborator, add them as a participant
      if (collaborator && session) {
        await supabase.from("session_participants").insert({
          session_id: session.id,
          user_id: collaborator.id,
          role: collaborator.role === 'engineer' ? 'engineer' : 'collaborator',
          status: 'invited',
        });

        // Update the match status to 'working' if this came from a match
        await supabase
          .from('user_matches')
          .update({ status: 'working' })
          .or(`matched_user_id.eq.${collaborator.id}, user_id.eq.${collaborator.id} `)
          .eq('status', 'contacted');
      }

      toast.success(
        collaborator
          ? `Session created! ${collaborator.full_name || collaborator.username} has been invited.`
          : "Session created! Engineers can now apply."
      );

      // Trigger unlock attribution toast
      const contribution = getContributionMessage('sessions_completed', 'Session');
      attributionToasts.sessionCompleted(contribution);

      navigate(session ? `/session/${session.id}` : "/sessions");
    } catch (err) {
      console.error("Failed to create session:", err);
      toast.error("Failed to create session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-[32rem] h-[32rem] bg-accent-blue/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 container max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Music className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Create a Session</h1>
              <p className="text-muted-foreground">Find the perfect engineer for your track</p>
            </div>
          </div>
        </div>

        {/* Invited Collaborator Banner */}
        {collaborator && (
          <Card className="mb-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                  {collaborator.full_name?.[0] || collaborator.username?.[0] || '?'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    Session with {collaborator.full_name || collaborator.username}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {collaborator.role === 'engineer' ? 'Mix Engineer' : collaborator.role === 'producer' ? 'Producer' : 'Collaborator'} • Private session
                  </p>
                </div>
                <Users className="w-5 h-5 text-green-500" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Benefits Banner */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-accent-blue/10 border-primary/20">
          <CardContent className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">50+ Engineers</p>
                  <p className="text-sm text-muted-foreground">Ready to work</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-blue/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-accent-blue" />
                </div>
                <div>
                  <p className="font-medium">Fast Turnaround</p>
                  <p className="text-sm text-muted-foreground">24-48 hour response</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Quality Guaranteed</p>
                  <p className="text-sm text-muted-foreground">Unlimited revisions</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            {/* Project Details */}
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-xl">Project Details</CardTitle>
                <CardDescription>Tell engineers about your track</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Session Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Need mixing for 808-heavy trap banger"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-background/50 border-border/50 focus:border-primary/50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your track, reference artists, and what you're looking for..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-background/50 border-border/50 focus:border-primary/50 min-h-[120px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Genre *</Label>
                    <Select
                      value={formData.genre}
                      onValueChange={(value) => setFormData({ ...formData, genre: value })}
                    >
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENRES.map((genre) => (
                          <SelectItem key={genre} value={genre.toLowerCase()}>
                            {genre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Service Type</Label>
                    <Select
                      value={formData.serviceType}
                      onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
                    >
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <span className="font-medium">{type.label}</span>
                              <span className="text-muted-foreground ml-2 text-sm">- {type.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget & Timeline */}
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Budget & Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Budget</Label>
                    <span className="text-2xl font-bold text-primary">${formData.budget}</span>
                  </div>
                  <Slider
                    value={[formData.budget]}
                    onValueChange={(value) => setFormData({ ...formData, budget: value[0] })}
                    min={50}
                    max={1000}
                    step={25}
                    className="py-4"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>$50</span>
                    <span>$500</span>
                    <span>$1,000</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Deadline (optional)
                  </Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="bg-background/50 border-border/50 focus:border-primary/50"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Creating...
                  </div>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Session
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSession;
