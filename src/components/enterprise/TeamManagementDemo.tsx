import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { TeamRole, MemberStatus } from '@/stores/enterpriseStore';
import { Loader2, Plus, Trash2, UserCog } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface TeamManagementDemoProps {
  accountId: string;
}

export function TeamManagementDemo({ accountId }: TeamManagementDemoProps) {
  const { teamMembers, inviteTeamMember, removeTeamMember, promoteTeamMember, disableTeamMember } = useTeamManagement(accountId);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<TeamRole>(TeamRole.Member);

  const handleInvite = async () => {
    if (!email || !name) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await inviteTeamMember({ email, name, role });
      toast({
        title: 'Team member invited',
        description: `Invitation sent to ${email}`,
      });
      setEmail('');
      setName('');
      setRole(TeamRole.Member);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to invite team member',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from the team?`)) return;

    try {
      await removeTeamMember(memberId);
      toast({
        title: 'Team member removed',
        description: `${memberName} has been removed from the team`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove team member',
        variant: 'destructive',
      });
    }
  };

  const handlePromote = async (memberId: string, memberName: string, newRole: TeamRole) => {
    try {
      await promoteTeamMember(memberId, newRole);
      toast({
        title: 'Role updated',
        description: `${memberName} is now a ${newRole}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update role',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: MemberStatus) => {
    const variants: Record<MemberStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      [MemberStatus.Active]: 'default',
      [MemberStatus.Pending]: 'secondary',
      [MemberStatus.Suspended]: 'destructive',
      [MemberStatus.Inactive]: 'outline',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Invite Team Member</CardTitle>
          <CardDescription>Add a new member to your team</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="member-name">Name</Label>
            <Input
              id="member-name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="member-email">Email</Label>
            <Input
              id="member-email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="member-role">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as TeamRole)}>
              <SelectTrigger id="member-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TeamRole.Member}>Member</SelectItem>
                <SelectItem value={TeamRole.Manager}>Manager</SelectItem>
                <SelectItem value={TeamRole.Admin}>Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleInvite} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Send Invitation
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Members ({teamMembers.length})</CardTitle>
          <CardDescription>Manage your team</CardDescription>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No team members yet</p>
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{member.name}</p>
                      {getStatusBadge(member.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    <p className="text-xs text-muted-foreground">Role: {member.role}</p>
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={member.role}
                      onValueChange={(v) => handlePromote(member.id, member.name, v as TeamRole)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TeamRole.Member}>Member</SelectItem>
                        <SelectItem value={TeamRole.Manager}>Manager</SelectItem>
                        <SelectItem value={TeamRole.Admin}>Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemove(member.id, member.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
