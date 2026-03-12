import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronLeft, ChevronRight, UserPlus, Shield, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { AdminUserDetail } from './AdminUserDetail';

const ROLES = ['artist', 'engineer', 'producer', 'fan', 'admin'] as const;
const PAGE_SIZE = 20;

export const AdminUsersHub = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [userRolesMap, setUserRolesMap] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data, count, error } = await query;
      if (error) throw error;

      setUsers(data || []);
      setTotalCount(count || 0);

      // Fetch roles for all users on this page
      const userIds = data?.map((u) => u.id) || [];
      if (userIds.length > 0) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', userIds);

        const rolesMap: Record<string, string[]> = {};
        roles?.forEach((r) => {
          if (!rolesMap[r.user_id]) rolesMap[r.user_id] = [];
          rolesMap[r.user_id].push(r.role);
        });
        setUserRolesMap(rolesMap);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: role as any });

      if (error) {
        if (error.code === '23505') {
          toast.info('User already has this role');
        } else {
          throw error;
        }
        return;
      }

      toast.success(`Role "${role}" assigned`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to assign role:', error);
      toast.error('Failed to assign role');
    }
  };

  const handleRemoveRole = async (userId: string, role: string) => {
    if (role === 'admin') {
      toast.error('Cannot remove admin role from this interface');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role as any);

      if (error) throw error;
      toast.success(`Role "${role}" removed`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to remove role:', error);
      toast.error('Failed to remove role');
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const ROLE_COLORS: Record<string, string> = {
    admin: 'bg-red-500/20 text-red-400 border-red-500/30',
    engineer: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    artist: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    producer: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    fan: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Search & Pagination Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-9 bg-background/50"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{totalCount} users</span>
          <Button variant="ghost" size="icon" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span>{page + 1} / {totalPages || 1}</span>
          <Button variant="ghost" size="icon" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => {
            const roles = userRolesMap[user.id] || [];
            return (
              <Card key={user.id} className="bg-background/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedUserId(user.id)}>
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                        {user.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-foreground hover:text-primary transition-colors">{user.full_name || 'Unnamed User'}</p>
                        <p className="text-xs text-muted-foreground">{user.email || user.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined {format(new Date(user.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setSelectedUserId(user.id)}
                        title="View user details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {roles.map((role) => (
                        <Badge
                          key={role}
                          variant="outline"
                          className={`capitalize cursor-pointer hover:opacity-70 ${ROLE_COLORS[role] || ''}`}
                          onClick={() => handleRemoveRole(user.id, role)}
                          title={role === 'admin' ? 'Cannot remove admin role here' : `Click to remove ${role}`}
                        >
                          {role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                          {role}
                        </Badge>
                      ))}

                      <Select onValueChange={(val) => handleAssignRole(user.id, val)}>
                        <SelectTrigger className="w-auto h-7 text-xs bg-background/50 border-dashed">
                          <UserPlus className="w-3 h-3 mr-1" />
                          <SelectValue placeholder="Add role" />
                        </SelectTrigger>
        <SelectContent>
                          {ROLES.filter((r) => !roles.includes(r as string)).map((r) => (
                            <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* User Detail Slide-Over */}
      <AdminUserDetail userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
    </div>
  );
};
