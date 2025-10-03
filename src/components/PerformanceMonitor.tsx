import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, Database } from 'lucide-react';

export const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: 0,
    loadTime: 0,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (import.meta.env.MODE !== 'development') return;

    // FPS counter
    let lastTime = performance.now();
    let frames = 0;

    const measureFPS = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        setMetrics(prev => ({
          ...prev,
          fps: Math.round((frames * 1000) / (currentTime - lastTime))
        }));
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };

    measureFPS();

    // Memory usage
    const measureMemory = () => {
      if ('memory' in performance) {
        const mem = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memory: Math.round(mem.usedJSHeapSize / 1048576) // Convert to MB
        }));
      }
    };

    const memoryInterval = setInterval(measureMemory, 2000);

    // Page load time
    window.addEventListener('load', () => {
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navTiming) {
        setMetrics(prev => ({
          ...prev,
          loadTime: Math.round(navTiming.loadEventEnd - navTiming.fetchStart)
        }));
      }
    });

    // Keyboard shortcut to toggle
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      clearInterval(memoryInterval);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  if (!isVisible || import.meta.env.MODE !== 'development') return null;

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'text-green-500';
    if (fps >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className="fixed bottom-4 right-4 p-4 space-y-3 z-50 min-w-[200px] shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Performance</h3>
        <Badge variant="outline" className="text-xs">DEV</Badge>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Zap className="w-3 h-3" />
            FPS
          </span>
          <span className={`font-mono font-bold ${getFPSColor(metrics.fps)}`}>
            {metrics.fps}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Database className="w-3 h-3" />
            Memory
          </span>
          <span className="font-mono">
            {metrics.memory} MB
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="w-3 h-3" />
            Load
          </span>
          <span className="font-mono">
            {metrics.loadTime}ms
          </span>
        </div>
      </div>

      <div className="text-[10px] text-muted-foreground pt-2 border-t">
        Press Ctrl+Shift+P to toggle
      </div>
    </Card>
  );
};
