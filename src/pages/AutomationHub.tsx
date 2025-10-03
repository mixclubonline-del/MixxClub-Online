import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkflowBuilder } from "@/components/admin/WorkflowBuilder";
import { TaskQueue } from "@/components/admin/TaskQueue";
import { AutomationRules } from "@/components/admin/AutomationRules";
import { ScheduledTasks } from "@/components/admin/ScheduledTasks";

const AutomationHub = () => {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/admin")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-3xl font-bold tracking-tight">Automation Hub</h2>
            </div>
            <p className="text-muted-foreground">
              Build workflows, manage background tasks, and automate operations
            </p>
          </div>
        </div>

        <Tabs defaultValue="workflows" className="space-y-4">
          <TabsList>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="tasks">Task Queue</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          </TabsList>

          <TabsContent value="workflows" className="space-y-4">
            <WorkflowBuilder />
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <TaskQueue />
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            <AutomationRules />
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            <ScheduledTasks />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AutomationHub;
