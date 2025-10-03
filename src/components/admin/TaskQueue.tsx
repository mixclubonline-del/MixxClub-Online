import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const TaskQueue = () => {
  const { toast } = useToast();

  const { data: jobs } = useQuery({
    queryKey: ["background-jobs"],
    queryFn: async () => {
      // Mock job queue data
      return [
        { id: "1", type: "email", status: "running", progress: 45, created_at: new Date() },
        { id: "2", type: "backup", status: "queued", progress: 0, created_at: new Date() },
        { id: "3", type: "export", status: "failed", progress: 80, created_at: new Date() },
        { id: "4", type: "import", status: "completed", progress: 100, created_at: new Date(Date.now() - 3600000) },
      ];
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-destructive" />;
      case "running":
        return <RefreshCw className="h-5 w-5 text-primary animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Background Task Queue
        </CardTitle>
        <CardDescription>Monitor and manage background jobs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Running</div>
              <div className="text-2xl font-bold">
                {jobs?.filter((j) => j.status === "running").length || 0}
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Queued</div>
              <div className="text-2xl font-bold">
                {jobs?.filter((j) => j.status === "queued").length || 0}
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Failed</div>
              <div className="text-2xl font-bold text-destructive">
                {jobs?.filter((j) => j.status === "failed").length || 0}
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Completed</div>
              <div className="text-2xl font-bold text-green-600">
                {jobs?.filter((j) => j.status === "completed").length || 0}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          {jobs?.map((job) => (
            <Card key={job.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(job.status)}
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{job.type}</span>
                      <Badge
                        variant={
                          job.status === "completed"
                            ? "default"
                            : job.status === "failed"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {job.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {job.created_at.toLocaleString()}
                    </div>
                    {job.status === "running" && (
                      <div className="mt-2">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{job.progress}%</div>
                      </div>
                    )}
                  </div>
                </div>
                {job.status === "failed" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast({ title: "Job retried", description: `Retrying ${job.type} job` })}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
