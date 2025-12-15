import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Award, Search, Trophy, Star, Users, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { DataTablePagination } from '@/components/ui/data-table-pagination';

export default function AdminAchievements() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch achievements with pagination
  const { data: achievementsData, isLoading, refetch } = useQuery({
    queryKey: ['admin-achievements', currentPage, pageSize, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('achievements')
        .select('*', { count: 'exact' })
        .order('earned_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,achievement_type.ilike.%${searchQuery}%`);
      }

      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;
      return { achievements: data || [], total: count || 0 };
    },
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['admin-achievements-stats'],
    queryFn: async () => {
      const { data: achievements } = await supabase
        .from('achievements')
        .select('achievement_type, user_id');
      
      const uniqueUsers = new Set(achievements?.map(a => a.user_id) || []).size;
      const typeBreakdown = achievements?.reduce((acc, a) => {
        acc[a.achievement_type] = (acc[a.achievement_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return {
        total: achievements?.length || 0,
        uniqueUsers,
        typeBreakdown,
        topType: Object.entries(typeBreakdown).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A',
      };
    },
  });

  const getBadgeVariant = (type: string) => {
    switch (type.toLowerCase()) {
      case 'streak': return 'default';
      case 'milestone': return 'secondary';
      case 'skill': return 'outline';
      default: return 'default';
    }
  };

  const totalPages = Math.ceil((achievementsData?.total || 0) / pageSize);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Achievements Management</h1>
            <p className="text-muted-foreground">
              View and manage user achievements and badges
            </p>
          </div>
          <Button onClick={() => refetch()}>Refresh</Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Achievements</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Users with Achievements</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.uniqueUsers || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Most Common Type</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{stats?.topType}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Achievement Types</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats?.typeBreakdown || {}).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Achievement Type Distribution</CardTitle>
            <CardDescription>Breakdown by achievement type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats?.typeBreakdown || {}).map(([type, count]) => (
                <Badge key={type} variant="secondary" className="text-sm">
                  {type}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements List */}
        <Card>
          <CardHeader>
            <CardTitle>All Achievements</CardTitle>
            <CardDescription>Browse and search all awarded achievements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title or type..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading achievements...</div>
            ) : achievementsData?.achievements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No achievements found
              </div>
            ) : (
              <div className="space-y-3">
                {achievementsData?.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                  >
                    <div className="p-2 rounded-full bg-primary/10">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{achievement.title}</span>
                        <Badge variant={getBadgeVariant(achievement.achievement_type)}>
                          {achievement.achievement_type}
                        </Badge>
                        {achievement.badge_type && (
                          <Badge variant="outline">{achievement.badge_type}</Badge>
                        )}
                      </div>
                      {achievement.description && (
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>User: {achievement.user_id.slice(0, 8)}...</span>
                        <span>Earned: {format(new Date(achievement.earned_at), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <DataTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={achievementsData?.total || 0}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
