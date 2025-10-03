import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Beaker, Play, Pause, CheckCircle, TrendingUp, 
  Users, Target, BarChart
} from "lucide-react";

interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'completed' | 'draft' | 'paused';
  variants: Variant[];
  startedAt?: string;
  duration: string;
  participants: number;
  targetParticipants: number;
  metric: string;
  winner?: string;
}

interface Variant {
  id: string;
  name: string;
  traffic: number;
  conversions: number;
  conversionRate: number;
  participants: number;
}

const abTests: ABTest[] = [
  {
    id: '1',
    name: 'New Checkout Flow',
    description: 'Testing simplified checkout process',
    status: 'running',
    variants: [
      { id: 'a', name: 'Control (Current)', traffic: 50, conversions: 234, conversionRate: 3.9, participants: 6000 },
      { id: 'b', name: 'Variant B (Simplified)', traffic: 50, conversions: 312, conversionRate: 5.2, participants: 6000 }
    ],
    startedAt: '5 days ago',
    duration: '14 days',
    participants: 12000,
    targetParticipants: 20000,
    metric: 'Conversion Rate'
  },
  {
    id: '2',
    name: 'Pricing Page Layout',
    description: 'Testing different pricing tier presentations',
    status: 'running',
    variants: [
      { id: 'a', name: 'Control (3 columns)', traffic: 33, conversions: 156, conversionRate: 4.1, participants: 3800 },
      { id: 'b', name: 'Variant B (4 columns)', traffic: 33, conversions: 142, conversionRate: 3.7, participants: 3835 },
      { id: 'c', name: 'Variant C (Stacked)', traffic: 34, conversions: 178, conversionRate: 4.6, participants: 3865 }
    ],
    startedAt: '3 days ago',
    duration: '10 days',
    participants: 11500,
    targetParticipants: 15000,
    metric: 'Sign-ups'
  },
  {
    id: '3',
    name: 'Dashboard Onboarding',
    description: 'Testing onboarding tour effectiveness',
    status: 'completed',
    variants: [
      { id: 'a', name: 'Control (No tour)', traffic: 50, conversions: 445, conversionRate: 22.3, participants: 2000 },
      { id: 'b', name: 'Variant B (With tour)', traffic: 50, conversions: 634, conversionRate: 31.7, participants: 2000 }
    ],
    startedAt: '2 weeks ago',
    duration: '7 days',
    participants: 4000,
    targetParticipants: 4000,
    metric: 'Feature Adoption',
    winner: 'b'
  },
  {
    id: '4',
    name: 'Email Subject Lines',
    description: 'Testing different newsletter subject lines',
    status: 'paused',
    variants: [
      { id: 'a', name: 'Control', traffic: 50, conversions: 892, conversionRate: 17.8, participants: 5000 },
      { id: 'b', name: 'Variant B', traffic: 50, conversions: 956, conversionRate: 19.1, participants: 5000 }
    ],
    startedAt: '1 week ago',
    duration: '14 days',
    participants: 10000,
    targetParticipants: 20000,
    metric: 'Open Rate'
  }
];

export function ABTestingManager() {
  const getStatusBadge = (status: ABTest['status']) => {
    const config: Record<string, { variant: any; icon: any }> = {
      running: { variant: 'default', icon: Play },
      completed: { variant: 'outline', icon: CheckCircle },
      draft: { variant: 'secondary', icon: Target },
      paused: { variant: 'secondary', icon: Pause }
    };
    
    const { variant, icon: Icon } = config[status];
    return (
      <Badge variant={variant} className="gap-1 text-xs capitalize">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const runningTests = abTests.filter(t => t.status === 'running').length;
  const totalParticipants = abTests.reduce((sum, t) => sum + t.participants, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Beaker className="h-5 w-5" />
              A/B Testing Manager
            </CardTitle>
            <CardDescription>Create and manage experiments to optimize platform performance</CardDescription>
          </div>
          <Button>
            <Beaker className="h-4 w-4 mr-2" />
            New A/B Test
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Beaker className="h-4 w-4 text-blue-500" />
              <div className="text-sm text-muted-foreground">Total Tests</div>
            </div>
            <div className="text-2xl font-bold">{abTests.length}</div>
          </div>

          <div className="p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Play className="h-4 w-4 text-green-500" />
              <div className="text-sm text-muted-foreground">Running</div>
            </div>
            <div className="text-2xl font-bold">{runningTests}</div>
          </div>

          <div className="p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-purple-500" />
              <div className="text-sm text-muted-foreground">Participants</div>
            </div>
            <div className="text-2xl font-bold">{totalParticipants.toLocaleString()}</div>
          </div>

          <div className="p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-orange-500" />
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-2xl font-bold">
              {abTests.filter(t => t.status === 'completed').length}
            </div>
          </div>
        </div>

        {/* Tests List */}
        <div className="space-y-4">
          {abTests.map((test) => (
            <div
              key={test.id}
              className="p-4 border rounded-lg bg-card space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{test.name}</h3>
                    {getStatusBadge(test.status)}
                    {test.winner && (
                      <Badge className="gap-1 text-xs">
                        <TrendingUp className="h-3 w-3" />
                        Winner: Variant {test.winner.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{test.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {test.participants.toLocaleString()} / {test.targetParticipants.toLocaleString()} participants
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      Metric: {test.metric}
                    </span>
                    {test.startedAt && (
                      <>
                        <span>•</span>
                        <span>Started {test.startedAt}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>Duration: {test.duration}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {test.status === 'running' && (
                    <Button variant="ghost" size="sm">
                      <Pause className="h-4 w-4" />
                    </Button>
                  )}
                  {test.status === 'paused' && (
                    <Button variant="ghost" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <BarChart className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Variants Performance */}
              <div className="space-y-3 pt-3 border-t">
                {test.variants.map((variant) => {
                  const isWinner = test.winner === variant.id;
                  
                  return (
                    <div
                      key={variant.id}
                      className={`p-3 border rounded-lg ${isWinner ? 'bg-green-500/10 border-green-500' : 'bg-muted/50'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{variant.name}</span>
                          {isWinner && (
                            <Badge className="gap-1 text-xs">
                              <CheckCircle className="h-3 w-3" />
                              Winner
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">{variant.traffic}% traffic</span>
                          <span className="font-semibold text-green-600">
                            {variant.conversionRate}% conversion
                          </span>
                        </div>
                      </div>
                      
                      <Progress value={variant.conversionRate * 10} className="h-2" />
                      
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>{variant.participants.toLocaleString()} participants</span>
                        <span>{variant.conversions.toLocaleString()} conversions</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
