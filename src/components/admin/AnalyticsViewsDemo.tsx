import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  useUserActivitySummary, 
  useProjectAnalytics, 
  useRevenueSummary,
  useEngineerPerformance 
} from '@/hooks/useAnalyticsViews';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, FolderKanban, DollarSign, Award } from 'lucide-react';

export function AnalyticsViewsDemo() {
  const { data: userActivity, isLoading: loadingUsers } = useUserActivitySummary();
  const { data: projectAnalytics, isLoading: loadingProjects } = useProjectAnalytics();
  const { data: revenue, isLoading: loadingRevenue } = useRevenueSummary();
  const { data: engineers, isLoading: loadingEngineers } = useEngineerPerformance();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Analytics Views</h2>
        <p className="text-muted-foreground">
          Pre-computed analytics views for fast reporting and insights
        </p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            User Activity
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="engineers" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Engineers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">User Activity Summary</h3>
            {loadingUsers ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">User</th>
                      <th className="text-right py-2 px-4">As Client</th>
                      <th className="text-right py-2 px-4">As Engineer</th>
                      <th className="text-right py-2 px-4">Files</th>
                      <th className="text-right py-2 px-4">Member Since</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userActivity?.slice(0, 10).map((user) => (
                      <tr key={user.user_id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-4">{user.full_name || user.email}</td>
                        <td className="py-2 px-4 text-right">{user.projects_as_client}</td>
                        <td className="py-2 px-4 text-right">{user.projects_as_engineer}</td>
                        <td className="py-2 px-4 text-right">{user.audio_files_uploaded}</td>
                        <td className="py-2 px-4 text-right text-sm text-muted-foreground">
                          {new Date(user.user_since).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Project Analytics</h3>
            {loadingProjects ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Project</th>
                      <th className="text-center py-2 px-4">Status</th>
                      <th className="text-right py-2 px-4">Files</th>
                      <th className="text-right py-2 px-4">Duration</th>
                      <th className="text-right py-2 px-4">Storage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectAnalytics?.slice(0, 10).map((project) => (
                      <tr key={project.project_id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-4">{project.title}</td>
                        <td className="py-2 px-4 text-center">
                          <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                            {project.status}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-right">{project.total_files}</td>
                        <td className="py-2 px-4 text-right">
                          {project.project_duration_days.toFixed(1)} days
                        </td>
                        <td className="py-2 px-4 text-right">
                          {(project.total_storage_bytes / 1024 / 1024).toFixed(1)} MB
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue Summary (Last 12 Months)</h3>
            {loadingRevenue ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Month</th>
                      <th className="text-right py-2 px-4">Transactions</th>
                      <th className="text-right py-2 px-4">Completed</th>
                      <th className="text-right py-2 px-4">Pending</th>
                      <th className="text-right py-2 px-4">Avg Value</th>
                      <th className="text-right py-2 px-4">Customers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenue?.map((month) => (
                      <tr key={month.month} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-4">
                          {new Date(month.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-2 px-4 text-right">{month.total_transactions}</td>
                        <td className="py-2 px-4 text-right text-green-600 font-medium">
                          ${month.completed_revenue?.toFixed(2) || '0.00'}
                        </td>
                        <td className="py-2 px-4 text-right text-orange-600">
                          ${month.pending_revenue?.toFixed(2) || '0.00'}
                        </td>
                        <td className="py-2 px-4 text-right">
                          ${month.avg_transaction_value?.toFixed(2) || '0.00'}
                        </td>
                        <td className="py-2 px-4 text-right">{month.unique_customers}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="engineers" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Engineer Performance</h3>
            {loadingEngineers ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Engineer</th>
                      <th className="text-right py-2 px-4">Rating</th>
                      <th className="text-right py-2 px-4">Reviews</th>
                      <th className="text-right py-2 px-4">Completed</th>
                      <th className="text-right py-2 px-4">Active</th>
                      <th className="text-right py-2 px-4">Avg Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {engineers?.slice(0, 10).map((engineer) => (
                      <tr key={engineer.engineer_id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-4">{engineer.engineer_name}</td>
                        <td className="py-2 px-4 text-right">
                          <span className="font-medium text-yellow-600">
                            ⭐ {engineer.rating_average?.toFixed(1) || 'N/A'}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-right">{engineer.total_reviews}</td>
                        <td className="py-2 px-4 text-right">{engineer.total_projects_completed}</td>
                        <td className="py-2 px-4 text-right">{engineer.active_projects}</td>
                        <td className="py-2 px-4 text-right">
                          {engineer.avg_project_duration_days?.toFixed(1) || '0'} days
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
