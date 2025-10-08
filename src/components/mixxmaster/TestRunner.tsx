import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { MixxMasterIntegrationTests, TestResult } from "@/lib/mixxmaster/integration-tests";
import { Progress } from "@/components/ui/progress";

export const TestRunner = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [passRate, setPassRate] = useState(0);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    const tester = new MixxMasterIntegrationTests();
    const testResults = await tester.runAll();
    
    setResults(testResults);
    setPassRate(tester.getPassRate());
    setIsRunning(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Integration Tests</CardTitle>
          <Button onClick={runTests} disabled={isRunning}>
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <PlayCircle className="mr-2 h-4 w-4" />
                Run Tests
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {results.length > 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Pass Rate</span>
                <span className={passRate === 100 ? "text-green-600" : "text-orange-600"}>
                  {passRate.toFixed(0)}%
                </span>
              </div>
              <Progress value={passRate} />
            </div>

            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    {result.passed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">{result.name}</p>
                      {result.error && (
                        <p className="text-sm text-destructive">{result.error}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={result.passed ? "default" : "destructive"}>
                      {result.passed ? "PASS" : "FAIL"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {result.duration.toFixed(0)}ms
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.length === 0 && !isRunning && (
          <div className="text-center py-8 text-muted-foreground">
            Click "Run Tests" to start integration testing
          </div>
        )}
      </CardContent>
    </Card>
  );
};
