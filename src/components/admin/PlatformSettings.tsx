import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, Globe, Shield, Bell, Mail, 
  Database, Zap, DollarSign, Users
} from "lucide-react";

interface SettingGroup {
  title: string;
  description: string;
  icon: any;
  settings: Setting[];
}

interface Setting {
  key: string;
  label: string;
  type: 'toggle' | 'text' | 'number' | 'textarea' | 'select';
  value: any;
  description: string;
  options?: string[];
}

const settingGroups: SettingGroup[] = [
  {
    title: 'General Settings',
    description: 'Basic platform configuration',
    icon: Settings,
    settings: [
      {
        key: 'platform_name',
        label: 'Platform Name',
        type: 'text',
        value: 'MixxMatch',
        description: 'Display name for the platform'
      },
      {
        key: 'platform_description',
        label: 'Platform Description',
        type: 'textarea',
        value: 'Professional audio mixing and mastering platform',
        description: 'Short description of the platform'
      },
      {
        key: 'maintenance_mode',
        label: 'Maintenance Mode',
        type: 'toggle',
        value: false,
        description: 'Enable to show maintenance page to all users'
      },
      {
        key: 'registration_enabled',
        label: 'User Registration',
        type: 'toggle',
        value: true,
        description: 'Allow new users to register'
      }
    ]
  },
  {
    title: 'Security & Privacy',
    description: 'Security and privacy configuration',
    icon: Shield,
    settings: [
      {
        key: 'two_factor_required',
        label: 'Require 2FA',
        type: 'toggle',
        value: false,
        description: 'Require two-factor authentication for all users'
      },
      {
        key: 'session_timeout',
        label: 'Session Timeout (minutes)',
        type: 'number',
        value: 60,
        description: 'Automatic logout after inactivity'
      },
      {
        key: 'password_min_length',
        label: 'Minimum Password Length',
        type: 'number',
        value: 8,
        description: 'Minimum characters required for passwords'
      },
      {
        key: 'gdpr_compliance',
        label: 'GDPR Compliance Mode',
        type: 'toggle',
        value: true,
        description: 'Enable GDPR compliance features'
      }
    ]
  },
  {
    title: 'Email Configuration',
    description: 'Email and notification settings',
    icon: Mail,
    settings: [
      {
        key: 'email_notifications',
        label: 'Email Notifications',
        type: 'toggle',
        value: true,
        description: 'Send email notifications to users'
      },
      {
        key: 'from_email',
        label: 'From Email Address',
        type: 'text',
        value: 'noreply@mixxmatch.com',
        description: 'Sender email address for outgoing emails'
      },
      {
        key: 'from_name',
        label: 'From Name',
        type: 'text',
        value: 'MixxMatch Team',
        description: 'Sender name for outgoing emails'
      },
      {
        key: 'email_rate_limit',
        label: 'Email Rate Limit (per hour)',
        type: 'number',
        value: 100,
        description: 'Maximum emails sent per hour'
      }
    ]
  },
  {
    title: 'Payment & Billing',
    description: 'Payment processing configuration',
    icon: DollarSign,
    settings: [
      {
        key: 'payments_enabled',
        label: 'Payments Enabled',
        type: 'toggle',
        value: true,
        description: 'Enable payment processing'
      },
      {
        key: 'currency',
        label: 'Default Currency',
        type: 'select',
        value: 'USD',
        options: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
        description: 'Default currency for transactions'
      },
      {
        key: 'trial_period_days',
        label: 'Trial Period (days)',
        type: 'number',
        value: 14,
        description: 'Free trial duration for new subscriptions'
      },
      {
        key: 'auto_refund_enabled',
        label: 'Automatic Refunds',
        type: 'toggle',
        value: false,
        description: 'Enable automatic refund processing'
      }
    ]
  },
  {
    title: 'Performance & Limits',
    description: 'Performance and resource limits',
    icon: Zap,
    settings: [
      {
        key: 'max_file_size_mb',
        label: 'Max File Size (MB)',
        type: 'number',
        value: 500,
        description: 'Maximum file upload size'
      },
      {
        key: 'api_rate_limit',
        label: 'API Rate Limit (per minute)',
        type: 'number',
        value: 60,
        description: 'Maximum API requests per minute'
      },
      {
        key: 'cache_enabled',
        label: 'Enable Caching',
        type: 'toggle',
        value: true,
        description: 'Enable server-side caching'
      },
      {
        key: 'concurrent_projects',
        label: 'Max Concurrent Projects',
        type: 'number',
        value: 10,
        description: 'Maximum active projects per user'
      }
    ]
  }
];

export function PlatformSettings() {
  const getIcon = (Icon: any) => {
    return <Icon className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      {settingGroups.map((group) => {
        const Icon = group.icon;
        
        return (
          <Card key={group.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                {group.title}
              </CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {group.settings.map((setting) => (
                  <div
                    key={setting.key}
                    className="flex items-start justify-between gap-4 p-4 border rounded-lg bg-card"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <label className="font-medium text-sm">{setting.label}</label>
                        <Badge variant="outline" className="text-xs">
                          {setting.key}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {setting.description}
                      </p>
                    </div>

                    <div className="w-64">
                      {setting.type === 'toggle' && (
                        <Switch checked={setting.value as boolean} />
                      )}
                      
                      {setting.type === 'text' && (
                        <Input 
                          type="text" 
                          value={setting.value as string}
                          placeholder={setting.label}
                        />
                      )}
                      
                      {setting.type === 'number' && (
                        <Input 
                          type="number" 
                          value={setting.value as number}
                          placeholder={setting.label}
                        />
                      )}
                      
                      {setting.type === 'textarea' && (
                        <Textarea 
                          value={setting.value as string}
                          placeholder={setting.label}
                          rows={3}
                        />
                      )}
                      
                      {setting.type === 'select' && setting.options && (
                        <select 
                          className="w-full px-3 py-2 border rounded-md bg-background"
                          value={setting.value as string}
                        >
                          {setting.options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save All Changes</Button>
      </div>
    </div>
  );
}
