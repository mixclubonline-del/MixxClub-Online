import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useCRMNotificationPrefs, type NotifCategory, type NotifChannel } from '@/hooks/useCRMNotificationPrefs';

const CATEGORY_META: Record<NotifCategory, { label: string; description: string }> = {
  partnerships: { label: 'Partnerships & Follows', description: 'Collaboration invites, session requests, new followers' },
  payments: { label: 'Payment Notifications', description: 'Invoices, payments received, revenue splits' },
  projects: { label: 'Project Updates', description: 'Status changes, milestones, deliverables' },
  messages: { label: 'Messages', description: 'New direct messages from collaborators' },
  health: { label: 'Partnership Health', description: 'Health score alerts and warnings' },
};

const CHANNEL_ICONS: Record<NotifChannel, typeof Mail> = {
  email: Mail,
  push: Smartphone,
  in_app: Bell,
};

const CHANNEL_LABELS: Record<NotifChannel, string> = {
  email: 'Email',
  push: 'Push',
  in_app: 'In-App',
};

export function NotificationPreferences() {
  const { user } = useAuth();
  const { prefs, loading, saving, updateCategoryChannel, updateExtra } = useCRMNotificationPrefs(user?.id);

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
            Control which notifications you receive and how they're delivered
          </p>
        </div>

        <Separator />

        {/* Category × Channel Grid */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-5 h-5" />
            <h3 className="text-lg font-semibold">By Category</h3>
          </div>

          {(Object.keys(CATEGORY_META) as NotifCategory[]).map(cat => (
            <div key={cat} className="space-y-3">
              <div>
                <Label className="text-base font-medium">{CATEGORY_META[cat].label}</Label>
                <p className="text-sm text-muted-foreground">{CATEGORY_META[cat].description}</p>
              </div>
              <div className="flex items-center gap-6 pl-4">
                {(Object.keys(CHANNEL_ICONS) as NotifChannel[]).map(ch => {
                  const Icon = CHANNEL_ICONS[ch];
                  return (
                    <div key={ch} className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <Label htmlFor={`${cat}-${ch}`} className="text-sm cursor-pointer">
                        {CHANNEL_LABELS[ch]}
                      </Label>
                      <Switch
                        id={`${cat}-${ch}`}
                        checked={prefs[cat][ch]}
                        onCheckedChange={(checked) => updateCategoryChannel(cat, ch, checked)}
                        disabled={saving}
                      />
                    </div>
                  );
                })}
              </div>
              <Separator className="mt-2" />
            </div>
          ))}
        </div>

        {/* Marketing & Digest */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Marketing & Updates</h3>
          </div>

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
              checked={prefs.marketing_email}
              onCheckedChange={(checked) => updateExtra('marketing_email', checked)}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="weekly-digest" className="cursor-pointer">
                Daily Digest
              </Label>
              <p className="text-sm text-muted-foreground">
                Summary of your unread notifications delivered to your inbox
              </p>
            </div>
            <Switch
              id="weekly-digest"
              checked={prefs.weekly_digest_email}
              onCheckedChange={(checked) => updateExtra('weekly_digest_email', checked)}
              disabled={saving}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
