import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Search, Shield, User as UserIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';

interface UserProfile {
  id: string;
  full_name: string | null;
  role: string;
  created_at: string;
  points: number;
  level: number;
}

export default function MobileAdminUsers() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      checkAdminStatus();
      fetchUsers();
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, users]);

  const checkAdminStatus = async () => {
    const { data, error } = await supabase.rpc('is_admin', { user_uuid: user?.id });
    if (error || !data) {
      navigate('/');
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setDataLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'client' | 'engineer' | 'admin') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User role updated successfully',
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/10 text-red-500';
      case 'engineer':
        return 'bg-blue-500/10 text-blue-500';
      default:
        return 'bg-green-500/10 text-green-500';
    }
  };

  if (loading || dataLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 bg-background border-b z-10 p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/mobile-admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">User Management</h1>
            <p className="text-xs text-muted-foreground">{filteredUsers.length} users</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="client">Clients</SelectItem>
              <SelectItem value="engineer">Engineers</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <UserIcon className="w-12 h-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground">No users found</p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((profile) => (
            <Card key={profile.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        profile.role === 'admin' ? 'bg-red-500/10' : 
                        profile.role === 'engineer' ? 'bg-blue-500/10' : 'bg-green-500/10'
                      }`}>
                        {profile.role === 'admin' ? (
                          <Shield className="w-5 h-5 text-red-500" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {profile.full_name || 'No name'}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          ID: {profile.id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                    <Badge className={getRoleBadgeColor(profile.role)}>
                      {profile.role}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Level {profile.level} • {profile.points} pts</span>
                    <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                  </div>

                  <Select
                    value={profile.role}
                    onValueChange={(value) => updateUserRole(profile.id, value as 'client' | 'engineer' | 'admin')}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="engineer">Engineer</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {isMobile && <MobileBottomNav />}
    </div>
  );
}
