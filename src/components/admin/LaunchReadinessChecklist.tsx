import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Circle } from "lucide-react";

interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  status: 'complete' | 'in-progress' | 'pending';
  priority: 'critical' | 'high' | 'medium';
}

const checklistItems: ChecklistItem[] = [
  // Infrastructure
  { id: '1', category: 'Infrastructure', item: 'Database backup configured', status: 'complete', priority: 'critical' },
  { id: '2', category: 'Infrastructure', item: 'CDN setup and tested', status: 'complete', priority: 'high' },
  { id: '3', category: 'Infrastructure', item: 'SSL certificates valid', status: 'complete', priority: 'critical' },
  { id: '4', category: 'Infrastructure', item: 'Rate limiting configured', status: 'complete', priority: 'high' },
  
  // Security
  { id: '5', category: 'Security', item: 'RLS policies tested', status: 'complete', priority: 'critical' },
  { id: '6', category: 'Security', item: 'Authentication flows verified', status: 'complete', priority: 'critical' },
  { id: '7', category: 'Security', item: 'API keys secured', status: 'complete', priority: 'critical' },
  { id: '8', category: 'Security', item: 'CORS configured', status: 'complete', priority: 'high' },
  
  // Features
  { id: '9', category: 'Features', item: 'Payment processing tested', status: 'complete', priority: 'critical' },
  { id: '10', category: 'Features', item: 'File upload/download verified', status: 'complete', priority: 'high' },
  { id: '11', category: 'Features', item: 'Real-time features working', status: 'complete', priority: 'high' },
  { id: '12', category: 'Features', item: 'Email notifications active', status: 'complete', priority: 'medium' },
  
  // Performance
  { id: '13', category: 'Performance', item: 'Load testing completed', status: 'in-progress', priority: 'high' },
  { id: '14', category: 'Performance', item: 'Image optimization enabled', status: 'complete', priority: 'medium' },
  { id: '15', category: 'Performance', item: 'Caching strategy implemented', status: 'complete', priority: 'high' },
  
  // Legal & Compliance
  { id: '16', category: 'Legal', item: 'Terms of Service published', status: 'complete', priority: 'critical' },
  { id: '17', category: 'Legal', item: 'Privacy Policy published', status: 'complete', priority: 'critical' },
  { id: '18', category: 'Legal', item: 'Cookie consent configured', status: 'complete', priority: 'high' },
  
  // Marketing
  { id: '19', category: 'Marketing', item: 'SEO meta tags configured', status: 'complete', priority: 'high' },
  { id: '20', category: 'Marketing', item: 'Analytics tracking active', status: 'complete', priority: 'high' },
  { id: '21', category: 'Marketing', item: 'Social media accounts ready', status: 'pending', priority: 'medium' },
];

export function LaunchReadinessChecklist() {
  const categories = Array.from(new Set(checklistItems.map(item => item.category)));
  
  const getStatusIcon = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'pending':
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: ChecklistItem['status']) => {
    const variants = {
      complete: 'default',
      'in-progress': 'secondary',
      pending: 'outline'
    };
    return <Badge variant={variants[status] as any}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: ChecklistItem['priority']) => {
    const colors = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-blue-500'
    };
    return <Badge className={colors[priority]}>{priority}</Badge>;
  };

  const categoryProgress = (category: string) => {
    const items = checklistItems.filter(item => item.category === category);
    const completed = items.filter(item => item.status === 'complete').length;
    return Math.round((completed / items.length) * 100);
  };

  const totalProgress = Math.round(
    (checklistItems.filter(item => item.status === 'complete').length / checklistItems.length) * 100
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Launch Readiness Checklist</CardTitle>
            <CardDescription>Track your progress towards production launch</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{totalProgress}%</div>
            <div className="text-sm text-muted-foreground">Overall Progress</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {categories.map(category => (
          <div key={category} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{category}</h3>
              <Badge variant="outline">{categoryProgress(category)}%</Badge>
            </div>
            
            <div className="space-y-2">
              {checklistItems
                .filter(item => item.category === category)
                .map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(item.status)}
                      <span className="text-sm">{item.item}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(item.priority)}
                      {getStatusBadge(item.status)}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
