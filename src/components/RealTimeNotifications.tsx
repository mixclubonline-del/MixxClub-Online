import { useState, useEffect } from 'react';
import { Bell, User, Music, MessageCircle, Award, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'collaboration' | 'message' | 'achievement' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  avatar?: string;
  actionUrl?: string;
}

interface RealTimeNotificationsProps {
  userId?: string;
  className?: string;
}

export const RealTimeNotifications = ({ userId, className }: RealTimeNotificationsProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Simulate real-time notifications
  useEffect(() => {
    const simulateNotifications = () => {
      const notificationTypes = [
        {
          type: 'collaboration' as const,
          title: 'New collaboration request',
          message: 'Sarah K. wants to collaborate on Midnight Dreams',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
        },
        {
          type: 'message' as const,
          title: 'New message from Alex R.',
          message: 'The mix is sounding great! Just made some EQ adjustments.',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex'
        },
        {
          type: 'achievement' as const,
          title: 'Achievement unlocked!',
          message: 'You have earned the Mix Master badge for 50 completed tracks!',
          avatar: ''
        },
        {
          type: 'system' as const,
          title: 'AI Analysis Complete',
          message: 'Your track Urban Nights has been analyzed. 4 stems generated.',
          avatar: ''
        }
      ];

      const randomNotification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      
      const newNotification: Notification = {
        id: Date.now().toString(),
        ...randomNotification,
        timestamp: new Date(),
        read: false,
        actionUrl: '/dashboard'
      };

      setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
      setUnreadCount(prev => prev + 1);

      // Show toast for new notification
      toast.success(randomNotification.title, {
        description: randomNotification.message,
        duration: 4000,
      });
    };

    // Simulate notifications every 15-30 seconds
    const interval = setInterval(simulateNotifications, Math.random() * 15000 + 15000);

    // Add initial notifications
    setTimeout(simulateNotifications, 2000);
    setTimeout(simulateNotifications, 5000);

    return () => clearInterval(interval);
  }, []);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'collaboration':
        return <User className="w-4 h-4 text-primary" />;
      case 'message':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'achievement':
        return <Award className="w-4 h-4 text-yellow-500" />;
      case 'system':
        return <Zap className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 z-50 shadow-lg border bg-card">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </div>

          <ScrollArea className="h-96">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {notification.avatar ? (
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={notification.avatar} />
                            <AvatarFallback className="text-xs">
                              {notification.title[0]}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimeAgo(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {notifications.length > 0 && (
            <div className="p-3 border-t">
              <Button variant="ghost" size="sm" className="w-full text-xs">
                View all notifications
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};