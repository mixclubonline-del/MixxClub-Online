import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Plus, Play, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WorkflowStep {
  id: string;
  type: "trigger" | "condition" | "action";
  config: any;
}

export const WorkflowBuilder = () => {
  const { toast } = useToast();
  const [workflowName, setWorkflowName] = useState("");
  const [steps, setSteps] = useState<WorkflowStep[]>([]);

  const addStep = (type: WorkflowStep["type"]) => {
    setSteps([...steps, { id: Math.random().toString(), type, config: {} }]);
  };

  const templates = [
    { name: "New User Welcome", description: "Send welcome email + assign onboarding tasks" },
    { name: "Payment Received", description: "Update subscription + send receipt + notify team" },
    { name: "Project Completed", description: "Request review + process payout + archive files" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Workflow Builder
        </CardTitle>
        <CardDescription>Create automated workflows with triggers, conditions, and actions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Workflow Name</label>
            <Input
              placeholder="e.g., Onboard New Users"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Workflow Steps</label>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <Card key={step.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge>{step.type}</Badge>
                      <Select defaultValue={step.type}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {step.type === "trigger" && (
                            <>
                              <SelectItem value="user_signup">User Signup</SelectItem>
                              <SelectItem value="payment_received">Payment Received</SelectItem>
                              <SelectItem value="project_completed">Project Completed</SelectItem>
                            </>
                          )}
                          {step.type === "condition" && (
                            <>
                              <SelectItem value="if_premium">If Premium User</SelectItem>
                              <SelectItem value="if_first_time">If First Time</SelectItem>
                              <SelectItem value="if_amount_over">If Amount Over</SelectItem>
                            </>
                          )}
                          {step.type === "action" && (
                            <>
                              <SelectItem value="send_email">Send Email</SelectItem>
                              <SelectItem value="create_task">Create Task</SelectItem>
                              <SelectItem value="update_db">Update Database</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSteps(steps.filter((s) => s.id !== step.id))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={() => addStep("trigger")} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Trigger
              </Button>
              <Button onClick={() => addStep("condition")} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Condition
              </Button>
              <Button onClick={() => addStep("action")} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Action
              </Button>
            </div>
          </div>

          <Button
            onClick={() => {
              toast({ title: "Workflow saved", description: `"${workflowName}" is now active` });
              setWorkflowName("");
              setSteps([]);
            }}
            disabled={!workflowName || steps.length === 0}
            className="w-full"
          >
            Save Workflow
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Pre-built Templates</h3>
          {templates.map((template, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
                <Button size="sm" variant="outline">
                  <Play className="mr-2 h-4 w-4" />
                  Use Template
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
