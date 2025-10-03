import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, Database, Globe } from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  icon: React.ReactNode;
}

export const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);

  useEffect(() => {
    // Collect Web Vitals
    const collectMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
      const firstPaint = performance.getEntriesByName('first-paint')[0]?.startTime || 0;

      const newMetrics: PerformanceMetric[] = [
        {
          name: 'Page Load Time',
          value: Math.round(loadTime),
          unit: 'ms',
          status: loadTime < 2000 ? 'good' : loadTime < 4000 ? 'warning' : 'critical',
          icon: <Zap className="h-4 w-4" />,
        },
        {
          name: 'DOM Content Loaded',
          value: Math.round(domContentLoaded),
          unit: 'ms',
          status: domContentLoaded < 1500 ? 'good' : domContentLoaded < 2500 ? 'warning' : 'critical',
          icon: <Activity className="h-4 w-4" />,
        },
        {
          name: 'First Paint',
          value: Math.round(firstPaint),
          unit: 'ms',
          status: firstPaint < 1000 ? 'good' : firstPaint < 2000 ? 'warning' : 'critical',
          icon: <Globe className="h-4 w-4" />,
        },
      ];

      // Memory usage (if available)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMemory = Math.round(memory.usedJSHeapSize / 1048576); // Convert to MB
        const totalMemory = Math.round(memory.jsHeapSizeLimit / 1048576);
        const memoryPercent = (usedMemory / totalMemory) * 100;

        newMetrics.push({
          name: 'Memory Usage',
          value: usedMemory,
          unit: `MB / ${totalMemory}MB`,
          status: memoryPercent < 60 ? 'good' : memoryPercent < 80 ? 'warning' : 'critical',
          icon: <Database className="h-4 w-4" />,
        });
      }

      setMetrics(newMetrics);
    };

    // Wait for page to fully load
    if (document.readyState === 'complete') {
      collectMetrics();
    } else {
      window.addEventListener('load', collectMetrics);
      return () => window.removeEventListener('load', collectMetrics);
    }
  }, []);

  const getStatusColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
    }
  };

  const getStatusVariant = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'critical':
        return 'destructive';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {metric.icon}
                <span className="text-sm font-medium">{metric.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusVariant(metric.status)}>
                  {metric.value} {metric.unit}
                </Badge>
              </div>
            </div>
            <Progress 
              value={metric.status === 'good' ? 100 : metric.status === 'warning' ? 60 : 30} 
              className="h-2"
            />
          </div>
        ))}
        
        {metrics.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Loading performance metrics...
          </p>
        )}
      </CardContent>
    </Card>
  );
};
