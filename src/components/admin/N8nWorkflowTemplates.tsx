import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Workflow, Download, Copy, ExternalLink, 
  Calendar, FolderKanban, Star, Users, 
  CheckCircle, Code
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  sessionEventsWorkflow, 
  projectEventsWorkflow, 
  reviewEventsWorkflow, 
  referralEventsWorkflow 
} from "@/lib/n8n-templates";

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  events: string[];
  actions: string[];
  workflow: object;
}

const templates: WorkflowTemplate[] = [
  {
    id: "session",
    name: "Session Events",
    description: "Handle session booking, starting, completion, and cancellation",
    icon: <Calendar className="h-5 w-5" />,
    events: ["session.booked", "session.started", "session.completed", "session.cancelled"],
    actions: ["Send confirmation emails", "Award XP", "Trigger reviews", "Release payments"],
    workflow: sessionEventsWorkflow,
  },
  {
    id: "project",
    name: "Project Events",
    description: "Automate project creation, uploads, revisions, and completion",
    icon: <FolderKanban className="h-5 w-5" />,
    events: ["project.created", "project.uploaded", "project.revision_requested", "project.completed"],
    actions: ["Notify engineers", "Award XP", "Unlock achievements", "Start email sequences"],
    workflow: projectEventsWorkflow,
  },
  {
    id: "review",
    name: "Review Events",
    description: "Process review submissions and responses",
    icon: <Star className="h-5 w-5" />,
    events: ["review.submitted", "review.responded"],
    actions: ["Award reviewer XP", "Notify reviewed user", "Bonus XP for 5-stars"],
    workflow: reviewEventsWorkflow,
  },
  {
    id: "referral",
    name: "Referral Events",
    description: "Track referral signups and conversions",
    icon: <Users className="h-5 w-5" />,
    events: ["referral.created", "referral.signup", "referral.converted"],
    actions: ["Award XP", "Unlock achievements", "Send celebrations", "Track analytics"],
    workflow: referralEventsWorkflow,
  },
];

export const N8nWorkflowTemplates = () => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);

  const downloadWorkflow = (template: WorkflowTemplate) => {
    const jsonStr = JSON.stringify(template.workflow, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mixclub-${template.id}-workflow.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: `${template.name} workflow exported`,
    });
  };

  const copyToClipboard = async (template: WorkflowTemplate) => {
    const jsonStr = JSON.stringify(template.workflow, null, 2);
    await navigator.clipboard.writeText(jsonStr);
    toast({
      title: "Copied",
      description: "Workflow JSON copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Workflow className="h-6 w-6 text-primary" />
            n8n Workflow Templates
          </h2>
          <p className="text-muted-foreground">
            Pre-built automation templates for n8n integration
          </p>
        </div>
        <Button variant="outline" asChild>
          <a href="https://n8n.io/docs" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            n8n Docs
          </a>
        </Button>
      </div>

      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Code className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">How to Use These Templates</h3>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Download or copy the workflow JSON</li>
                <li>In n8n, go to Workflows → Import from File (or paste JSON)</li>
                <li>Configure your webhook URL in MixClub settings</li>
                <li>Optionally add your N8N_WEBHOOK_SECRET for signature verification</li>
                <li>Activate the workflow in n8n</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {template.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">EVENTS</p>
                <div className="flex flex-wrap gap-1">
                  {template.events.map((event) => (
                    <Badge key={event} variant="secondary" className="text-xs">
                      {event}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">ACTIONS</p>
                <ul className="text-sm space-y-1">
                  {template.actions.map((action, i) => (
                    <li key={i} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => downloadWorkflow(template)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => copyToClipboard(template)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>{template.name} - JSON Preview</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[60vh]">
                      <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
                        {JSON.stringify(template.workflow, null, 2)}
                      </pre>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Webhook Configuration</CardTitle>
          <CardDescription>
            Configure these settings in your n8n workflows
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Webhook URL</p>
              <code className="block p-2 bg-muted rounded text-xs break-all">
                https://kbbrehnyqpulbxyesril.supabase.co/functions/v1/n8n-webhook-handler
              </code>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Headers (for signature verification)</p>
              <code className="block p-2 bg-muted rounded text-xs">
                x-webhook-timestamp: {"{timestamp}"}<br />
                x-webhook-signature: {"{hmac_sha256}"}<br />
                Content-Type: application/json
              </code>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Signature Calculation</p>
            <code className="block p-2 bg-muted rounded text-xs">
              HMAC-SHA256(secret, "{"{timestamp}.{body}"}")
            </code>
            <p className="text-xs text-muted-foreground">
              Note: Signature verification is optional. If N8N_WEBHOOK_SECRET is not configured, webhooks will be accepted without verification.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
