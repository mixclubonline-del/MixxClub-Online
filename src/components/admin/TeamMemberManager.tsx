import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Mail, Shield, Crown, User, MoreVertical } from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'moderator' | 'viewer';
  avatar?: string;
  status: 'active' | 'invited' | 'suspended';
  lastActive: string;
  joinedDate: string;
}

const demoTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@mixclub.com',
    role: 'owner',
    avatar: undefined,
    status: 'active',
    lastActive: '2 minutes ago',
    joinedDate: '2024-01-01'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@mixclub.com',
    role: 'admin',
    avatar: undefined,
    status: 'active',
    lastActive: '1 hour ago',
    joinedDate: '2024-01-15'
  },
  {
    id: '3',
    name: 'Mike Davis',
    email: 'mike@mixclub.com',
    role: 'moderator',
    avatar: undefined,
    status: 'active',
    lastActive: '3 hours ago',
    joinedDate: '2024-02-01'
  },
  {
    id: '4',
    name: 'Emily Brown',
    email: 'emily@mixclub.com',
    role: 'viewer',
    avatar: undefined,
    status: 'invited',
    lastActive: 'Never',
    joinedDate: '2024-03-15'
  },
];

export function TeamMemberManager() {
  const [members, setMembers] = useState(demoTeamMembers);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'moderator' | 'viewer'>('viewer');

  const inviteMember = () => {
    if (!newMemberEmail) {
      toast.error('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newMemberEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    toast.success(`Invitation sent to ${newMemberEmail}`);
    setNewMemberEmail('');
  };

  const getRoleIcon = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'moderator':
        return <User className="h-4 w-4 text-green-500" />;
      case 'viewer':
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeVariant = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'default';
      case 'moderator':
        return 'secondary';
      case 'viewer':
        return 'outline';
    }
  };

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'invited':
        return 'bg-yellow-500';
      case 'suspended':
        return 'bg-red-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Team Member
          </CardTitle>
          <CardDescription>Add new administrators to help manage the platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                placeholder="colleague@example.com"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={newMemberRole} onValueChange={(val: any) => setNewMemberRole(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={inviteMember} className="w-full gap-2">
            <Mail className="h-4 w-4" />
            Send Invitation
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Members ({members.length})</CardTitle>
          <CardDescription>Manage your admin team and their roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{member.name}</h4>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(member.status)}`} />
                    </div>
                    <div className="text-sm text-muted-foreground">{member.email}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Last active {member.lastActive} • Joined {member.joinedDate}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={getRoleBadgeVariant(member.role)} className="gap-1">
                    {getRoleIcon(member.role)}
                    {member.role}
                  </Badge>
                  
                  {member.role !== 'owner' && (
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
