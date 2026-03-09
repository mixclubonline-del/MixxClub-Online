import React, { useState } from 'react';
import { Radio, Filter, TrendingUp } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import Navigation from '@/components/Navigation';
import { PublicFooter } from '@/components/layouts/PublicFooter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LiveFeed } from '@/components/live/LiveFeed';
import { GoLiveButton } from '@/components/live/GoLiveButton';
import { useLiveStreams } from '@/hooks/useLiveStream';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'mixing', label: 'Mixing' },
  { value: 'mastering', label: 'Mastering' },
  { value: 'production', label: 'Production' },
  { value: 'performance', label: 'Performance' },
  { value: 'q&a', label: 'Q&A' },
  { value: 'tutorial', label: 'Tutorial' },
];

export const LivePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { data: allLiveStreams } = useLiveStreams({ isLive: true });

  const liveCount = allLiveStreams?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Live Streams"
        description="Watch creators mix, perform, and collaborate in real-time on Mixxclub Live."
        keywords="live streaming, music production live, mixing sessions, live collaboration"
      />
      <Navigation />
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center">
                <Radio className="h-6 w-6 text-destructive animate-pulse" />
              </div>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  Mixxclub Live
                  {liveCount > 0 && (
                    <Badge variant="destructive">{liveCount} Live</Badge>
                  )}
                </h1>
                <p className="text-muted-foreground">
                  Watch creators mix, perform, and collaborate in real-time
                </p>
              </div>
            </div>

            <GoLiveButton />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Category Filter */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="flex-wrap h-auto gap-2 bg-transparent p-0">
            {CATEGORIES.map((cat) => (
              <TabsTrigger
                key={cat.value}
                value={cat.value}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4"
              >
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Live Now Section */}
        <div className="space-y-8">
          <LiveFeed
            category={selectedCategory === 'all' ? undefined : selectedCategory}
            limit={12}
            showHeader={true}
          />

          {/* Past Streams Section - Future enhancement */}
          <div className="pt-8 border-t">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-bold">Recent Streams</h2>
            </div>
            <div className="text-center py-12 text-muted-foreground">
              <p>Past stream recordings will appear here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Go Live Button */}
      <GoLiveButton variant="floating" />

      <PublicFooter />
    </div>
  );
};

export default LivePage;
