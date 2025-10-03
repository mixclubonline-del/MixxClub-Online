import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, XCircle, AlertCircle, Rocket, Code, 
  Shield, Database, Settings, Globe
} from "lucide-react";

interface Environment {
  name: string;
  status: 'ready' | 'issues' | 'not-configured';
  url?: string;
  lastDeploy?: string;
  checks: EnvironmentCheck[];
}

interface EnvironmentCheck {
  name: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
}

const environments: Environment[] = [
  {
    name: 'Production',
    status: 'issues',
    url: 'https://app.yourplatform.com',
    lastDeploy: '2 hours ago',
    checks: [
      { name: 'Build Status', status: 'passed', message: 'Build completed successfully' },
      { name: 'Environment Variables', status: 'passed', message: 'All variables configured' },
      { name: 'Database Connection', status: 'passed', message: 'Connection stable' },
      { name: 'SSL Certificate', status: 'passed', message: 'Valid until Dec 2025' },
      { name: 'CDN Status', status: 'warning', message: 'Cache hit rate below target' },
      { name: 'Monitoring', status: 'passed', message: 'All monitors active' },
    ]
  },
  {
    name: 'Staging',
    status: 'ready',
    url: 'https://staging.yourplatform.com',
    lastDeploy: '30 minutes ago',
    checks: [
      { name: 'Build Status', status: 'passed', message: 'Build completed successfully' },
      { name: 'Environment Variables', status: 'passed', message: 'All variables configured' },
      { name: 'Database Connection', status: 'passed', message: 'Connection stable' },
      { name: 'SSL Certificate', status: 'passed', message: 'Valid until Dec 2025' },
      { name: 'Test Suite', status: 'passed', message: 'All tests passing' },
      { name: 'Monitoring', status: 'passed', message: 'All monitors active' },
    ]
  },
  {
    name: 'Development',
    status: 'ready',
    url: 'https://dev.yourplatform.com',
    lastDeploy: '5 minutes ago',
    checks: [
      { name: 'Build Status', status: 'passed', message: 'Build completed successfully' },
      { name: 'Environment Variables', status: 'passed', message: 'All variables configured' },
      { name: 'Database Connection', status: 'passed', message: 'Connection stable' },
      { name: 'Hot Reload', status: 'passed', message: 'Working correctly' },
    ]
  }
];

const deploymentSteps = [
  { name: 'Pre-deployment Checks', status: 'completed', icon: CheckCircle },
  { name: 'Build & Test', status: 'completed', icon: Code },
  { name: 'Security Scan', status: 'completed', icon: Shield },
  { name: 'Database Migrations', status: 'in-progress', icon: Database },
  { name: 'Configuration Sync', status: 'pending', icon: Settings },
  { name: 'Deploy to Production', status: 'pending', icon: Rocket },
  { name: 'Post-deployment Validation', status: 'pending', icon: Globe },
];

export function DeploymentReadiness() {
  const getEnvironmentStatusBadge = (status: Environment['status']) => {
    const variants: Record<string, any> = {
      ready: 'default',
      issues: 'secondary',
      'not-configured': 'outline'
    };
    return variants[status];
  };

  const getCheckStatusIcon = (status: EnvironmentCheck['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'in-progress':
        return 'text-blue-500';
      case 'pending':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Environment Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Environment Status</CardTitle>
              <CardDescription>Deployment readiness across all environments</CardDescription>
            </div>
            <Button>
              <Rocket className="h-4 w-4 mr-2" />
              Deploy to Production
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {environments.map((env) => (
            <div key={env.name} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">{env.name}</h3>
                  <Badge variant={getEnvironmentStatusBadge(env.status)}>
                    {env.status === 'ready' && 'Ready'}
                    {env.status === 'issues' && 'Has Issues'}
                    {env.status === 'not-configured' && 'Not Configured'}
                  </Badge>
                </div>
                {env.url && (
                  <a 
                    href={env.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {env.url}
                  </a>
                )}
              </div>

              {env.lastDeploy && (
                <div className="text-sm text-muted-foreground">
                  Last deployed: {env.lastDeploy}
                </div>
              )}

              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {env.checks.map((check) => (
                  <div 
                    key={check.name}
                    className="flex items-start gap-2 p-2 rounded bg-muted/50"
                  >
                    {getCheckStatusIcon(check.status)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{check.name}</div>
                      <div className="text-xs text-muted-foreground">{check.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Deployment Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment Pipeline</CardTitle>
          <CardDescription>Automated deployment workflow status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deploymentSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.name} className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step.status === 'completed' ? 'border-green-500 bg-green-500/10' :
                    step.status === 'in-progress' ? 'border-blue-500 bg-blue-500/10' :
                    'border-gray-300 bg-gray-100'
                  }`}>
                    <Icon className={`h-5 w-5 ${getStepStatusColor(step.status)}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-medium">{step.name}</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {step.status === 'in-progress' ? 'In Progress...' : step.status}
                    </div>
                  </div>

                  <Badge 
                    variant={
                      step.status === 'completed' ? 'default' :
                      step.status === 'in-progress' ? 'secondary' :
                      'outline'
                    }
                  >
                    {step.status === 'completed' && 'Complete'}
                    {step.status === 'in-progress' && 'Running'}
                    {step.status === 'pending' && 'Pending'}
                  </Badge>

                  {index < deploymentSteps.length - 1 && (
                    <div className="absolute left-[20px] w-0.5 h-12 bg-gray-300 -mb-12 mt-12 ml-5" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
