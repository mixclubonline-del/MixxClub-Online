/**
 * CRM Notification Preferences Panel
 * 
 * Category × Channel matrix with per-toggle persistence.
 * Follows GlassPanel design system.
 */

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Mail,
  Smartphone,
  Users,
  DollarSign,
  Music,
  MessageSquare,
  AlertTriangle,
  Megaphone,
  CalendarDays,
} from 'lucide-react';
import { GlassPanel } from '../design';
import { useAuth } from '@/hooks/useAuth';
import {
  useCRMNotificationPrefs,
  type NotifCategory,
  type NotifChannel,
} from '@/hooks/useCRMNotificationPrefs';

const CATEGORY_META: Record<NotifCategory, { icon: React.ElementType; label: string; description: string }> = {
  partnerships: { icon: Users, label: 'Partnerships', description: 'Invites, approvals, health alerts' },
  payments: { icon: DollarSign, label: 'Payments', description: 'Revenue splits, payouts, invoices' },
  projects: { icon: Music, label: 'Projects', description: 'Milestones, status changes, uploads' },
  messages: { icon: MessageSquare, label: 'Messages', description: 'DMs and collaboration chat' },
  health: { icon: AlertTriangle, label: 'Health Alerts', description: 'Partnership score warnings' },
};

const CHANNEL_META: Record<NotifChannel, { icon: React.ElementType; label: string }> = {
  email: { icon: Mail, label: 'Email' },
  push: { icon: Smartphone, label: 'Push' },
  in_app: { icon: Bell, label: 'In-App' },
};

const CATEGORIES: NotifCategory[] = ['partnerships', 'payments', 'projects', 'messages', 'health'];
const CHANNELS: NotifChannel[] = ['email', 'push', 'in_app'];

export const NotificationPrefsPanel = () => {
  const { user } = useAuth();
  const { prefs, loading, saving, updateCategoryChannel, updateExtra } = useCRMNotificationPrefs(user?.id);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Channel × Category Matrix */}
      <div className="space-y-1">
        {/* Column headers */}
        <div className="grid grid-cols-[1fr_repeat(3,60px)] md:grid-cols-[1fr_repeat(3,80px)] items-center gap-2 px-3 pb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</span>
          {CHANNELS.map(ch => {
            const { icon: Icon, label } = CHANNEL_META[ch];
            return (
              <div key={ch} className="flex flex-col items-center gap-0.5">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
              </div>
            );
          })}
        </div>

        {/* Category rows */}
        {CATEGORIES.map(cat => {
          const { icon: CatIcon, label, description } = CATEGORY_META[cat];
          return (
            <GlassPanel key={cat} padding="p-3" hoverable>
              <div className="grid grid-cols-[1fr_repeat(3,60px)] md:grid-cols-[1fr_repeat(3,80px)] items-center gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-1.5 rounded-md bg-primary/10 shrink-0">
                    <CatIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <Label className="text-sm font-medium block">{label}</Label>
                    <p className="text-[11px] text-muted-foreground truncate">{description}</p>
                  </div>
                </div>

                {CHANNELS.map(ch => (
                  <div key={ch} className="flex justify-center">
                    <Switch
                      checked={prefs[cat][ch]}
                      onCheckedChange={(v) => updateCategoryChannel(cat, ch, v)}
                      disabled={saving}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                ))}
              </div>
            </GlassPanel>
          );
        })}
      </div>

      <Separator className="bg-white/5" />

      {/* Extra preferences */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Megaphone className="w-3.5 h-3.5" />
          Marketing & Digests
        </h4>

        <GlassPanel padding="p-3" hoverable>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label className="text-sm cursor-pointer">Marketing Emails</Label>
                <p className="text-[11px] text-muted-foreground">Product updates and promotions</p>
              </div>
            </div>
            <Switch
              checked={prefs.marketing_email}
              onCheckedChange={(v) => updateExtra('marketing_email', v)}
              disabled={saving}
            />
          </div>
        </GlassPanel>

        <GlassPanel padding="p-3" hoverable>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label className="text-sm cursor-pointer">Weekly Digest</Label>
                <p className="text-[11px] text-muted-foreground">Summary of your weekly activity</p>
              </div>
            </div>
            <Switch
              checked={prefs.weekly_digest_email}
              onCheckedChange={(v) => updateExtra('weekly_digest_email', v)}
              disabled={saving}
            />
          </div>
        </GlassPanel>
      </div>

      {saving && (
        <Badge variant="secondary" className="text-xs animate-pulse">
          Saving...
        </Badge>
      )}
    </div>
  );
};
