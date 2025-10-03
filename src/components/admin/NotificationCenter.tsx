import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Bell, Settings, Smartphone, Mail, MessageSquare,
  CheckCircle, AlertTriangle, Info, Star
} from "lucide-react";

interface NotificationSetting {
  id: string;
  name: string;
  description: string;
  category: string;
  channels: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    sms: boolean;
  };
}

const notificationSettings: NotificationSetting[] = [
  {
    id: '1',
    name: 'New User Registration',
    description: 'Notify when a new user signs up',
    category: 'User Activity',
    channels: { email: true, push: false, inApp: true, sms: false }
  },
  {
    id: '2',
    name: 'Payment Received',
    description: 'Notify when a payment is successfully processed',
    category: 'Financial',
    channels: { email: true, push: true, inApp: true, sms: false }
  },
  {
    id: '3',
    name: 'Project Completed',
    description: 'Notify when a project reaches completion',
    category: 'Projects',
    channels: { email: true, push: true, inApp: true, sms: false }
  },
  {
    id: '4',
    name: 'Security Alert',
    description: 'Notify on suspicious activity or security events',
    category: 'Security',
    channels: { email: true, push: true, inApp: true, sms: true }
  },
  {
    id: '5',
    name: 'System Maintenance',
    description: 'Notify about scheduled system maintenance',
    category: 'System',
    channels: { email: true, push: true, inApp: true, sms: false }
  },
  {
    id: '6',
    name: 'Subscription Renewal',
    description: 'Notify before subscription renewals',
    category: 'Financial',
    channels: { email: true, push: false, inApp: true, sms: false }
  },
  {
    id: '7',
    name: 'New Feature Launch',
    description: 'Notify when new features are released',
    category: 'Product Updates',
    channels: { email: true, push: true, inApp: true, sms: false }
  },
  {
    id: '8',
    name: 'Support Ticket Response',
    description: 'Notify when support responds to a ticket',
    category: 'Support',
    channels: { email: true, push: true, inApp: true, sms: false }
  }
];

const recentNotifications = [
  {
    id: '1',
    type: 'success',
    title: 'Bulk email campaign completed',
    message: 'Successfully sent 1,250 emails with 68% open rate',
    timestamp: '5 minutes ago'
  },
  {
    id: '2',
    type: 'warning',
    title: 'High bounce rate detected',
    message: '15 emails bounced in the last hour - check email list quality',
    timestamp: '1 hour ago'
  },
  {
    id: '3',
    type: 'info',
    title: 'SMS credits running low',
    message: 'Only 150 SMS credits remaining - consider topping up',
    timestamp: '2 hours ago'
  },
  {
    id: '4',
    type: 'success',
    title: 'Template updated',
    message: 'Welcome Email template was successfully updated',
    timestamp: '3 hours ago'
  }
];

export function NotificationCenter() {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const categories = Array.from(new Set(notificationSettings.map(s => s.category)));

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure notification channels and preferences</CardDescription>
            </div>
            <Button>Save Changes</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Channel Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 border rounded-lg bg-card">
              <Mail className="h-5 w-5 mb-2 text-blue-500" />
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="text-2xl font-bold">8/8</div>
              <div className="text-xs text-muted-foreground mt-1">Enabled</div>
            </div>
            
            <div className="p-4 border rounded-lg bg-card">
              <Smartphone className="h-5 w-5 mb-2 text-green-500" />
              <div className="text-sm text-muted-foreground">Push</div>
              <div className="text-2xl font-bold">6/8</div>
              <div className="text-xs text-muted-foreground mt-1">Enabled</div>
            </div>
            
            <div className="p-4 border rounded-lg bg-card">
              <Bell className="h-5 w-5 mb-2 text-purple-500" />
              <div className="text-sm text-muted-foreground">In-App</div>
              <div className="text-2xl font-bold">8/8</div>
              <div className="text-xs text-muted-foreground mt-1">Enabled</div>
            </div>
            
            <div className="p-4 border rounded-lg bg-card">
              <MessageSquare className="h-5 w-5 mb-2 text-orange-500" />
              <div className="text-sm text-muted-foreground">SMS</div>
              <div className="text-2xl font-bold">1/8</div>
              <div className="text-xs text-muted-foreground mt-1">Enabled</div>
            </div>
          </div>

          {/* Settings by Category */}
          {categories.map((category) => (
            <div key={category} className="space-y-3">
              <h3 className="font-semibold text-lg">{category}</h3>
              <div className="space-y-2">
                {notificationSettings
                  .filter(s => s.category === category)
                  .map((setting) => (
                    <div
                      key={setting.id}
                      className="p-4 border rounded-lg bg-card"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h4 className="font-medium mb-1">{setting.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {setting.description}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-4">
                        <label className="flex items-center justify-between p-2 border rounded bg-muted/50">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">Email</span>
                          </div>
                          <Switch checked={setting.channels.email} />
                        </label>

                        <label className="flex items-center justify-between p-2 border rounded bg-muted/50">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Push</span>
                          </div>
                          <Switch checked={setting.channels.push} />
                        </label>

                        <label className="flex items-center justify-between p-2 border rounded bg-muted/50">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-purple-500" />
                            <span className="text-sm">In-App</span>
                          </div>
                          <Switch checked={setting.channels.inApp} />
                        </label>

                        <label className="flex items-center justify-between p-2 border rounded bg-muted/50">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-orange-500" />
                            <span className="text-sm">SMS</span>
                          </div>
                          <Switch checked={setting.channels.sms} />
                        </label>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>System notifications and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentNotifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start gap-3 p-3 border rounded-lg bg-card"
              >
                {getNotificationIcon(notification.type)}
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{notification.title}</h4>
                  <p className="text-sm text-muted-foreground mb-1">
                    {notification.message}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {notification.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
