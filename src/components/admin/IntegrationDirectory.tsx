import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Settings } from "lucide-react";
import { toast } from "sonner";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'connected' | 'available';
  icon: string;
}

const integrations: Integration[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing and subscription management',
    category: 'Payments',
    status: 'connected',
    icon: '💳'
  },
  {
    id: 'mailgun',
    name: 'Mailgun',
    description: 'Transactional email delivery service',
    category: 'Email',
    status: 'connected',
    icon: '📧'
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'SMS notifications and phone verification',
    category: 'Communication',
    status: 'available',
    icon: '📱'
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team notifications and alerts',
    category: 'Communication',
    status: 'available',
    icon: '💬'
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Website analytics and user tracking',
    category: 'Analytics',
    status: 'connected',
    icon: '📊'
  },
  {
    id: 'mixpanel',
    name: 'Mixpanel',
    description: 'Product analytics and user insights',
    category: 'Analytics',
    status: 'available',
    icon: '📈'
  },
  {
    id: 'aws-s3',
    name: 'AWS S3',
    description: 'Cloud file storage and CDN',
    category: 'Storage',
    status: 'connected',
    icon: '☁️'
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    description: 'CDN, DDoS protection, and DNS',
    category: 'Infrastructure',
    status: 'connected',
    icon: '🛡️'
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect to 5000+ apps with automation',
    category: 'Automation',
    status: 'available',
    icon: '⚡'
  },
  {
    id: 'intercom',
    name: 'Intercom',
    description: 'Customer messaging and support',
    category: 'Support',
    status: 'available',
    icon: '💭'
  },
];

export function IntegrationDirectory() {
  const handleConnect = (integration: Integration) => {
    if (integration.status === 'connected') {
      toast.info(`${integration.name} is already connected`);
    } else {
      toast.success(`Connecting to ${integration.name}...`);
    }
  };

  const categories = Array.from(new Set(integrations.map(i => i.category)));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Integration Directory</CardTitle>
          <CardDescription>Connect third-party services to extend functionality</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <div className="p-4 rounded-lg border bg-card">
              <div className="text-sm text-muted-foreground mb-1">Connected</div>
              <div className="text-2xl font-bold">
                {integrations.filter(i => i.status === 'connected').length}
              </div>
            </div>
            
            <div className="p-4 rounded-lg border bg-card">
              <div className="text-sm text-muted-foreground mb-1">Available</div>
              <div className="text-2xl font-bold">
                {integrations.filter(i => i.status === 'available').length}
              </div>
            </div>
          </div>

          {categories.map(category => (
            <div key={category} className="mb-6">
              <h3 className="text-lg font-semibold mb-3">{category}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {integrations
                  .filter(i => i.category === category)
                  .map((integration) => (
                    <div
                      key={integration.id}
                      className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{integration.icon}</div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{integration.name}</h4>
                              {integration.status === 'connected' ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {integration.description}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant={integration.status === 'connected' ? 'default' : 'outline'}>
                          {integration.status}
                        </Badge>
                        <Button
                          variant={integration.status === 'connected' ? 'outline' : 'default'}
                          size="sm"
                          onClick={() => handleConnect(integration)}
                          className="gap-2"
                        >
                          {integration.status === 'connected' ? (
                            <>
                              <Settings className="h-4 w-4" />
                              Configure
                            </>
                          ) : (
                            'Connect'
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
