import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Play, Pause } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ScheduledTasks = () => {
  const { toast } = useToast();

  const tasks = [
    { id: "1", name: "Daily backup", schedule: "Every day at 2:00 AM", status: "active", lastRun: "2 hours ago" },
    { id: "2", name: "Weekly revenue report", schedule: "Every Monday at 9:00 AM", status: "active", lastRun: "1 day ago" },
    { id: "3", name: "Monthly cleanup", schedule: "1st of every month", status: "paused", lastRun: "15 days ago" },
    { id: "4", name: "User engagement email", schedule: "Every Tuesday at 10:00 AM", status: "active", lastRun: "6 days ago" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Scheduled Tasks
        </CardTitle>
        <CardDescription>Cron jobs and scheduled task management</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{task.name}</h4>
                  <Badge variant={task.status === "active" ? "default" : "secondary"}>
                    {task.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {task.schedule}
                </div>
                <div className="text-xs text-muted-foreground">
                  Last run: {task.lastRun}
                </div>
              </div>
              <div className="flex gap-2">
                {task.status === "active" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast({ title: "Task paused", description: `${task.name} has been paused` })}
                  >
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast({ title: "Task resumed", description: `${task.name} is now active` })}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Resume
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};
