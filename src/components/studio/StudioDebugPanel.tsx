import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bug, Activity, CheckCircle, XCircle, Clock } from 'lucide-react';
import { performanceMonitor } from '@/utils/performanceMonitor';
import { workflowTests, runWorkflowValidation, type WorkflowTestSuite } from '@/utils/workflowValidator';
import { useAIStudioStore } from '@/stores/aiStudioStore';

interface StudioDebugPanelProps {
  visible: boolean;
  onClose: () => void;
}

export const StudioDebugPanel = ({ visible, onClose }: StudioDebugPanelProps) => {
  const [metrics, setMetrics] = useState<any>({});
  const [testSuites, setTestSuites] = useState<WorkflowTestSuite[]>(workflowTests);
  const { tracks, isPlaying, currentTime, duration } = useAIStudioStore();

  useEffect(() => {
    if (visible) {
      const interval = setInterval(() => {
        setMetrics(performanceMonitor.getAllMetrics());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [visible]);

  const handleRunTests = async () => {
    const results = await runWorkflowValidation();
    setTestSuites(results);
  };

  const handleLogReport = () => {
    performanceMonitor.logReport();
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[600px] animate-slide-up">
      <Card className="bg-background/95 backdrop-blur-lg border-primary/20 shadow-2xl">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-primary" />
            <h3 className="font-bold">Studio Debug</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <Tabs defaultValue="state" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="state">State</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
          </TabsList>

          <TabsContent value="state" className="p-4 space-y-3 max-h-[480px] overflow-y-auto">
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Current State
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tracks:</span>
                  <Badge variant="secondary">{tracks.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Playing:</span>
                  <Badge variant={isPlaying ? "default" : "secondary"}>
                    {isPlaying ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-mono text-xs">
                    {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Regions:</span>
                  <Badge variant="secondary">
                    {tracks.reduce((sum, t) => sum + t.regions.length, 0)}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="border-t pt-3">
              <h4 className="text-sm font-semibold mb-2">Tracks</h4>
              <div className="space-y-2">
                {tracks.map((track, i) => (
                  <div key={track.id} className="text-xs bg-muted/30 rounded p-2">
                    <div className="font-semibold">{track.name}</div>
                    <div className="text-muted-foreground">
                      {track.regions.length} regions • {track.mute ? '🔇' : '🔊'} {track.solo ? '🎯' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="p-4 space-y-3 max-h-[480px] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Performance Metrics
              </h4>
              <Button size="sm" variant="outline" onClick={handleLogReport}>
                Log Report
              </Button>
            </div>

            {Object.keys(metrics).length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                No performance data yet. Use the studio to generate metrics.
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(metrics).map(([operation, data]: [string, any]) => (
                  <div key={operation} className="text-xs bg-muted/30 rounded p-2">
                    <div className="font-semibold">{operation}</div>
                    <div className="grid grid-cols-3 gap-2 mt-1 text-muted-foreground">
                      <div>Avg: {data.avg.toFixed(2)}ms</div>
                      <div>Min: {data.min.toFixed(2)}ms</div>
                      <div>Max: {data.max.toFixed(2)}ms</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tests" className="p-4 space-y-3 max-h-[480px] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-semibold">Workflow Tests</h4>
              <Button size="sm" variant="outline" onClick={handleRunTests}>
                Run Tests
              </Button>
            </div>

            <div className="space-y-3">
              {testSuites.map((suite) => (
                <div key={suite.name} className="border border-border/50 rounded-lg p-3">
                  <div className="font-semibold text-sm mb-2">{suite.name}</div>
                  <div className="space-y-1">
                    {suite.tests.map((test) => (
                      <div key={test.name} className="flex items-start gap-2 text-xs">
                        {test.status === 'passed' && (
                          <CheckCircle className="w-3 h-3 text-green-500 mt-0.5" />
                        )}
                        {test.status === 'failed' && (
                          <XCircle className="w-3 h-3 text-destructive mt-0.5" />
                        )}
                        {test.status === 'pending' && (
                          <Clock className="w-3 h-3 text-muted-foreground mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{test.name}</div>
                          <div className="text-muted-foreground">{test.expectedResult}</div>
                          {test.error && (
                            <div className="text-destructive mt-1">{test.error}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
