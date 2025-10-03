import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Users, DollarSign, Settings, Shield, BarChart3, 
  Megaphone, Headphones, Plug, UserCog, Zap, MessageCircle, FileText, Activity,
  Database, Building2, GitBranch, FolderLock
} from "lucide-react";

const quickActions = [
  {
    icon: Users,
    label: 'User Management',
    description: 'View and manage users',
    path: '/admin/users',
    color: 'bg-blue-500'
  },
  {
    icon: DollarSign,
    label: 'Revenue Dashboard',
    description: 'Track subscriptions & payouts',
    path: '/admin/revenue',
    color: 'bg-green-500'
  },
  {
    icon: BarChart3,
    label: 'Data & Reports',
    description: 'Export data and analytics',
    path: '/admin/data-reporting',
    color: 'bg-purple-500'
  },
  {
    icon: Shield,
    label: 'Security Center',
    description: 'Monitor security events',
    path: '/admin-security',
    color: 'bg-red-500'
  },
  {
    icon: Headphones,
    label: 'Customer Success',
    description: 'Support & feedback',
    path: '/admin/customer-success',
    color: 'bg-cyan-500'
  },
  {
    icon: Megaphone,
    label: 'Marketing',
    description: 'Campaigns & growth',
    path: '/admin/marketing',
    color: 'bg-indigo-500'
  },
  {
    icon: Plug,
    label: 'Integrations',
    description: 'API keys & webhooks',
    path: '/admin/integration-automation',
    color: 'bg-emerald-500'
  },
  {
    icon: UserCog,
    label: 'Team Management',
    description: 'Admin team & roles',
    path: '/admin/team-management',
    color: 'bg-blue-500'
  },
  {
    icon: Zap,
    label: 'Launch Readiness',
    description: 'System health check',
    path: '/admin/launch-readiness',
    color: 'bg-yellow-500'
  },
  {
    icon: BarChart3,
    label: 'Advanced Analytics',
    description: 'Deep insights & KPIs',
    path: '/admin/advanced-analytics',
    color: 'bg-teal-500'
  },
  {
    icon: MessageCircle,
    label: 'Communications',
    description: 'Email & notifications',
    path: '/admin/communications',
    color: 'bg-pink-500'
  },
  {
    icon: FileText,
    label: 'Content Management',
    description: 'CMS & media library',
    path: '/admin/content-management',
    color: 'bg-indigo-500'
  },
  {
    icon: Settings,
    label: 'Configuration',
    description: 'Feature flags & settings',
    path: '/admin/configuration',
    color: 'bg-gray-500'
  },
  {
    icon: Activity,
    label: 'System Monitoring',
    description: 'Performance & health tracking',
    path: '/admin/monitoring',
    color: 'bg-teal-500'
  },
  {
    icon: FolderLock,
    label: 'Audit & Compliance',
    description: 'Audit logs & GDPR compliance',
    path: '/admin/audit-compliance',
    color: 'bg-purple-500'
  },
  {
    icon: Database,
    label: 'Backup & Recovery',
    description: 'Database backups & DR',
    path: '/admin/backup-recovery',
    color: 'bg-orange-500'
  },
  {
    icon: GitBranch,
    label: 'Automation Hub',
    description: 'Workflows & task automation',
    path: '/admin/automation',
    color: 'bg-violet-500'
  },
  {
    icon: Building2,
    label: 'Multi-Tenancy',
    description: 'Tenant & white-label config',
    path: '/admin/multi-tenancy',
    color: 'bg-slate-500'
  }
];

export function QuickActionsPanel() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Fast access to admin tools and dashboards</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.path}
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => navigate(action.path)}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-sm">{action.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {action.description}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
