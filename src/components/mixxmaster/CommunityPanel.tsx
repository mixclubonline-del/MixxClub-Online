import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Users,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  Clock,
  Play,
  Download,
  Award
} from 'lucide-react';

interface CommunitySession {
  id: string;
  title: string;
  description: string;
  creator: {
    id: string;
    name: string;
    avatar?: string;
  };
  stats: {
    plays: number;
    likes: number;
    comments: number;
    shares: number;
  };
  tags: string[];
  createdAt: Date;
  thumbnailUrl?: string;
  isPublic: boolean;
}

export const CommunityPanel = () => {
  const [sessions, setSessions] = useState<CommunitySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'trending' | 'recent' | 'following'>('trending');

  useEffect(() => {
    loadCommunitySessions();
  }, [activeTab, searchQuery]);

  const loadCommunitySessions = async () => {
    try {
      setLoading(true);

      // Mock community data for now
      const mockSessions: CommunitySession[] = [
        {
          id: '1',
          title: 'Hip Hop Beat Mix Session',
          description: 'Heavy 808s with crisp hi-hats',
          creator: { id: '1', name: 'DJ Producer' },
          stats: { plays: 1234, likes: 89, comments: 23, shares: 12 },
          tags: ['hip-hop', 'trap', 'beats'],
          createdAt: new Date(),
          isPublic: true
        }
      ];

      setSessions(mockSessions);
    } catch (error) {
      console.error('Error loading community sessions:', error);
      toast.error('Failed to load community sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (sessionId: string) => {
    try {
      // TODO: Implement like functionality
      toast.success('Session liked!');
    } catch (error) {
      toast.error('Failed to like session');
    }
  };

  const handleShare = async (sessionId: string) => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/mixxmaster/session/${sessionId}`
      );
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy share link');
    }
  };

  const handlePlay = async (sessionId: string) => {
    // TODO: Implement preview playback
    toast.info('Preview playback coming soon!');
  };

  const handleDownload = async (sessionId: string) => {
    // TODO: Implement session download/fork
    toast.info('Session download coming soon!');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search community sessions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent
          </TabsTrigger>
          <TabsTrigger value="following" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Following
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <ScrollArea className="h-[600px] pr-4">
            <div className="grid gap-4">
              {loading ? (
                <div className="text-center text-muted-foreground py-8">
                  Loading community sessions...
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No sessions found
                </div>
              ) : (
                sessions.map((session) => (
                  <Card key={session.id} className="p-4">
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {session.thumbnailUrl ? (
                          <img
                            src={session.thumbnailUrl}
                            alt={session.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Play className="w-12 h-12 text-muted-foreground" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg truncate">
                              {session.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={session.creator.avatar} />
                                <AvatarFallback>
                                  {session.creator.name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-muted-foreground">
                                {session.creator.name}
                              </span>
                            </div>
                          </div>
                          <Badge variant="secondary">
                            <Award className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {session.description || 'No description provided'}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {session.tags.slice(0, 4).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Play className="w-4 h-4" />
                            {session.stats.plays.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {session.stats.likes.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {session.stats.comments}
                          </span>
                          <span className="flex items-center gap-1">
                            <Share2 className="w-4 h-4" />
                            {session.stats.shares}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handlePlay(session.id)}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLike(session.id)}
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShare(session.id)}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(session.id)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
