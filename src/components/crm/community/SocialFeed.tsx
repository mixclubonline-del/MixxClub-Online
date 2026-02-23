/**
 * SocialFeed — Real community activity feed.
 * 
 * Queries audit_logs for recent platform activity and shows
 * the latest actions from community members (project completions,
 * achievements, new members). Includes create-post composer.
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Heart, MessageCircle, Share2, MoreHorizontal, Play,
  Image, Music, Send, Bookmark, Award, CheckCircle2,
  Sparkles, Trophy, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface SocialFeedProps {
  userType: 'artist' | 'engineer';
  searchQuery: string;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({ userType, searchQuery }) => {
  const { user } = useAuth();
  const [newPost, setNewPost] = useState('');

  // Fetch recent community activity from audit_logs + project completions
  const { data: feedItems, isLoading } = useQuery({
    queryKey: ['social-feed', userType],
    queryFn: async () => {
      // 1. Recent audit logs (platform activity)
      const { data: logs } = await supabase
        .from('audit_logs')
        .select(`
          id, action, created_at, user_id,
          user:profiles!audit_logs_user_id_fkey (
            id, full_name, username, avatar_url, role
          )
        `)
        .order('created_at', { ascending: false })
        .limit(15);

      // 2. Recently completed projects
      const { data: projects } = await supabase
        .from('projects')
        .select(`
          id, title, status, completed_at,
          client:profiles!projects_client_id_fkey (
            id, full_name, username, avatar_url, role
          ),
          engineer:profiles!projects_engineer_id_fkey (
            id, full_name, username, avatar_url, role
          )
        `)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(5);

      // 3. Recent achievements
      const { data: achievements } = await supabase
        .from('achievements')
        .select(`
          id, name, earned_at, user_id,
          user:profiles!achievements_user_id_fkey (
            id, full_name, username, avatar_url, role
          )
        `)
        .order('earned_at', { ascending: false })
        .limit(5);

      // 4. Newest members
      const { data: newMembers } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, role, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      // Combine into a unified feed
      type FeedItem = {
        id: string;
        type: 'activity' | 'project' | 'achievement' | 'welcome';
        content: string;
        timestamp: string;
        author: {
          name: string;
          avatar: string | null;
          role: string;
          verified: boolean;
        };
        icon: 'activity' | 'project' | 'achievement' | 'welcome';
      };

      const items: FeedItem[] = [];

      // Activity logs
      (logs || []).forEach(log => {
        const profile = log.user as any;
        if (!profile) return;
        items.push({
          id: `log-${log.id}`,
          type: 'activity',
          content: log.action || 'performed an action',
          timestamp: log.created_at,
          author: {
            name: profile.full_name || profile.username || 'User',
            avatar: profile.avatar_url,
            role: profile.role || 'member',
            verified: false,
          },
          icon: 'activity',
        });
      });

      // Completed projects
      (projects || []).forEach(p => {
        const client = p.client as any;
        const engineer = p.engineer as any;
        if (!client) return;
        items.push({
          id: `proj-${p.id}`,
          type: 'project',
          content: `Completed${p.title ? ` "${p.title}"` : ' a project'}${engineer ? ` with engineer ${engineer.full_name || engineer.username}` : ''} 🎉`,
          timestamp: p.completed_at || new Date().toISOString(),
          author: {
            name: client.full_name || client.username || 'Artist',
            avatar: client.avatar_url,
            role: client.role || 'artist',
            verified: true,
          },
          icon: 'project',
        });
      });

      // Achievements
      (achievements || []).forEach(a => {
        const profile = a.user as any;
        if (!profile) return;
        items.push({
          id: `ach-${a.id}`,
          type: 'achievement',
          content: `Earned the "${a.name}" badge! 🏆`,
          timestamp: a.earned_at,
          author: {
            name: profile.full_name || profile.username || 'User',
            avatar: profile.avatar_url,
            role: profile.role || 'member',
            verified: false,
          },
          icon: 'achievement',
        });
      });

      // New members
      (newMembers || []).forEach(m => {
        items.push({
          id: `welcome-${m.id}`,
          type: 'welcome',
          content: `Just joined MixxClub as a ${m.role || 'member'}! Welcome! 👋`,
          timestamp: m.created_at,
          author: {
            name: m.full_name || m.username || 'New Member',
            avatar: m.avatar_url,
            role: m.role || 'member',
            verified: false,
          },
          icon: 'welcome',
        });
      });

      // Sort by timestamp descending
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return items.slice(0, 20);
    },
    staleTime: 30000,
  });

  const filteredFeed = (feedItems || []).filter(item =>
    item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'project': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'achievement': return <Trophy className="w-4 h-4 text-amber-400" />;
      case 'welcome': return <Users className="w-4 h-4 text-blue-400" />;
      default: return <Sparkles className="w-4 h-4 text-primary" />;
    }
  };

  const formatTime = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-xl" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Create Post */}
      <Card className="bg-card/50 border-border/50 p-4">
        <div className="flex gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-primary/20 text-primary">
              {user?.user_metadata?.full_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="Share something with the community..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="bg-background/50 border-border/50 min-h-[80px] resize-none"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Image className="w-4 h-4 mr-1" />
                  Photo
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Music className="w-4 h-4 mr-1" />
                  Audio
                </Button>
              </div>
              <Button size="sm" disabled={!newPost.trim()} className="gap-2">
                <Send className="w-4 h-4" />
                Post
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Feed */}
      <AnimatePresence>
        {filteredFeed.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.03 }}
          >
            <Card className="bg-card/50 border-border/50 p-4 hover:border-primary/30 transition-all">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={item.author.avatar || ''} />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {item.author.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground text-sm">{item.author.name}</span>
                    {item.author.verified && <Award className="w-4 h-4 text-blue-400" />}
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {item.author.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">• {formatTime(item.timestamp)}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    {getIcon(item.type)}
                    <p className="text-foreground text-sm leading-relaxed">{item.content}</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {filteredFeed.length === 0 && (
        <Card className="bg-card/50 border-border/50 p-8 text-center">
          <p className="text-muted-foreground">
            {searchQuery ? 'No posts found matching your search.' : 'No community activity yet. Be the first!'}
          </p>
        </Card>
      )}
    </div>
  );
};
