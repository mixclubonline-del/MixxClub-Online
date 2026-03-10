/**
 * CommunityHub — Migrated to GlassPanel/HubHeader design tokens.
 * 
 * Community engagement, referral sharing, leaderboard,
 * and growth tips with glassmorphic styling.
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Heart, MessageCircle, Share2, TrendingUp, Users,
  Zap, Gift, Globe, Copy, Check
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { GlassPanel, HubHeader, StaggeredList } from './design';

interface CommunityHubProps {
  userType: 'artist' | 'engineer' | 'producer';
}

export const CommunityHub: React.FC<CommunityHubProps> = ({ userType }) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const communityStats = {
    totalShares: 847,
    totalLikes: 3421,
    followers: 2156,
    viralScore: 78,
    shareConversionRate: 18.5,
  };

  const recentPosts = [
    {
      id: 1,
      content: 'Just finished a sick remix collaboration! Check it out!',
      timestamp: '2 hours ago',
      likes: 234,
      comments: 45,
      shares: 89,
      engagement: 45,
    },
    {
      id: 2,
      content: 'Mastering tip: Always check your mixes on multiple systems',
      timestamp: '1 day ago',
      likes: 567,
      comments: 123,
      shares: 234,
      engagement: 87,
    },
    {
      id: 3,
      content: 'Behind the scenes: Studio setup tour coming next week!',
      timestamp: '3 days ago',
      likes: 789,
      comments: 156,
      shares: 345,
      engagement: 92,
    },
  ];

  const leaderboardData = [
    { rank: 1, name: 'ProProducer', followers: 45200, viralScore: 95, badge: '👑' },
    { rank: 2, name: 'SonicWave', followers: 38900, viralScore: 89, badge: '🌟' },
    { rank: 3, name: 'BeatMaster', followers: 32100, viralScore: 84, badge: '⭐' },
    { rank: 4, name: 'You', followers: 2156, viralScore: 78, badge: '🎵', isYou: true },
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText('ARTIST-KJ9B2F');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = [
    { label: 'Followers', value: communityStats.followers.toLocaleString(), icon: Users, color: 'text-blue-400', accent: 'rgba(59, 130, 246, 0.15)', progress: 65 },
    { label: 'Total Shares', value: communityStats.totalShares.toLocaleString(), icon: Share2, color: 'text-green-400', accent: 'rgba(34, 197, 94, 0.15)', progress: 72 },
    { label: 'Total Likes', value: communityStats.totalLikes.toLocaleString(), icon: Heart, color: 'text-red-400', accent: 'rgba(239, 68, 68, 0.15)', progress: 85 },
    { label: 'Viral Score', value: communityStats.viralScore.toString(), icon: Zap, color: 'text-yellow-400', accent: 'rgba(234, 179, 8, 0.15)', progress: communityStats.viralScore },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <HubHeader
        icon={<Users className="h-5 w-5 text-blue-400" />}
        title="Community & Growth"
        subtitle="Share, engage, and grow your audience"
        accent="rgba(59, 130, 246, 0.5)"
      />

      {/* Community Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <GlassPanel key={stat.label} padding="p-5" hoverable accent={stat.accent}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <Progress value={stat.progress} className="mt-4" />
          </GlassPanel>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Referral Widget */}
        <GlassPanel glow accent="rgba(34, 197, 94, 0.4)" padding="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-foreground">Referral Code</h3>
          </div>

          <p className="text-muted-foreground text-sm mb-4">
            Share your unique code and earn $20 per referral when they subscribe!
          </p>

          <div className="bg-white/[0.03] border border-white/8 rounded-lg p-4 mb-4 flex items-center justify-between">
            <code className="text-green-400 font-mono font-bold">ARTIST-KJ9B2F</code>
            <button
              onClick={copyToClipboard}
              className="text-muted-foreground hover:text-green-400 transition"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          <Button className="w-full bg-green-600 hover:bg-green-700 mb-3">
            <Share2 className="w-4 h-4 mr-2" />
            Share on Social
          </Button>

          <div className="text-sm text-muted-foreground">
            <p className="mb-2">📊 This Month: <span className="text-green-400 font-bold">$250</span></p>
            <p>👥 Active Referrals: <span className="text-green-400 font-bold">12 users</span></p>
          </div>
        </GlassPanel>

        {/* Conversion Stats */}
        <GlassPanel padding="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-foreground">Conversion Stats</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Share Conversion</span>
                <span className="text-foreground font-bold">{communityStats.shareConversionRate}%</span>
              </div>
              <Progress value={communityStats.shareConversionRate} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Engagement Rate</span>
                <span className="text-foreground font-bold">34.2%</span>
              </div>
              <Progress value={34.2} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Audience Growth</span>
                <span className="text-foreground font-bold">+8.5%</span>
              </div>
              <Progress value={85} />
            </div>

            <Button variant="outline" className="w-full mt-4 border-white/10">
              View Detailed Analytics
            </Button>
          </div>
        </GlassPanel>

        {/* Quick Share Tools */}
        <GlassPanel padding="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-foreground">Share Channels</h3>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Twitter/X', icon: '𝕏' },
              { name: 'Instagram', icon: '📷' },
              { name: 'TikTok', icon: '🎵' },
              { name: 'LinkedIn', icon: '💼' },
              { name: 'Discord', icon: '💬' },
              { name: 'Email', icon: '✉️' },
            ].map((channel) => (
              <Button
                key={channel.name}
                variant="outline"
                className="w-full justify-start border-white/10 hover:bg-white/5"
              >
                <span className="mr-2">{channel.icon}</span>
                Share on {channel.name}
              </Button>
            ))}
          </div>
        </GlassPanel>
      </div>

      {/* Recent Posts */}
      <GlassPanel padding="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Posts Performance</h3>

        <StaggeredList className="space-y-4">
          {recentPosts.map((post) => (
            <GlassPanel key={post.id} hoverable padding="p-4" accent="rgba(59, 130, 246, 0.1)">
              <p className="text-foreground mb-3">{post.content}</p>

              <div className="flex items-center justify-between text-sm text-muted-foreground mb-3 pb-3 border-b border-white/8">
                <span>{post.timestamp}</span>
                <Badge variant="outline" className="border-white/10">Engagement: {post.engagement}%</Badge>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span>{post.likes}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageCircle className="w-4 h-4 text-blue-400" />
                  <span>{post.comments}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Share2 className="w-4 h-4 text-green-400" />
                  <span>{post.shares}</span>
                </div>
              </div>
            </GlassPanel>
          ))}
        </StaggeredList>

        <Button className="w-full mt-4" variant="outline">
          View All Posts
        </Button>
      </GlassPanel>

      {/* Community Leaderboard */}
      <GlassPanel padding="p-6" glow accent="rgba(234, 179, 8, 0.3)">
        <h3 className="text-lg font-semibold text-foreground mb-4">🏆 Viral Leaderboard</h3>

        <StaggeredList className="space-y-3">
          {leaderboardData.map((entry) => (
            <GlassPanel
              key={entry.rank}
              hoverable
              padding="p-4"
              accent={entry.isYou ? 'rgba(59, 130, 246, 0.3)' : undefined}
              className={entry.isYou ? 'border-primary/40' : ''}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold w-6">{entry.badge}</span>
                  <div>
                    <p className="text-foreground font-semibold">{entry.name}</p>
                    <p className="text-sm text-muted-foreground">{entry.followers.toLocaleString()} followers</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-foreground font-bold">Score: {entry.viralScore}</p>
                  <p className="text-sm text-muted-foreground">#{entry.rank}</p>
                </div>
              </div>
            </GlassPanel>
          ))}
        </StaggeredList>

        <div className="mt-4">
          <GlassPanel padding="p-4">
            <p className="text-sm text-muted-foreground text-center">
              💡 Share more content to climb the leaderboard and unlock exclusive rewards!
            </p>
          </GlassPanel>
        </div>
      </GlassPanel>

      {/* Growth Tips */}
      <GlassPanel padding="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">📈 Growth Tips This Week</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { emoji: '🚀', title: 'Post Timing', tip: 'Best time to post: Tuesday-Thursday, 7-9 PM' },
            { emoji: '🎯', title: 'Content Focus', tip: 'Your audience loves behind-the-scenes content' },
            { emoji: '💬', title: 'Engagement', tip: 'Respond to comments within 2 hours for +15% engagement' },
            { emoji: '🤝', title: 'Collaboration', tip: 'Team up with 2-3 creators for viral potential' },
          ].map((item) => (
            <GlassPanel key={item.title} hoverable padding="p-4" accent="rgba(168, 85, 247, 0.1)">
              <p className="font-semibold text-foreground mb-2">{item.emoji} {item.title}</p>
              <p className="text-sm text-muted-foreground">{item.tip}</p>
            </GlassPanel>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
};

export default CommunityHub;
