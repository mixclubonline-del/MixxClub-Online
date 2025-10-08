import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play, 
  Download,
  AlertTriangle 
} from 'lucide-react';
import { 
  workflowTests, 
  generateTestReport,
  type WorkflowTestSuite 
} from '@/utils/workflowValidator';
import { performanceMonitor } from '@/utils/performanceMonitor';

export const TestRunner = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<WorkflowTestSuite[]>(workflowTests);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [progress, setProgress] = useState(0);

  const runAllTests = async () => {
    setIsRunning(true);
    setProgress(0);

    const totalTests = workflowTests.reduce((sum, suite) => sum + suite.tests.length, 0);
    let completedTests = 0;

    const updatedSuites: WorkflowTestSuite[] = [];

    for (const suite of workflowTests) {
      const updatedTests = [];
      
      for (const test of suite.tests) {
        setCurrentTest(`${suite.name}: ${test.name}`);
        
        // Simulate test execution with actual checks where possible
        const startTime = performance.now();
        
        let status: 'passed' | 'failed' | 'pending' = 'pending';
        let error: string | undefined;

        try {
          // Performance-based tests
          if (suite.name === 'Performance') {
            const metrics = performanceMonitor.getAllMetrics();
            
            if (test.name === 'Waveform render') {
              const waveformMetric = metrics['waveformRender'];
              if (waveformMetric && waveformMetric.avg < 100) {
                status = 'passed';
              } else if (waveformMetric) {
                status = 'failed';
                error = `Avg: ${waveformMetric.avg.toFixed(2)}ms (threshold: 100ms)`;
              } else {
                status = 'pending';
                error = 'No data collected yet';
              }
            } else if (test.name === 'Playback latency') {
              const latencyMetric = metrics['playbackLatency'];
              if (latencyMetric && latencyMetric.avg < 10) {
                status = 'passed';
              } else if (latencyMetric) {
                status = 'failed';
                error = `Avg: ${latencyMetric.avg.toFixed(2)}ms (threshold: 10ms)`;
              } else {
                status = 'pending';
                error = 'No data collected yet';
              }
            } else {
              // Other performance tests need manual validation
              status = 'pending';
              error = 'Manual validation required';
            }
          } else {
            // All other tests require manual validation
            status = 'pending';
            error = 'Manual validation required - use interactive testing';
          }
        } catch (e) {
          status = 'failed';
          error = e instanceof Error ? e.message : 'Unknown error';
        }

        const duration = performance.now() - startTime;
        
        updatedTests.push({
          ...test,
          status,
          error,
          duration
        });

        completedTests++;
        setProgress((completedTests / totalTests) * 100);
        
        // Small delay for UI updates
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      updatedSuites.push({
        ...suite,
        tests: updatedTests,
        passed: updatedTests.filter(t => t.status === 'passed').length,
        failed: updatedTests.filter(t => t.status === 'failed').length,
        pending: updatedTests.filter(t => t.status === 'pending').length
      });
    }

    setTestResults(updatedSuites);
    setCurrentTest('');
    setIsRunning(false);
  };

  const downloadReport = () => {
    const report = generateTestReport(testResults);
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mixxstudio-test-report-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const logPerformanceReport = () => {
    performanceMonitor.logReport();
  };

  const totalTests = testResults.reduce((sum, suite) => sum + suite.tests.length, 0);
  const totalPassed = testResults.reduce((sum, suite) => sum + suite.passed, 0);
  const totalFailed = testResults.reduce((sum, suite) => sum + suite.failed, 0);
  const totalPending = testResults.reduce((sum, suite) => sum + suite.pending, 0);

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">MixxStudio Test Suite</h2>
            <p className="text-muted-foreground text-sm">
              Comprehensive workflow and performance validation
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={logPerformanceReport}
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Log Performance
            </Button>
            <Button
              onClick={downloadReport}
              variant="outline"
              size="sm"
              disabled={totalPassed === 0 && totalFailed === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              size="sm"
            >
              <Play className="w-4 h-4 mr-2" />
              {isRunning ? 'Running...' : 'Run All Tests'}
            </Button>
          </div>
        </div>

        {isRunning && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{currentTest}</span>
              <span className="font-mono">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Total Tests</div>
            <div className="text-2xl font-bold">{totalTests}</div>
          </Card>
          <Card className="p-4 border-green-500/20 bg-green-500/5">
            <div className="text-sm text-muted-foreground mb-1">Passed</div>
            <div className="text-2xl font-bold text-green-500">{totalPassed}</div>
          </Card>
          <Card className="p-4 border-destructive/20 bg-destructive/5">
            <div className="text-sm text-muted-foreground mb-1">Failed</div>
            <div className="text-2xl font-bold text-destructive">{totalFailed}</div>
          </Card>
          <Card className="p-4 border-yellow-500/20 bg-yellow-500/5">
            <div className="text-sm text-muted-foreground mb-1">Pending</div>
            <div className="text-2xl font-bold text-yellow-500">{totalPending}</div>
          </Card>
        </div>
      </Card>

      <div className="space-y-4">
        {testResults.map((suite) => (
          <Card key={suite.name} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">{suite.name}</h3>
              <div className="flex gap-2">
                {suite.passed > 0 && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                    {suite.passed} passed
                  </Badge>
                )}
                {suite.failed > 0 && (
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                    {suite.failed} failed
                  </Badge>
                )}
                {suite.pending > 0 && (
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                    {suite.pending} pending
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {suite.tests.map((test) => (
                <div
                  key={test.name}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                >
                  <div className="mt-0.5">
                    {test.status === 'passed' && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {test.status === 'failed' && (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                    {test.status === 'pending' && (
                      <Clock className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{test.name}</div>
                    <div className="text-sm text-muted-foreground">{test.action}</div>
                    <div className="text-sm text-muted-foreground">
                      Expected: {test.expectedResult}
                    </div>
                    {test.error && (
                      <div className="flex items-start gap-2 mt-2 p-2 rounded bg-destructive/10 border border-destructive/20">
                        <AlertTriangle className="w-3 h-3 text-destructive mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-destructive">{test.error}</span>
                      </div>
                    )}
                    {test.duration && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Duration: {test.duration.toFixed(2)}ms
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
