import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface PushNotificationToken {
  value: string;
  platform: 'ios' | 'android' | 'web';
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isRegistering, setIsRegistering] = useState(false);

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = async () => {
      if (Capacitor.isNativePlatform()) {
        setIsSupported(true);
      } else if ('Notification' in window && 'serviceWorker' in navigator) {
        setIsSupported(true);
        const status = Notification.permission;
        setPermissionStatus(status === 'default' ? 'prompt' : status);
      }
    };
    checkSupport();
  }, []);

  // Register for push notifications
  const registerPushNotifications = useCallback(async () => {
    if (!user || !isSupported || isRegistering) return;

    setIsRegistering(true);

    try {
      if (Capacitor.isNativePlatform()) {
        const permission = await PushNotifications.requestPermissions();
        
        if (permission.receive === 'granted') {
          setPermissionStatus('granted');
          await PushNotifications.register();
          
          PushNotifications.addListener('registration', async (tokenData) => {
            console.log('Push registration success:', tokenData.value);
            setToken(tokenData.value);
            await saveTokenToDatabase(tokenData.value, Capacitor.getPlatform() as 'ios' | 'android');
            await Haptics.impact({ style: ImpactStyle.Light });
            toast.success('Push notifications enabled!');
          });

          PushNotifications.addListener('registrationError', (error) => {
            console.error('Push registration error:', error);
            toast.error('Failed to enable push notifications');
          });

          PushNotifications.addListener('pushNotificationReceived', async (notification) => {
            console.log('Push notification received:', notification);
            await Haptics.impact({ style: ImpactStyle.Medium });
            toast.info(notification.title || 'New notification', {
              description: notification.body,
            });
          });

          PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            const data = notification.notification.data;
            if (data?.action_url) {
              window.location.href = data.action_url;
            }
          });
        } else {
          setPermissionStatus('denied');
          toast.error('Push notification permission denied');
        }
      } else if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setPermissionStatus(permission === 'default' ? 'prompt' : permission);
        
        if (permission === 'granted') {
          toast.success('Browser notifications enabled!');
        } else {
          toast.error('Browser notification permission denied');
        }
      }
    } catch (error) {
      console.error('Push registration error:', error);
      toast.error('Failed to enable push notifications');
    } finally {
      setIsRegistering(false);
    }
  }, [user, isSupported, isRegistering]);

  const saveTokenToDatabase = async (pushToken: string, platform: 'ios' | 'android' | 'web') => {
    if (!user) return;

    try {
      // Direct insert with type assertion for new table
      const { error } = await (supabase as any)
        .from('push_tokens')
        .upsert({
          user_id: user.id,
          token: pushToken,
          platform,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,token' });

      if (error) console.error('Error saving push token:', error);
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  };

  const unregisterPushNotifications = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      await PushNotifications.removeAllListeners();
    }
    
    if (user && token) {
      await (supabase as any)
        .from('push_tokens')
        .delete()
        .eq('user_id', user.id)
        .eq('token', token);
    }
    
    setToken(null);
  }, [user, token]);

  // Legacy compatibility
  const requestPermission = registerPushNotifications;
  const permission = permissionStatus === 'granted' ? 'granted' as NotificationPermission : 
                    permissionStatus === 'denied' ? 'denied' as NotificationPermission : 'default' as NotificationPermission;

  return {
    token,
    isSupported,
    permissionStatus,
    isRegistering,
    registerPushNotifications,
    unregisterPushNotifications,
    // Legacy compatibility
    permission,
    isSubscribed: permissionStatus === 'granted',
    requestPermission,
  };
};
