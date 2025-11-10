import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Loader2 } from "lucide-react";

interface InviteEngineerDialogProps {
  sessionId: string;
  sessionName: string;
}

export const InviteEngineerDialog = ({ sessionId, sessionName }: InviteEngineerDialogProps) => {
  const [open, setOpen] = useState(false);
  const [engineerEmail, setEngineerEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInvite = async () => {
    if (!engineerEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter the engineer's email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Find engineer by email (query auth.users via RPC or profiles)
      // First get user from auth by email
      const { data: users, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) throw userError;
      
      const engineerUser = users.users.find(
        u => u.email?.toLowerCase() === engineerEmail.toLowerCase().trim()
      );

      if (!engineerUser) {
        toast({
          title: "Engineer not found",
          description: "No engineer found with that email address",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Get profile
      const { data: engineerProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", engineerUser.id)
        .single();

      if (profileError || !engineerProfile) {
        toast({
          title: "Engineer not found",
          description: "No engineer found with that email address",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Check if engineer has the engineer role
      const { data: engineerRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", engineerProfile.id)
        .eq("role", "engineer")
        .maybeSingle();

      if (!engineerRole) {
        toast({
          title: "Invalid user",
          description: "This user is not registered as an engineer",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Create invitation
      const { data: invitation, error: inviteError } = await supabase
        .from("session_invitations")
        .insert({
          session_id: sessionId,
          artist_id: user.id,
          engineer_id: engineerProfile.id,
          message: message.trim() || null,
        })
        .select()
        .single();

      if (inviteError) {
        if (inviteError.code === '23505') {
          toast({
            title: "Already invited",
            description: "This engineer has already been invited to this session",
            variant: "destructive",
          });
        } else {
          throw inviteError;
        }
        setLoading(false);
        return;
      }

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke("send-session-invitation", {
        body: { invitationId: invitation.id },
      });

      if (emailError) {
        console.error("Error sending email:", emailError);
        // Don't fail the invitation if email fails
      }

      toast({
        title: "Invitation sent!",
        description: `${engineerEmail} has been invited to collaborate on ${sessionName}`,
      });

      setOpen(false);
      setEngineerEmail("");
      setMessage("");
    } catch (error: any) {
      console.error("Error sending invitation:", error);
      toast({
        title: "Failed to send invitation",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Engineer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite Engineer to Collaborate</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="session">Session</Label>
            <Input id="session" value={sessionName} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Engineer's Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="engineer@example.com"
              value={engineerEmail}
              onChange={(e) => setEngineerEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Personal Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message to your invitation..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Send Invitation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};