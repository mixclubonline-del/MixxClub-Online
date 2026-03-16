/**
 * AdminUserDetail — Slide-over panel showing a user's full profile.
 * Aggregates projects, earnings, achievements, activity, and roles.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { User, Briefcase, DollarSign, Trophy, Activity, Shield, Star, Ban } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlassPanel, HubSkeleton } from '@/components/crm/design';

interface AdminUserDetailProps {
  userId: string | null;
  onClose: () => void;
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-500/20 text-red-400 border-red-500/30',
  engineer: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  artist: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  producer: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  fan: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
};

export const AdminUserDetail = ({ userId, onClose }: AdminUserDetailProps) => {
  const userDetail = useQuery({
    queryKey: ['admin-user-detail', userId],
    queryFn: async () => {
      if (!userId) return null;

      const [profileRes, rolesRes, projectsRes, earningsRes, achievementsRes, activityRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('user_roles').select('role').eq('user_id', userId),
        supabase.from('projects').select('id, title, status, created_at').or(`user_id.eq.${userId},engineer_id.eq.${userId}`).order('created_at', { ascending: false }).limit(20),
        supabase.from('engineer_earnings').select('*').eq('engineer_id', userId).order('created_at', { ascending: false }).limit(20),
        supabase.from('achievements').select('*').eq('user_id', userId).order('earned_at', { ascending: false }).limit(20),
        supabase.from('activity_feed').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
      ]);

      return {
        profile: profileRes.data,
        roles: (rolesRes.data || []).map((r: any) => r.role),
        projects: projectsRes.data || [],
        earnings: earningsRes.data || [],
        achievements: achievementsRes.data || [],
        activity: activityRes.data || [],
        totalEarnings: (earningsRes.data || []).reduce((sum: number, e: any) => sum + (e.total_amount || e.amount || 0), 0),
      };
    },
    enabled: !!userId,
  });

  const d = userDetail.data;

  return (
    <Sheet open={!!userId} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent className="sm:max-w-xl overflow-y-auto bg-background/95 backdrop-blur-xl border-border/50">
        {userDetail.isLoading ? (
          <div className="mt-8"><HubSkeleton variant="list" count={4} /></div>
        ) : d?.profile ? (
          <>
            <SheetHeader>
              <SheetTitle className="text-foreground sr-only">User Detail</SheetTitle>
            </SheetHeader>

            {/* Profile Header */}
            <div className="flex items-center gap-4 mt-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary shrink-0">
                {d.profile.full_name?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-foreground truncate">{d.profile.full_name || 'Unnamed User'}</h2>
                <p className="text-sm text-muted-foreground">{d.profile.email}</p>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {d.roles.map((role: string) => (
                    <Badge key={role} variant="outline" className={`text-[10px] capitalize ${ROLE_COLORS[role] || ''}`}>
                      {role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Suspension Banner */}
            {d.profile.is_suspended && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 mb-6 flex items-start gap-2">
                <Ban className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-destructive">Account Suspended</p>
                  {d.profile.suspension_reason && (
                    <p className="text-xs text-muted-foreground mt-0.5">{d.profile.suspension_reason}</p>
                  )}
                  {d.profile.suspended_at && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Since {format(new Date(d.profile.suspended_at), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <GlassPanel padding="p-3" className="text-center">
                <div className="text-lg font-bold text-foreground">{d.profile.level || 1}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Level</div>
              </GlassPanel>
              <GlassPanel padding="p-3" className="text-center">
                <div className="text-lg font-bold text-foreground">{d.profile.points || 0}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">XP</div>
              </GlassPanel>
              <GlassPanel padding="p-3" className="text-center">
                <div className="text-lg font-bold text-foreground">${d.totalEarnings.toFixed(0)}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Earned</div>
              </GlassPanel>
            </div>

            {/* Meta */}
            <GlassPanel padding="p-3" className="mb-6">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Joined:</span> <span className="text-foreground">{format(new Date(d.profile.created_at), 'MMM d, yyyy')}</span></div>
                <div><span className="text-muted-foreground">Followers:</span> <span className="text-foreground">{d.profile.follower_count || 0}</span></div>
                <div><span className="text-muted-foreground">Following:</span> <span className="text-foreground">{d.profile.following_count || 0}</span></div>
                <div><span className="text-muted-foreground">Genre:</span> <span className="text-foreground">{d.profile.genre || '—'}</span></div>
              </div>
            </GlassPanel>

            {/* Tabbed Sections */}
            <Tabs defaultValue="projects" className="w-full">
              <TabsList className="w-full bg-muted/30">
                <TabsTrigger value="projects" className="flex-1 text-xs">Projects</TabsTrigger>
                <TabsTrigger value="earnings" className="flex-1 text-xs">Earnings</TabsTrigger>
                <TabsTrigger value="achievements" className="flex-1 text-xs">Badges</TabsTrigger>
                <TabsTrigger value="activity" className="flex-1 text-xs">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="projects" className="mt-3 space-y-2">
                {d.projects.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No projects yet</p>
                ) : d.projects.map((p: any) => (
                  <GlassPanel key={p.id} padding="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{p.title || 'Untitled'}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(p.created_at), 'MMM d, yyyy')}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] capitalize">{p.status || 'draft'}</Badge>
                    </div>
                  </GlassPanel>
                ))}
              </TabsContent>

              <TabsContent value="earnings" className="mt-3 space-y-2">
                {d.earnings.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No earnings recorded</p>
                ) : d.earnings.map((e: any) => (
                  <GlassPanel key={e.id} padding="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">${(e.total_amount || e.amount || 0).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(e.created_at), 'MMM d, yyyy')}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] capitalize">{e.status || 'pending'}</Badge>
                    </div>
                  </GlassPanel>
                ))}
              </TabsContent>

              <TabsContent value="achievements" className="mt-3 space-y-2">
                {d.achievements.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No achievements yet</p>
                ) : d.achievements.map((a: any) => (
                  <GlassPanel key={a.id} padding="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{a.title}</p>
                        <p className="text-xs text-muted-foreground">{a.description || a.badge_name || ''}</p>
                      </div>
                    </div>
                  </GlassPanel>
                ))}
              </TabsContent>

              <TabsContent value="activity" className="mt-3 space-y-2">
                {d.activity.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No activity recorded</p>
                ) : d.activity.map((a: any) => (
                  <GlassPanel key={a.id} padding="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{a.title}</p>
                        <p className="text-xs text-muted-foreground">{a.description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{format(new Date(a.created_at), 'MMM d')}</span>
                    </div>
                  </GlassPanel>
                ))}
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">User not found</div>
        )}
      </SheetContent>
    </Sheet>
  );
};
