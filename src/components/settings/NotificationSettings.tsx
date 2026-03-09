import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

interface UserPrefs {
  email_notifications: boolean;
  push_notifications: boolean;
  notification_frequency: string;
}

export function NotificationSettings() {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<UserPrefs>({
    email_notifications: true,
    push_notifications: true,
    notification_frequency: 'realtime',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPrefs();
  }, []);

  const loadPrefs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('email_notifications, push_notifications, notification_frequency')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setPrefs({
          email_notifications: data.email_notifications ?? true,
          push_notifications: data.push_notifications ?? true,
          notification_frequency: data.notification_frequency ?? 'realtime',
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePref = async (key: keyof UserPrefs, value: any) => {
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...newPrefs,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({ title: 'Preferences saved' });
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save preferences',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading preferences...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications" className="font-medium">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive project updates, messages, and payment confirmations via email
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={prefs.email_notifications}
              onCheckedChange={(checked) => updatePref('email_notifications', checked)}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Push Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-notifications" className="font-medium">Browser Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get real-time alerts in your browser for new messages and project activity
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={prefs.push_notifications}
              onCheckedChange={(checked) => updatePref('push_notifications', checked)}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Notification Frequency</h3>
        <RadioGroup
          value={prefs.notification_frequency}
          onValueChange={(value) => updatePref('notification_frequency', value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="realtime" id="freq-realtime" />
            <Label htmlFor="freq-realtime" className="cursor-pointer">
              <div>
                <span className="font-medium">Real-time</span>
                <p className="text-sm text-muted-foreground">Instant notifications as events happen</p>
              </div>
            </Label>
          </div>
          <Separator className="my-2" />
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="daily" id="freq-daily" />
            <Label htmlFor="freq-daily" className="cursor-pointer">
              <div>
                <span className="font-medium">Daily Digest</span>
                <p className="text-sm text-muted-foreground">One summary email per day</p>
              </div>
            </Label>
          </div>
          <Separator className="my-2" />
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="weekly" id="freq-weekly" />
            <Label htmlFor="freq-weekly" className="cursor-pointer">
              <div>
                <span className="font-medium">Weekly Recap</span>
                <p className="text-sm text-muted-foreground">Weekly summary of all activity</p>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </Card>
    </div>
  );
}
