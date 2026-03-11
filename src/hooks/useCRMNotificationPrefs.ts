import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type NotifCategory = 'partnerships' | 'payments' | 'projects' | 'messages' | 'health';
export type NotifChannel = 'email' | 'push' | 'in_app';

export type CategoryChannelPrefs = Record<NotifCategory, Record<NotifChannel, boolean>>;

export interface CRMNotifPrefs extends CategoryChannelPrefs {
  marketing_email: boolean;
  weekly_digest_email: boolean;
}

const DEFAULT_PREFS: CRMNotifPrefs = {
  partnerships: { email: true, push: true, in_app: true },
  payments: { email: true, push: true, in_app: true },
  projects: { email: true, push: true, in_app: true },
  messages: { email: false, push: true, in_app: true },
  health: { email: true, push: true, in_app: true },
  marketing_email: false,
  weekly_digest_email: true,
};

const CATEGORIES: NotifCategory[] = ['partnerships', 'payments', 'projects', 'messages', 'health'];
const CHANNELS: NotifChannel[] = ['email', 'push', 'in_app'];

/** Maps DB column names to our nested structure */
function dbRowToPrefs(row: Record<string, unknown>): CRMNotifPrefs {
  const prefs = structuredClone(DEFAULT_PREFS);

  for (const cat of CATEGORIES) {
    for (const ch of CHANNELS) {
      const col = `${cat}_${ch}`;
      if (col in row && typeof row[col] === 'boolean') {
        prefs[cat][ch] = row[col] as boolean;
      }
    }
  }

  if (typeof row.marketing_email === 'boolean') prefs.marketing_email = row.marketing_email;
  if (typeof row.weekly_digest_email === 'boolean') prefs.weekly_digest_email = row.weekly_digest_email;

  return prefs;
}

function prefsToDbRow(prefs: CRMNotifPrefs): Record<string, boolean> {
  const row: Record<string, boolean> = {};
  for (const cat of CATEGORIES) {
    for (const ch of CHANNELS) {
      row[`${cat}_${ch}`] = prefs[cat][ch];
    }
  }
  row.marketing_email = prefs.marketing_email;
  row.weekly_digest_email = prefs.weekly_digest_email;
  return row;
}

export function useCRMNotificationPrefs(userId: string | undefined) {
  const [prefs, setPrefs] = useState<CRMNotifPrefs>(structuredClone(DEFAULT_PREFS));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) setPrefs(dbRowToPrefs(data as Record<string, unknown>));
    } catch (err) {
      console.error('Failed to load notification prefs:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const updateCategoryChannel = useCallback(async (
    category: NotifCategory,
    channel: NotifChannel,
    value: boolean
  ) => {
    if (!userId) return;
    
    const newPrefs = structuredClone(prefs);
    newPrefs[category][channel] = value;
    setPrefs(newPrefs);

    setSaving(true);
    try {
      const col = `${category}_${channel}`;
      const { data: existing } = await supabase
        .from('notification_preferences')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('notification_preferences')
          .update({ [col]: value, updated_at: new Date().toISOString() } as any)
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notification_preferences')
          .insert({ user_id: userId, [col]: value } as any);
        if (error) throw error;
      }
    } catch (err) {
      console.error('Failed to update pref:', err);
      toast.error('Failed to save preference');
      // Revert
      const reverted = structuredClone(prefs);
      reverted[category][channel] = !value;
      setPrefs(reverted);
    } finally {
      setSaving(false);
    }
  }, [userId, prefs]);

  const updateExtra = useCallback(async (
    key: 'marketing_email' | 'weekly_digest_email',
    value: boolean
  ) => {
    if (!userId) return;

    setPrefs(prev => ({ ...prev, [key]: value }));
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from('notification_preferences')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('notification_preferences')
          .update({ [key]: value, updated_at: new Date().toISOString() } as any)
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notification_preferences')
          .insert({ user_id: userId, [key]: value } as any);
        if (error) throw error;
      }
    } catch (err) {
      console.error('Failed to update pref:', err);
      toast.error('Failed to save preference');
      setPrefs(prev => ({ ...prev, [key]: !value }));
    } finally {
      setSaving(false);
    }
  }, [userId]);

  return { prefs, loading, saving, updateCategoryChannel, updateExtra };
}
