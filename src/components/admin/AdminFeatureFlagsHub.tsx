import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ToggleLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const AdminFeatureFlagsHub = () => {
  const { flags, isLoading, toggleFlag } = useFeatureFlags();

  const handleToggle = (key: string, currentEnabled: boolean) => {
    toggleFlag.mutate(
      { key, enabled: !currentEnabled },
      {
        onSuccess: () => {
          toast.success(`${key} ${!currentEnabled ? 'enabled' : 'disabled'}`);
        },
        onError: () => {
          toast.error('Failed to update flag');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Group flags by category prefix
  const groups: Record<string, typeof flags> = {};
  flags.forEach((flag) => {
    let category = 'General';
    if (flag.key.startsWith('DISTRIBUTION_')) category = 'Distribution';
    else if (flag.key.includes('COLLABORATION') || flag.key.includes('REMOTE')) category = 'Collaboration';
    else if (flag.key.includes('AI_') || flag.key.includes('SESSION_PREP')) category = 'AI & Intelligence';
    else if (flag.key.includes('MARKETPLACE') || flag.key.includes('LABEL') || flag.key.includes('INTEGRATIONS')) category = 'Marketplace & Integrations';
    else if (flag.key.includes('EDUCATION') || flag.key.includes('LAB') || flag.key.includes('BATTLES')) category = 'Features';

    if (!groups[category]) groups[category] = [];
    groups[category].push(flag);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <ToggleLeft className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Feature Flags</h2>
          <p className="text-sm text-muted-foreground">
            Toggle features on/off in real-time — no deploy required
          </p>
        </div>
      </div>

      {Object.entries(groups).map(([category, categoryFlags]) => (
        <Card key={category} className="bg-background/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{category}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {categoryFlags.map((flag) => (
              <div
                key={flag.key}
                className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-muted/20 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground font-mono">{flag.key}</p>
                    <Badge
                      variant="outline"
                      className={flag.enabled
                        ? 'bg-green-500/10 text-green-400 border-green-500/30 text-[10px]'
                        : 'bg-muted text-muted-foreground text-[10px]'
                      }
                    >
                      {flag.enabled ? 'ON' : 'OFF'}
                    </Badge>
                  </div>
                  {flag.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{flag.description}</p>
                  )}
                </div>
                <Switch
                  checked={flag.enabled}
                  onCheckedChange={() => handleToggle(flag.key, flag.enabled)}
                  disabled={toggleFlag.isPending}
                  aria-label={`Toggle ${flag.key}`}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
