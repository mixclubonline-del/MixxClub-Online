import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

interface OptimizationItem {
  status: 'success' | 'warning' | 'info';
  title: string;
  description: string;
}

export const BundleOptimizationReport = () => {
  const optimizations: OptimizationItem[] = [
    {
      status: 'success',
      title: 'Code Splitting Enabled',
      description: 'Manual chunk splitting configured for vendors (React, Supabase, UI components)',
    },
    {
      status: 'success',
      title: 'Tree Shaking Active',
      description: 'Unused code is automatically removed during build',
    },
    {
      status: 'success',
      title: 'Lazy Loading Routes',
      description: 'Routes are loaded on-demand using React.lazy()',
    },
    {
      status: 'success',
      title: 'React Deduplication',
      description: 'Single React/ReactDOM instance across the application',
    },
    {
      status: 'success',
      title: 'Terser Minification',
      description: 'Production code is minified with console.log removal',
    },
    {
      status: 'success',
      title: 'SWC Compilation',
      description: 'Fast compilation using SWC instead of Babel',
    },
    {
      status: 'info',
      title: 'Chunk Size Limit',
      description: 'Warning threshold set to 1000KB for individual chunks',
    },
    {
      status: 'info',
      title: 'Source Maps',
      description: 'Source maps enabled in development for debugging',
    },
  ];

  const getIcon = (status: OptimizationItem['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: OptimizationItem['status']) => {
    const variants = {
      success: 'default',
      warning: 'secondary',
      info: 'outline',
    } as const;

    return (
      <Badge variant={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bundle Optimization Report</CardTitle>
        <CardDescription>
          Current optimization strategies and configurations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {optimizations.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 rounded-lg border bg-card"
          >
            <div className="mt-0.5">{getIcon(item.status)}</div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-medium">{item.title}</h4>
                {getStatusBadge(item.status)}
              </div>
              <p className="text-xs text-muted-foreground">
                {item.description}
              </p>
            </div>
          </div>
        ))}

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Recommendations</h4>
          <ul className="text-xs text-muted-foreground space-y-1 ml-4">
            <li>• Monitor bundle size after each major dependency update</li>
            <li>• Use dynamic imports for heavy features (3D, charts, etc.)</li>
            <li>• Consider CDN for static assets in production</li>
            <li>• Regular dependency audits to remove unused packages</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
