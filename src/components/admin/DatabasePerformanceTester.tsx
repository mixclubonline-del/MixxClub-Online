import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Zap, TrendingUp, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

interface QueryTest {
  name: string;
  query: string;
  expectedTime: number;
  actualTime?: number;
  status: "pending" | "pass" | "slow" | "failed";
  rowCount?: number;
}

export const DatabasePerformanceTester = () => {
  const { toast } = useToast();
  const [isTesting, setIsTesting] = useState(false);
  const [tests, setTests] = useState<QueryTest[]>([
    {
      name: "User Lookup",
      query: "profiles by ID",
      expectedTime: 50,
      status: "pending"
    },
    {
      name: "Project Search",
      query: "projects with filters",
      expectedTime: 100,
      status: "pending"
    },
    {
      name: "Audio Files Query",
      query: "audio_files with joins",
      expectedTime: 150,
      status: "pending"
    },
    {
      name: "Match Algorithm",
      query: "ai_collaboration_matches",
      expectedTime: 200,
      status: "pending"
    },
    {
      name: "Payment History",
      query: "payments with aggregation",
      expectedTime: 100,
      status: "pending"
    },
  ]);

  const updateTest = (index: number, updates: Partial<QueryTest>) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, ...updates } : test
    ));
  };

  const runPerformanceTests = async () => {
    setIsTesting(true);

    try {
      // Test 1: User lookup by ID
      const startTime1 = Date.now();
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
        .single();
      const time1 = Date.now() - startTime1;

      updateTest(0, {
        actualTime: time1,
        status: time1 <= 50 ? "pass" : time1 <= 100 ? "slow" : "failed",
        rowCount: userData ? 1 : 0
      });

      await new Promise(resolve => setTimeout(resolve, 300));

      // Test 2: Project search with filters
      const startTime2 = Date.now();
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'in_progress')
        .order('created_at', { ascending: false })
        .limit(10);
      const time2 = Date.now() - startTime2;

      updateTest(1, {
        actualTime: time2,
        status: time2 <= 100 ? "pass" : time2 <= 200 ? "slow" : "failed",
        rowCount: projectData?.length || 0
      });

      await new Promise(resolve => setTimeout(resolve, 300));

      // Test 3: Audio files with joins
      const startTime3 = Date.now();
      const { data: audioData, error: audioError } = await supabase
        .from('audio_files')
        .select(`
          *,
          projects!inner(*)
        `)
        .limit(10);
      const time3 = Date.now() - startTime3;

      updateTest(2, {
        actualTime: time3,
        status: time3 <= 150 ? "pass" : time3 <= 300 ? "slow" : "failed",
        rowCount: audioData?.length || 0
      });

      await new Promise(resolve => setTimeout(resolve, 300));

      // Test 4: AI matching query
      const startTime4 = Date.now();
      const { data: matchData, error: matchError } = await supabase
        .from('ai_collaboration_matches')
        .select('*')
        .order('compatibility_score', { ascending: false })
        .limit(20);
      const time4 = Date.now() - startTime4;

      updateTest(3, {
        actualTime: time4,
        status: time4 <= 200 ? "pass" : time4 <= 400 ? "slow" : "failed",
        rowCount: matchData?.length || 0
      });

      await new Promise(resolve => setTimeout(resolve, 300));

      // Test 5: Payment history with aggregation
      const startTime5 = Date.now();
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      const time5 = Date.now() - startTime5;

      updateTest(4, {
        actualTime: time5,
        status: time5 <= 100 ? "pass" : time5 <= 200 ? "slow" : "failed",
        rowCount: paymentData?.length || 0
      });

      const allPassed = tests.every(t => t.status === "pass");
      const slowCount = tests.filter(t => t.status === "slow").length;

      toast({
        title: allPassed ? "All tests passed!" : slowCount > 0 ? "Some queries are slow" : "Performance issues detected",
        description: `${tests.filter(t => t.status === "pass").length}/${tests.length} queries optimal`,
        variant: allPassed ? "default" : "destructive"
      });

    } catch (error) {
      toast({
        title: "Test failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusBadge = (test: QueryTest) => {
    if (test.status === "pending") return <Badge variant="outline">Pending</Badge>;
    if (test.status === "pass") return <Badge variant="default">Pass</Badge>;
    if (test.status === "slow") return <Badge variant="secondary">Slow</Badge>;
    return <Badge variant="destructive">Failed</Badge>;
  };

  const completedTests = tests.filter(t => t.status !== "pending").length;
  const progress = (completedTests / tests.length) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>Database Performance Tester</CardTitle>
          </div>
          <Button onClick={runPerformanceTests} disabled={isTesting}>
            {isTesting ? "Testing..." : "Run Tests"}
          </Button>
        </div>
        <CardDescription>
          Query performance and optimization analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isTesting && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground text-center">
              {completedTests} of {tests.length} queries tested
            </p>
          </div>
        )}

        <div className="space-y-2">
          {tests.map((test, idx) => (
            <div key={idx} className="p-3 rounded border bg-muted">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {test.status === "pass" && <Zap className="h-4 w-4 text-green-500" />}
                  {test.status === "slow" && <TrendingUp className="h-4 w-4 text-yellow-500" />}
                  {test.status === "failed" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                  <span className="text-sm font-semibold">{test.name}</span>
                </div>
                {getStatusBadge(test)}
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Expected:</span>
                  <span className="ml-1 font-semibold">{test.expectedTime}ms</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Actual:</span>
                  <span className="ml-1 font-semibold">
                    {test.actualTime ? `${test.actualTime}ms` : '--'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Rows:</span>
                  <span className="ml-1 font-semibold">
                    {test.rowCount !== undefined ? test.rowCount : '--'}
                  </span>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground mt-2">Query: {test.query}</p>
            </div>
          ))}
        </div>

        {!isTesting && tests.every(t => t.status === "pending") && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Click "Run Tests" to analyze database query performance
          </div>
        )}
      </CardContent>
    </Card>
  );
};
