import React, { useState } from 'react';
import { Radio, Headphones, AudioWaveform, Mic, MessageSquare, GraduationCap, Disc3 } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import Navigation from '@/components/Navigation';
import { PublicFooter } from '@/components/layouts/PublicFooter';
import { Badge } from '@/components/ui/badge';
import { GoLiveButton } from '@/components/live/GoLiveButton';
import { LiveHero } from '@/components/live/LiveHero';
import { LiveStatsBar } from '@/components/live/LiveStatsBar';
import { LiveFeed } from '@/components/live/LiveFeed';
import { RecentStreams } from '@/components/live/RecentStreams';
import { LiveActivitySidebar } from '@/components/live/LiveActivitySidebar';
import { useLiveStreams } from '@/hooks/useLiveStream';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { value: 'all', label: 'All', icon: Disc3 },
  { value: 'mixing', label: 'Mixing', icon: Headphones },
  { value: 'mastering', label: 'Mastering', icon: AudioWaveform },
  { value: 'production', label: 'Production', icon: Disc3 },
  { value: 'performance', label: 'Performance', icon: Mic },
  { value: 'q&a', label: 'Q&A', icon: MessageSquare },
  { value: 'tutorial', label: 'Tutorial', icon: GraduationCap },
];

export const LivePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { data: allLiveStreams } = useLiveStreams({ isLive: true });

  const liveCount = allLiveStreams?.length || 0;

  // Featured stream = highest viewer count
  const featuredStream = allLiveStreams && allLiveStreams.length > 0
    ? [...allLiveStreams].sort((a, b) => (b.viewer_count || 0) - (a.viewer_count || 0))[0]
    : null;

  // Count per category for badges
  const categoryCounts = (allLiveStreams || []).reduce<Record<string, number>>((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Mixxclub Live — Watch Creators Mix, Perform & Collaborate"
        description="Watch creators mix, master, and perform live on Mixxclub. Join real-time sessions, send gifts, and connect with the community."
        keywords="live streaming, music production live, mixing sessions, live collaboration, beat making live"
      />
      <Navigation />

      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-16 z-30">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-destructive/20 flex items-center justify-center">
                <Radio className="h-5 w-5 text-destructive animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                  Mixxclub Live
                  {liveCount > 0 && (
                    <Badge variant="destructive" className="text-xs">{liveCount} Live</Badge>
                  )}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Watch creators mix, perform, and collaborate in real-time
                </p>
              </div>
            </div>
            <GoLiveButton />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <LiveStatsBar />
        </motion.div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Hero Stage */}
            <LiveHero featuredStream={featuredStream} />

            {/* Category chips */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const count = cat.value === 'all' ? liveCount : (categoryCounts[cat.value] || 0);
                const isActive = selectedCategory === cat.value;

                return (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`
                      inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all
                      ${isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                      }
                    `}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {cat.label}
                    {count > 0 && (
                      <Badge
                        variant={isActive ? 'secondary' : 'outline'}
                        className="ml-0.5 h-4 px-1.5 text-[10px] leading-none"
                      >
                        {count}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Live streams grid */}
            <LiveFeed
              category={selectedCategory === 'all' ? undefined : selectedCategory}
              limit={12}
              showHeader={true}
            />

            {/* Recent streams / replays */}
            <div className="pt-6 border-t border-border/40">
              <RecentStreams />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <LiveActivitySidebar />
          </aside>
        </div>
      </div>

      {/* Floating Go Live */}
      <GoLiveButton variant="floating" />

      <PublicFooter />
    </div>
  );
};

export default LivePage;
