/**
 * NotificationsHub — Real-time notification center with GlassPanel design tokens.
 * 
 * Queries the notifications table with real-time subscription,
 * category filtering, and glassmorphic styling.
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Users, 
  DollarSign,
  Music,
  MessageSquare,
  AlertCircle,
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { GlassPanel, HubHeader } from '../design';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
  metadata?: Record<string, unknown>;
}

type NotificationCategory = 'all' | 'partnerships' | 'payments' | 'projects' | 'messages';

const categoryConfig: Record<NotificationCategory, { icon: React.ElementType; label: string; types: string[] }> = {
  all: { icon: Bell, label: 'All', types: [] },
  partnerships: { icon: Users, label: 'Partnerships', types: ['partnership_invite', 'partnership_accepted', 'collaboration_invite'] },
  payments: { icon: DollarSign, label: 'Payments', types: ['payment_received', 'payment_pending', 'payout_completed'] },
  projects: { icon: Music, label: 'Projects', types: ['project_update', 'project_completed', 'milestone_reached'] },
  messages: { icon: MessageSquare, label: 'Messages', types: ['new_message', 'message_reply'] },
};

const getNotificationIcon = (type: string) => {
  if (type.includes('partner') || type.includes('collaboration')) return Users;
  if (type.includes('payment') || type.includes('payout') || type.includes('revenue')) return DollarSign;
  if (type.includes('project') || type.includes('milestone')) return Music;
  if (type.includes('message')) return MessageSquare;
  return Bell;
};

const getNotificationColor = (type: string) => {
  if (type.includes('partner') || type.includes('collaboration')) return 'text-blue-500 bg-blue-500/10';
  if (type.includes('payment') || type.includes('payout') || type.includes('revenue')) return 'text-green-500 bg-green-500/10';
  if (type.includes('project') || type.includes('milestone')) return 'text-purple-500 bg-purple-500/10';
  if (type.includes('message')) return 'text-orange-500 bg-orange-500/10';
  return 'text-muted-foreground bg-muted';
};

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem = ({ notification, onMarkRead, onDelete }: NotificationItemProps) => {
  const Icon = getNotificationIcon(notification.type);
  const colorClass = getNotificationColor(notification.type);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <GlassPanel
        padding="p-3"
        hoverable
        accent={notification.is_read ? undefined : 'rgba(168, 85, 247, 0.3)'}
      >
        <div className="flex gap-3">
          <div className={`p-2 rounded-full shrink-0 ${colorClass}`}>
            <Icon className="w-4 h-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className={`text-sm font-medium ${notification.is_read ? 'text-muted-foreground' : ''}`}>
                {notification.title}
              </h4>
              {!notification.is_read && (
                <Badge className="bg-primary text-primary-foreground text-xs shrink-0">
                  New
                </Badge>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {notification.message}
            </p>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </span>
              
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!notification.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => onMarkRead(notification.id)}
                  >
                    <CheckCheck className="w-3 h-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-destructive hover:text-destructive"
                  onClick={() => onDelete(notification.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>
    </motion.div>
  );
};

export const NotificationsHub = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('all');

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      
      toast({
        title: 'All notifications marked as read',
      });
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('notifications-hub')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, toast]);

  const filteredNotifications = activeCategory === 'all'
    ? notifications
    : notifications.filter(n => 
        categoryConfig[activeCategory].types.some(t => n.type.includes(t) || n.type === t)
      );

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6">
      <HubHeader
        icon={<Bell className="h-5 w-5 text-primary" />}
        title="Notifications"
        subtitle="Stay updated on partnerships, payments, and project activity"
        accent="rgba(168, 85, 247, 0.5)"
        action={
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchNotifications}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead} className="border-white/10 hover:bg-white/5">
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark all read
              </Button>
            )}
          </div>
        }
      />

      {unreadCount > 0 && (
        <Badge className="bg-primary text-primary-foreground">
          {unreadCount} unread
        </Badge>
      )}

      <GlassPanel padding="p-0" glow accent="rgba(168, 85, 247, 0.3)">
        <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as NotificationCategory)}>
          <div className="px-4 pt-4">
            {isMobile ? (
              <Select value={activeCategory} onValueChange={(v) => setActiveCategory(v as NotificationCategory)}>
                <SelectTrigger className="w-full bg-white/5 border-white/10">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <TabsList className="bg-white/5 border border-white/8 w-full justify-start gap-2">
                {Object.entries(categoryConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  const count = key === 'all' 
                    ? notifications.length
                    : notifications.filter(n => 
                        config.types.some(t => n.type.includes(t) || n.type === t)
                      ).length;
                  
                  return (
                    <TabsTrigger
                      key={key}
                      value={key}
                      className="data-[state=active]:bg-primary/10 gap-1.5 px-3"
                    >
                      <Icon className="w-4 h-4" />
                      {config.label}
                      {count > 0 && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                          {count}
                        </Badge>
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            )}
          </div>

          <TabsContent value={activeCategory} className="m-0">
            <ScrollArea className="h-[500px]">
              <div className="p-4 space-y-2">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="w-10 h-10 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No notifications yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      You'll see partnership and project updates here
                    </p>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {filteredNotifications.map(notification => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkRead={markAsRead}
                        onDelete={deleteNotification}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </GlassPanel>
    </div>
  );
};
