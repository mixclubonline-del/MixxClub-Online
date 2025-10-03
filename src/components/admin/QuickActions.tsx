import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  FileText, 
  Download, 
  Activity, 
  DollarSign, 
  Users, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

interface QuickAction {
  id: string;
  name: string;
  icon: any;
  type: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
}

const SAFE_QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'generate_revenue_report',
    name: 'Revenue Report',
    icon: DollarSign,
    type: 'generate_report',
    description: 'Generate last 30 days revenue report',
    riskLevel: 'low'
  },
  {
    id: 'export_user_list',
    name: 'Export Users',
    icon: Users,
    type: 'export_data',
    description: 'Export current user list to CSV',
    riskLevel: 'low'
  },
  {
    id: 'check_system_health',
    name: 'System Health',
    icon: Activity,
    type: 'check_health',
    description: 'Check database and system health',
    riskLevel: 'low'
  },
  {
    id: 'growth_analysis',
    name: 'Growth Analysis',
    icon: TrendingUp,
    type: 'generate_report',
    description: 'Analyze user growth trends',
    riskLevel: 'low'
  },
  {
    id: 'performance_metrics',
    name: 'Performance Metrics',
    icon: FileText,
    type: 'generate_report',
    description: 'Platform performance overview',
    riskLevel: 'low'
  }
];

interface ActionResult {
  id: string;
  status: 'pending' | 'success' | 'failed';
  message: string;
  timestamp: Date;
}

export default function QuickActions() {
  const [executing, setExecuting] = useState<string | null>(null);
  const [results, setResults] = useState<ActionResult[]>([]);

  const executeAction = async (action: QuickAction) => {
    setExecuting(action.id);
    const startTime = Date.now();

    try {
      // Simulate action execution (in real implementation, call edge functions)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Log action to database
      await supabase.from('admin_quick_actions').insert({
        admin_id: user.id,
        action_type: action.type,
        action_name: action.name,
        parameters: {},
        result: { success: true },
        status: 'success',
        execution_time_ms: Date.now() - startTime
      });

      const result: ActionResult = {
        id: action.id,
        status: 'success',
        message: `${action.name} completed successfully`,
        timestamp: new Date()
      };

      setResults(prev => [result, ...prev].slice(0, 5));
      toast.success(action.name, {
        description: 'Action completed successfully'
      });
    } catch (error) {
      console.error('Action failed:', error);
      
      const result: ActionResult = {
        id: action.id,
        status: 'failed',
        message: `${action.name} failed`,
        timestamp: new Date()
      };

      setResults(prev => [result, ...prev].slice(0, 5));
      toast.error(action.name, {
        description: 'Action failed. Please try again.'
      });
    } finally {
      setExecuting(null);
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
      case 'high': return 'bg-red-500/10 text-red-600 dark:text-red-400';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SAFE_QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          const isExecuting = executing === action.id;

          return (
            <Card 
              key={action.id}
              className="p-4 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{action.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`text-[10px] ${getRiskBadgeColor(action.riskLevel)}`}
                  >
                    {action.riskLevel}
                  </Badge>
                </div>

                <Button
                  onClick={() => executeAction(action)}
                  disabled={isExecuting}
                  className="w-full"
                  size="sm"
                >
                  {isExecuting ? (
                    <>
                      <Clock className="h-3 w-3 mr-2 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Download className="h-3 w-3 mr-2" />
                      Execute
                    </>
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Action Results */}
      {results.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Actions
          </h3>
          <div className="space-y-2">
            {results.map((result, index) => (
              <div 
                key={`${result.id}-${index}`}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  {result.status === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{result.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {result.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={result.status === 'success' ? 'default' : 'destructive'}
                  className="text-[10px]"
                >
                  {result.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
