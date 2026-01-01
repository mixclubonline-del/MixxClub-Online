import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Heart, MessageCircle, Share2, MoreHorizontal, Play,
  Image, Music, Send, Bookmark, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SocialFeedProps {
  userType: 'artist' | 'engineer';
  searchQuery: string;
}

interface FeedPost {
  id: string;
  author: {
    name: string;
    avatar: string;
    role: 'artist' | 'engineer';
    verified: boolean;
  };
  content: string;
  media?: {
    type: 'audio' | 'image';
    url: string;
    title?: string;
  };
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({ userType, searchQuery }) => {
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState<FeedPost[]>([
    {
      id: '1',
      author: {
        name: 'SonicWave',
        avatar: '',
        role: 'engineer',
        verified: true,
      },
      content: 'Just finished mixing this crazy trap beat! The 808s are hitting different 🔥 Check out the before/after comparison.',
      media: {
        type: 'audio',
        url: '#',
        title: 'Midnight Vibes - Final Mix',
      },
      timestamp: '2 hours ago',
      likes: 234,
      comments: 45,
      shares: 89,
      isLiked: false,
      isSaved: false,
    },
    {
      id: '2',
      author: {
        name: 'BeatMaster',
        avatar: '',
        role: 'artist',
        verified: true,
      },
      content: 'Mastering tip: Always check your mixes on multiple systems before sending to clients. Your car speakers might reveal issues your studio monitors miss! 🎧',
      timestamp: '4 hours ago',
      likes: 567,
      comments: 123,
      shares: 234,
      isLiked: true,
      isSaved: true,
    },
    {
      id: '3',
      author: {
        name: 'ProProducer',
        avatar: '',
        role: 'engineer',
        verified: true,
      },
      content: 'Behind the scenes: Studio setup tour coming next week! Who wants to see the new gear I just picked up? 👀',
      media: {
        type: 'image',
        url: '#',
      },
      timestamp: '1 day ago',
      likes: 789,
      comments: 156,
      shares: 345,
      isLiked: false,
      isSaved: false,
    },
    {
      id: '4',
      author: {
        name: 'VocalQueen',
        avatar: '',
        role: 'artist',
        verified: false,
      },
      content: 'Looking for an engineer who specializes in R&B vocal production. Any recommendations from the community? 🎤',
      timestamp: '2 days ago',
      likes: 156,
      comments: 89,
      shares: 23,
      isLiked: false,
      isSaved: false,
    },
  ]);

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleSave = (postId: string) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, isSaved: !post.isSaved }
        : post
    ));
  };

  const filteredPosts = posts.filter(post =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Create Post */}
      <Card className="bg-card/50 border-border/50 p-4">
        <div className="flex gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary/20 text-primary">U</AvatarFallback>
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

      {/* Feed Posts */}
      <AnimatePresence>
        {filteredPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="bg-card/50 border-border/50 p-4 hover:border-primary/30 transition-all">
              {/* Author Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {post.author.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{post.author.name}</span>
                      {post.author.verified && (
                        <Award className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {post.author.role}
                      </Badge>
                      <span>•</span>
                      <span>{post.timestamp}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              {/* Content */}
              <p className="text-foreground mb-4 leading-relaxed">{post.content}</p>

              {/* Media */}
              {post.media && (
                <div className="mb-4">
                  {post.media.type === 'audio' ? (
                    <div className="bg-background/50 rounded-lg p-4 flex items-center gap-4">
                      <Button size="icon" className="rounded-full bg-primary hover:bg-primary/90">
                        <Play className="w-4 h-4" />
                      </Button>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{post.media.title}</p>
                        <div className="h-2 bg-muted rounded-full mt-2">
                          <div className="h-full w-1/3 bg-primary rounded-full" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted rounded-lg aspect-video flex items-center justify-center">
                      <Image className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className={post.isLiked ? 'text-red-400' : 'text-muted-foreground'}
                  >
                    <Heart className={`w-4 h-4 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
                    {post.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {post.comments}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Share2 className="w-4 h-4 mr-1" />
                    {post.shares}
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSave(post.id)}
                  className={post.isSaved ? 'text-yellow-400' : 'text-muted-foreground'}
                >
                  <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {filteredPosts.length === 0 && (
        <Card className="bg-card/50 border-border/50 p-8 text-center">
          <p className="text-muted-foreground">No posts found matching your search.</p>
        </Card>
      )}
    </div>
  );
};
