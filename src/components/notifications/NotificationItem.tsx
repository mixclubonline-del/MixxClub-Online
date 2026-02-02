import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCircle, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Notification } from '@/hooks/useNotifications';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAction = () => {
    if (notification.action_url) {
      if (!notification.is_read) {
        onMarkAsRead(notification.id);
      }
      navigate(notification.action_url);
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    await onDelete(notification.id);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'collaboration_invite':
        return 'text-blue-500';
      case 'payment':
        return 'text-green-500';
      case 'system':
        return 'text-yellow-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div
      className={`group relative p-4 border-b transition-colors ${
        notification.is_read ? 'bg-background' : 'bg-accent/30'
      } hover:bg-accent/50 ${isDeleting ? 'opacity-50' : ''}`}
    >
      <div className="flex gap-3">
        <div className={`mt-1 ${getTypeColor(notification.type)}`}>
          <Bell className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm text-foreground">
              {notification.title}
            </h4>
            {!notification.is_read && (
              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
            )}
          </div>

          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>

          <div className="flex items-center gap-3 mt-3">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.created_at), {
                addSuffix: true,
              })}
            </span>

            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.is_read && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleMarkAsRead}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Mark read
                </Button>
              )}

              {notification.action_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleAction}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
