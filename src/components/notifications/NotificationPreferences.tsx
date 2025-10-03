import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  in_app_notifications: boolean;
  project_updates: boolean;
  payment_notifications: boolean;
  message_notifications: boolean;
  marketing_emails: boolean;
  weekly_digest: boolean;
}

export function NotificationPreferences() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: true,
    in_app_notifications: true,
    project_updates: true,
    payment_notifications: true,
    message_notifications: true,
    marketing_emails: false,
    weekly_digest: true,
  });

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (data?.notification_preferences) {
        setSettings({ ...settings, ...(data.notification_preferences as any) });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles' as any)
        .update({ notification_preferences: settings })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: 'Preferences saved',
        description: 'Your notification preferences have been updated',
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save preferences',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Notification Preferences</h2>
          <p className="text-muted-foreground">
            Manage how you receive notifications and updates
          </p>
        </div>

        <Separator />

        {/* Channel Preferences */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Notification Channels</h3>
          </div>

          <div className="space-y-4 pl-7">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="email-notifications" className="cursor-pointer">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.email_notifications}
                onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="push-notifications" className="cursor-pointer">
                    Push Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications on your device
                  </p>
                </div>
              </div>
              <Switch
                id="push-notifications"
                checked={settings.push_notifications}
                onCheckedChange={(checked) => updateSetting('push_notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="in-app-notifications" className="cursor-pointer">
                    In-App Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show notifications while using the app
                  </p>
                </div>
              </div>
              <Switch
                id="in-app-notifications"
                checked={settings.in_app_notifications}
                onCheckedChange={(checked) => updateSetting('in_app_notifications', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Content Preferences */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Notification Types</h3>
          </div>

          <div className="space-y-4 pl-7">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="project-updates" className="cursor-pointer">
                  Project Updates
                </Label>
                <p className="text-sm text-muted-foreground">
                  Status changes, file uploads, and project milestones
                </p>
              </div>
              <Switch
                id="project-updates"
                checked={settings.project_updates}
                onCheckedChange={(checked) => updateSetting('project_updates', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="payment-notifications" className="cursor-pointer">
                  Payment Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Invoices, payments received, and payment confirmations
                </p>
              </div>
              <Switch
                id="payment-notifications"
                checked={settings.payment_notifications}
                onCheckedChange={(checked) => updateSetting('payment_notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="message-notifications" className="cursor-pointer">
                  Message Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  New messages from collaborators
                </p>
              </div>
              <Switch
                id="message-notifications"
                checked={settings.message_notifications}
                onCheckedChange={(checked) => updateSetting('message_notifications', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Marketing Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Marketing & Updates</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="marketing-emails" className="cursor-pointer">
                  Marketing Emails
                </Label>
                <p className="text-sm text-muted-foreground">
                  Product updates, tips, and promotional offers
                </p>
              </div>
              <Switch
                id="marketing-emails"
                checked={settings.marketing_emails}
                onCheckedChange={(checked) => updateSetting('marketing_emails', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weekly-digest" className="cursor-pointer">
                  Weekly Digest
                </Label>
                <p className="text-sm text-muted-foreground">
                  Weekly summary of your activity and updates
                </p>
              </div>
              <Switch
                id="weekly-digest"
                checked={settings.weekly_digest}
                onCheckedChange={(checked) => updateSetting('weekly_digest', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        <Button onClick={savePreferences} disabled={saving} className="w-full">
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </Card>
  );
}
