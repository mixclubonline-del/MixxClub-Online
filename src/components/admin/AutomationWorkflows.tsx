import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Zap, Play, Pause, Settings } from "lucide-react";
import { toast } from "sonner";

interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: string;
  actions: string[];
  enabled: boolean;
  runCount: number;
  lastRun: string;
  successRate: number;
}

const demoWorkflows: Workflow[] = [
  {
    id: '1',
    name: 'Welcome Email Sequence',
    description: 'Send welcome email and onboarding guide to new users',
    trigger: 'user.created',
    actions: ['Send welcome email', 'Add to onboarding list', 'Track conversion'],
    enabled: true,
    runCount: 1250,
    lastRun: '2 hours ago',
    successRate: 98.5
  },
  {
    id: '2',
    name: 'Payment Success Notification',
    description: 'Notify team and user when payment is successful',
    trigger: 'payment.succeeded',
    actions: ['Send receipt email', 'Update user status', 'Log to analytics'],
    enabled: true,
    runCount: 2180,
    lastRun: '1 hour ago',
    successRate: 100
  },
  {
    id: '3',
    name: 'Project Completion Flow',
    description: 'Handle project completion notifications and review requests',
    trigger: 'project.completed',
    actions: ['Notify client', 'Request review', 'Update leaderboard'],
    enabled: true,
    runCount: 840,
    lastRun: '3 hours ago',
    successRate: 97.2
  },
  {
    id: '4',
    name: 'Inactive User Re-engagement',
    description: 'Send re-engagement email to users inactive for 30 days',
    trigger: 'scheduled.daily',
    actions: ['Check inactive users', 'Send re-engagement email', 'Offer discount'],
    enabled: false,
    runCount: 45,
    lastRun: '2 days ago',
    successRate: 65.5
  },
];

export function AutomationWorkflows() {
  const [workflows, setWorkflows] = useState(demoWorkflows);

  const toggleWorkflow = (id: string) => {
    setWorkflows(workflows.map(w =>
      w.id === id ? { ...w, enabled: !w.enabled } : w
    ));
    const workflow = workflows.find(w => w.id === id);
    toast.success(`Workflow "${workflow?.name}" ${workflow?.enabled ? 'disabled' : 'enabled'}`);
  };

  const testWorkflow = (workflow: Workflow) => {
    toast.success(`Testing workflow: ${workflow.name}`);
  };

  const getSuccessColor = (rate: number) => {
    if (rate >= 95) return 'text-green-500';
    if (rate >= 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Automation Workflows
          </CardTitle>
          <CardDescription>Automate repetitive tasks with event-driven workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="p-4 rounded-lg border bg-card">
              <div className="text-sm text-muted-foreground mb-1">Active Workflows</div>
              <div className="text-2xl font-bold">
                {workflows.filter(w => w.enabled).length}
              </div>
            </div>
            
            <div className="p-4 rounded-lg border bg-card">
              <div className="text-sm text-muted-foreground mb-1">Total Runs (24h)</div>
              <div className="text-2xl font-bold">
                {workflows.reduce((sum, w) => sum + w.runCount, 0).toLocaleString()}
              </div>
            </div>
            
            <div className="p-4 rounded-lg border bg-card">
              <div className="text-sm text-muted-foreground mb-1">Avg Success Rate</div>
              <div className="text-2xl font-bold text-green-500">
                {Math.round(workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length)}%
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="p-4 rounded-lg border bg-card"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold">{workflow.name}</h4>
                      <Switch
                        checked={workflow.enabled}
                        onCheckedChange={() => toggleWorkflow(workflow.id)}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {workflow.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{workflow.runCount.toLocaleString()} runs</span>
                      <span>•</span>
                      <span>Last run {workflow.lastRun}</span>
                      <span>•</span>
                      <span className={getSuccessColor(workflow.successRate)}>
                        {workflow.successRate}% success
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testWorkflow(workflow)}
                      disabled={!workflow.enabled}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="font-mono">
                      {workflow.trigger}
                    </Badge>
                    <span className="text-muted-foreground">→</span>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-6">
                    {workflow.actions.map((action, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {i + 1}. {action}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Triggers</CardTitle>
          <CardDescription>Events that can trigger automation workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              'user.created',
              'user.updated',
              'project.created',
              'project.completed',
              'payment.succeeded',
              'payment.failed',
              'subscription.created',
              'subscription.cancelled',
              'scheduled.daily',
              'scheduled.weekly'
            ].map(trigger => (
              <div key={trigger} className="p-3 rounded-lg border bg-card">
                <code className="text-sm font-mono">{trigger}</code>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
