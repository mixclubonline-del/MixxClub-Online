import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Flag, Plus, Trash2 } from 'lucide-react';
import { FEATURE_FLAGS } from '@/config/featureFlags';

export default function AdminFeatures() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      checkAdminStatus();
      loadFeatureFlags();
    }
  }, [user, loading, navigate]);

  const checkAdminStatus = async () => {
    const { data, error } = await supabase.rpc('is_admin', { user_uuid: user?.id });
    if (error || !data) {
      navigate('/');
    }
  };

  const loadFeatureFlags = () => {
    // Load from config file
    setFlags({ ...FEATURE_FLAGS });
    setDataLoading(false);
  };

  const handleToggle = (flagKey: string, value: boolean) => {
    setFlags((prev) => ({ ...prev, [flagKey]: value }));
    toast.success(`Feature flag '${flagKey}' ${value ? 'enabled' : 'disabled'}`);
    toast.info('Note: Changes to feature flags require code deployment to take effect');
  };

  const getFeatureDescription = (key: string): string => {
    const descriptions: Record<string, string> = {
      THE_LAB_ENABLED: 'Enable/disable the AI Hybrid DAW Studio feature for all users',
      TIER_1_BATTLES_STUDIOS: 'Mix Battles Arena with AI Matching Engine (100 users milestone)',
      EDUCATION_HUB_ENABLED: 'Educational Content Hub - Video tutorials, courses, certifications (250 users)',
      COLLABORATION_V2_ENABLED: 'Advanced Collaboration 2.0 - Voice commands, live AI suggestions (250 users)',
      MARKETPLACE_ENABLED: 'Community Marketplace - Sample libraries, presets, templates (500 users)',
      LABEL_SERVICES_ENABLED: 'Label Services Integration (500 users)',
      INTEGRATIONS_ENABLED: 'API & Integration Framework - DAW plugins, streaming platforms (1000 users)',
      AI_AUDIO_INTELLIGENCE_ENABLED: 'Advanced AI Audio Intelligence (1000 users)',
      DISTRIBUTION_WHITE_LABEL_ENABLED: 'White-Label Distribution Infrastructure (Phase 2)',
      DISTRIBUTION_ANALYTICS_ENABLED: 'Enhanced Analytics & Reporting Dashboard (Phase 3)',
      DISTRIBUTION_PLAYLIST_PITCHING_ENABLED: 'Playlist Pitching & Submission Tools (Phase 3)',
      DISTRIBUTION_REVENUE_SHARING_ENABLED: 'Revenue Sharing & Commission System (Phase 4)',
    };
    return descriptions[key] || 'No description available';
  };

  if (loading || dataLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Feature Flags Management</h1>
          <p className="text-muted-foreground">
            Control which features are visible and accessible to users
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Current Feature Flags
            </CardTitle>
            <CardDescription>
              Toggle features on/off across the platform
              <br />
              <span className="text-orange-500 text-sm">
                ⚠️ Note: Changes require updating featureFlags.ts and code deployment
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(flags).map(([key, value]) => (
              <div key={key} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor={key} className="text-base font-medium">
                    {key.replace(/_/g, ' ')}
                  </Label>
                  <p className="text-sm text-muted-foreground">{getFeatureDescription(key)}</p>
                </div>
                <Switch
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) => handleToggle(key, checked)}
                />
              </div>
            ))}

            {Object.keys(flags).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Flag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No feature flags configured yet</p>
                <p className="text-sm mt-2">Add feature flags in src/config/featureFlags.ts</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How to Add New Feature Flags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-2">
              <p className="font-medium">1. Edit the feature flags configuration file:</p>
              <code className="block bg-muted p-3 rounded">
                src/config/featureFlags.ts
              </code>
            </div>
            <div className="space-y-2">
              <p className="font-medium">2. Add your new feature flag:</p>
              <code className="block bg-muted p-3 rounded whitespace-pre">
                {`export const FEATURE_FLAGS = {
  THE_LAB_ENABLED: false,
  YOUR_NEW_FEATURE: true, // Add new flags here
} as const;`}
              </code>
            </div>
            <div className="space-y-2">
              <p className="font-medium">3. Use the flag in your components:</p>
              <code className="block bg-muted p-3 rounded whitespace-pre">
                {`import { isFeatureEnabled } from '@/config/featureFlags';

{isFeatureEnabled('YOUR_NEW_FEATURE') && (
  <YourComponent />
)}`}
              </code>
            </div>
            <div className="mt-4 p-3 bg-blue-500/10 rounded border border-blue-500/20">
              <p className="text-blue-500 text-sm">
                💡 Tip: Use feature flags to safely test new features with select users before full
                release
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
