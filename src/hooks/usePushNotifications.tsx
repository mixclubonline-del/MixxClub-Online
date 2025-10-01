import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications not supported');
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === 'granted') {
      toast.success('Notifications enabled');
      return true;
    }

    return false;
  };

  return {
    permission,
    isSubscribed: permission === 'granted',
    requestPermission,
  };
};
