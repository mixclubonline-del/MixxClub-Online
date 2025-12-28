import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Check, Clock, AlertTriangle, User, Briefcase } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type DbPartnership = Database['public']['Tables']['partnerships']['Row'];
type DbCollaborativeProject = Database['public']['Tables']['collaborative_projects']['Row'];
type DbPartnershipHealth = Database['public']['Tables']['partnership_health']['Row'];

interface PartnershipListProps {
  partnerships: DbPartnership[];
  projects: DbCollaborativeProject[];
  healthScores: DbPartnershipHealth[];
  userType: 'artist' | 'engineer';
  onAcceptPartnership: (partnershipId: string) => Promise<boolean>;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Check }> = {
  active: { label: 'Active', color: 'bg-green-500', icon: Check },
  pending: { label: 'Pending', color: 'bg-yellow-500', icon: Clock },
  paused: { label: 'Paused', color: 'bg-gray-500', icon: AlertTriangle },
  ended: { label: 'Ended', color: 'bg-red-500', icon: AlertTriangle },
};

export const PartnershipList = ({
  partnerships,
  projects,
  healthScores,
  userType,
  onAcceptPartnership,
}: PartnershipListProps) => {
  const getHealthScore = (partnershipId: string) => {
    return healthScores.find((h) => h.partnership_id === partnershipId)?.health_score || 100;
  };

  const getProjectCount = (partnershipId: string) => {
    return projects.filter((p) => p.partnership_id === partnershipId).length;
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (partnerships.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Partnerships Yet</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Start collaborating with {userType === 'artist' ? 'engineers' : 'artists'} to track shared earnings and projects.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Your Partnerships
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {partnerships.map((partnership) => {
          const status = statusConfig[partnership.status || 'pending'] || statusConfig.pending;
          const StatusIcon = status.icon;
          const healthScore = getHealthScore(partnership.id);
          const projectCount = getProjectCount(partnership.id);
          const isPending = partnership.status === 'pending';

          return (
            <div
              key={partnership.id}
              className="p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-background/80 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">
                        Partnership #{partnership.id.slice(0, 8)}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {projectCount} project{projectCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Your Split</p>
                      <p className="font-medium text-foreground">
                        {userType === 'artist' 
                          ? `${partnership.artist_percentage || 50}%`
                          : `${partnership.engineer_percentage || 50}%`
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Revenue</p>
                      <p className="font-medium text-foreground">
                        ${(partnership.total_revenue || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Your Earnings</p>
                      <p className="font-medium text-green-500">
                        ${userType === 'artist' 
                          ? (partnership.artist_earnings || 0).toLocaleString()
                          : (partnership.engineer_earnings || 0).toLocaleString()
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Health Score</p>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${getHealthColor(healthScore)}`}>
                          {healthScore}%
                        </span>
                        <Progress value={healthScore} className="h-2 w-16" />
                      </div>
                    </div>
                  </div>
                </div>

                {isPending && (
                  <Button
                    size="sm"
                    onClick={() => onAcceptPartnership(partnership.id)}
                    className="shrink-0"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
