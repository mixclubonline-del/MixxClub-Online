import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Webhook, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const WebhookManager = () => {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState("");

  const webhooks = [
    { id: "1", url: "https://api.example.com/webhook", events: ["user.created", "payment.succeeded"], status: "active", lastDelivery: "2 min ago", successRate: 98 },
    { id: "2", url: "https://hooks.zapier.com/abc123", events: ["project.completed"], status: "active", lastDelivery: "15 min ago", successRate: 100 },
  ];

  const deliveryLogs = [
    { id: "1", event: "user.created", status: "success", timestamp: "2 minutes ago", responseTime: "245ms" },
    { id: "2", event: "payment.succeeded", status: "success", timestamp: "15 minutes ago", responseTime: "189ms" },
    { id: "3", event: "project.completed", status: "failed", timestamp: "1 hour ago", responseTime: "timeout" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Webhook Manager
        </CardTitle>
        <CardDescription>Configure webhook endpoints and monitor delivery</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Input
            placeholder="https://your-api.com/webhook"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
          />
          <Button
            onClick={() => {
              toast({ title: "Webhook added", description: "New webhook endpoint configured" });
              setWebhookUrl("");
            }}
            disabled={!webhookUrl}
          >
            Add Webhook
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Active Webhooks</h3>
          {webhooks.map((webhook) => (
            <Card key={webhook.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="font-mono text-sm">{webhook.url}</div>
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Badge variant={webhook.status === "active" ? "default" : "secondary"}>
                    {webhook.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">
                    Last delivery: {webhook.lastDelivery} • {webhook.successRate}% success rate
                  </div>
                  <Button size="sm" variant="outline">Configure</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Recent Deliveries</h3>
          {deliveryLogs.map((log) => (
            <Card key={log.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {log.status === "success" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <div>
                    <div className="font-medium text-sm">{log.event}</div>
                    <div className="text-xs text-muted-foreground">
                      {log.timestamp} • {log.responseTime}
                    </div>
                  </div>
                </div>
                {log.status === "failed" && (
                  <Button size="sm" variant="ghost">
                    <RefreshCw className="h-4 w-4" />
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
