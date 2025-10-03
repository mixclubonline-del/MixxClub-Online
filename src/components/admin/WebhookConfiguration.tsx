import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Webhook, Play, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  lastTriggered: string;
  successRate: number;
}

const availableEvents = [
  'user.created',
  'user.updated',
  'project.created',
  'project.completed',
  'payment.succeeded',
  'payment.failed',
  'subscription.created',
  'subscription.cancelled',
];

const demoWebhooks: WebhookEndpoint[] = [
  {
    id: '1',
    url: 'https://api.example.com/webhooks/mixclub',
    events: ['payment.succeeded', 'project.completed'],
    status: 'active',
    lastTriggered: '2 hours ago',
    successRate: 98.5
  },
  {
    id: '2',
    url: 'https://analytics.example.com/track',
    events: ['user.created', 'subscription.created'],
    status: 'active',
    lastTriggered: '5 hours ago',
    successRate: 100
  },
];

export function WebhookConfiguration() {
  const [webhooks, setWebhooks] = useState(demoWebhooks);
  const [newUrl, setNewUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const toggleEvent = (event: string) => {
    setSelectedEvents(prev =>
      prev.includes(event)
        ? prev.filter(e => e !== event)
        : [...prev, event]
    );
  };

  const createWebhook = () => {
    if (!newUrl) {
      toast.error('Please enter a webhook URL');
      return;
    }
    if (selectedEvents.length === 0) {
      toast.error('Please select at least one event');
      return;
    }

    const newWebhook: WebhookEndpoint = {
      id: Date.now().toString(),
      url: newUrl,
      events: selectedEvents,
      status: 'active',
      lastTriggered: 'Never',
      successRate: 0
    };

    setWebhooks([...webhooks, newWebhook]);
    setNewUrl('');
    setSelectedEvents([]);
    toast.success('Webhook endpoint created');
  };

  const testWebhook = (webhook: WebhookEndpoint) => {
    toast.success(`Testing webhook: ${webhook.url}`);
  };

  const deleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter(w => w.id !== id));
    toast.success('Webhook endpoint deleted');
  };

  const toggleWebhookStatus = (id: string) => {
    setWebhooks(webhooks.map(w =>
      w.id === id ? { ...w, status: w.status === 'active' ? 'inactive' as const : 'active' as const } : w
    ));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Add Webhook Endpoint
          </CardTitle>
          <CardDescription>Configure webhooks to receive real-time event notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Endpoint URL</label>
            <Input
              placeholder="https://your-domain.com/webhooks"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Select Events to Subscribe</label>
            <div className="grid gap-3 md:grid-cols-2">
              {availableEvents.map((event) => (
                <div
                  key={event}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <Checkbox
                    checked={selectedEvents.includes(event)}
                    onCheckedChange={() => toggleEvent(event)}
                  />
                  <span className="text-sm font-mono">{event}</span>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={createWebhook} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Create Webhook
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Webhooks</CardTitle>
          <CardDescription>Manage your webhook endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <div
                key={webhook.id}
                className="p-4 rounded-lg border bg-card"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={webhook.status === 'active' ? 'default' : 'secondary'}>
                        {webhook.status}
                      </Badge>
                      <Badge variant="outline" className={
                        webhook.successRate >= 95 ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                      }>
                        {webhook.successRate}% success
                      </Badge>
                    </div>
                    <div className="font-mono text-sm mb-2">{webhook.url}</div>
                    <div className="text-xs text-muted-foreground">
                      Last triggered {webhook.lastTriggered}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testWebhook(webhook)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteWebhook(webhook.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {webhook.events.map(event => (
                    <Badge key={event} variant="outline" className="font-mono text-xs">
                      {event}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
