import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { 
  Flag, Users, Clock, Target, 
  TrendingUp, CheckCircle, AlertCircle
} from "lucide-react";

interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetAudience: 'all' | 'beta' | 'premium' | 'specific';
  environment: 'production' | 'staging' | 'development';
  lastModified: string;
  modifiedBy: string;
  usageCount: number;
}

const featureFlags: FeatureFlag[] = [
  {
    id: '1',
    name: 'AI Mastering',
    key: 'ai_mastering_enabled',
    description: 'Enable AI-powered mastering features',
    enabled: true,
    rolloutPercentage: 100,
    targetAudience: 'all',
    environment: 'production',
    lastModified: '2 hours ago',
    modifiedBy: 'John Smith',
    usageCount: 1234
  },
  {
    id: '2',
    name: 'New Dashboard UI',
    key: 'new_dashboard_ui',
    description: 'Roll out redesigned dashboard interface',
    enabled: true,
    rolloutPercentage: 50,
    targetAudience: 'beta',
    environment: 'production',
    lastModified: '1 day ago',
    modifiedBy: 'Sarah Johnson',
    usageCount: 456
  },
  {
    id: '3',
    name: 'Advanced Analytics',
    key: 'advanced_analytics',
    description: 'Enable advanced analytics features',
    enabled: true,
    rolloutPercentage: 100,
    targetAudience: 'premium',
    environment: 'production',
    lastModified: '3 days ago',
    modifiedBy: 'Mike Davis',
    usageCount: 234
  },
  {
    id: '4',
    name: 'Real-time Collaboration',
    key: 'realtime_collab',
    description: 'Live collaboration features for projects',
    enabled: false,
    rolloutPercentage: 0,
    targetAudience: 'all',
    environment: 'staging',
    lastModified: '5 days ago',
    modifiedBy: 'Tech Team',
    usageCount: 0
  },
  {
    id: '5',
    name: 'Enhanced File Upload',
    key: 'enhanced_file_upload',
    description: 'New drag-and-drop file upload system',
    enabled: true,
    rolloutPercentage: 75,
    targetAudience: 'all',
    environment: 'production',
    lastModified: '1 week ago',
    modifiedBy: 'Admin Team',
    usageCount: 892
  },
  {
    id: '6',
    name: 'Mobile App Beta',
    key: 'mobile_app_beta',
    description: 'Progressive Web App features',
    enabled: true,
    rolloutPercentage: 25,
    targetAudience: 'beta',
    environment: 'production',
    lastModified: '2 weeks ago',
    modifiedBy: 'John Smith',
    usageCount: 167
  }
];

export function FeatureFlagsManager() {
  const getAudienceBadge = (audience: FeatureFlag['targetAudience']) => {
    const config: Record<string, { variant: any; icon: any; label: string }> = {
      all: { variant: 'default', icon: Users, label: 'All Users' },
      beta: { variant: 'secondary', icon: Target, label: 'Beta Testers' },
      premium: { variant: 'outline', icon: TrendingUp, label: 'Premium' },
      specific: { variant: 'outline', icon: Users, label: 'Specific Users' }
    };
    
    const { variant, icon: Icon, label } = config[audience];
    return (
      <Badge variant={variant} className="gap-1 text-xs">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getEnvironmentBadge = (env: FeatureFlag['environment']) => {
    const colors: Record<string, string> = {
      production: 'bg-green-500',
      staging: 'bg-yellow-500',
      development: 'bg-blue-500'
    };
    
    return (
      <Badge variant="outline" className="gap-1 text-xs">
        <div className={`w-2 h-2 rounded-full ${colors[env]}`} />
        {env}
      </Badge>
    );
  };

  const enabledCount = featureFlags.filter(f => f.enabled).length;
  const totalUsage = featureFlags.reduce((sum, f) => sum + f.usageCount, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Feature Flags Manager
            </CardTitle>
            <CardDescription>Control feature availability and rollout dynamically</CardDescription>
          </div>
          <Button>
            <Flag className="h-4 w-4 mr-2" />
            New Feature Flag
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Flag className="h-4 w-4 text-blue-500" />
              <div className="text-sm text-muted-foreground">Total Flags</div>
            </div>
            <div className="text-2xl font-bold">{featureFlags.length}</div>
          </div>

          <div className="p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div className="text-sm text-muted-foreground">Enabled</div>
            </div>
            <div className="text-2xl font-bold">{enabledCount}</div>
          </div>

          <div className="p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <div className="text-sm text-muted-foreground">In Rollout</div>
            </div>
            <div className="text-2xl font-bold">
              {featureFlags.filter(f => f.rolloutPercentage < 100 && f.rolloutPercentage > 0).length}
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-purple-500" />
              <div className="text-sm text-muted-foreground">Total Usage</div>
            </div>
            <div className="text-2xl font-bold">{totalUsage.toLocaleString()}</div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-4">
          <Input placeholder="Search feature flags..." className="flex-1" />
          <Button variant="outline" size="sm">Filter</Button>
        </div>

        {/* Feature Flags List */}
        <div className="space-y-3">
          {featureFlags.map((flag) => (
            <div
              key={flag.id}
              className="p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Switch checked={flag.enabled} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{flag.name}</h3>
                        {getAudienceBadge(flag.targetAudience)}
                        {getEnvironmentBadge(flag.environment)}
                      </div>
                      <p className="text-sm text-muted-foreground">{flag.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Key: <code className="px-1 py-0.5 rounded bg-muted">{flag.key}</code></span>
                        <span>•</span>
                        <span>{flag.usageCount.toLocaleString()} uses</span>
                        <span>•</span>
                        <span>Modified {flag.lastModified} by {flag.modifiedBy}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rollout Percentage */}
                  {flag.enabled && (
                    <div className="space-y-2 pl-11">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Rollout Progress</span>
                        <span className="font-medium">{flag.rolloutPercentage}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={flag.rolloutPercentage}
                          className="flex-1"
                        />
                        <Input 
                          type="number" 
                          min="0" 
                          max="100" 
                          value={flag.rolloutPercentage}
                          className="w-20"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
