import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Check, ChevronRight, ExternalLink, Lock, Plug, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

const COMMUNITY_COUNT = 47;
const UNLOCK_THRESHOLD = 1000;
const IS_UNLOCKED = COMMUNITY_COUNT >= UNLOCK_THRESHOLD;

interface IntegrationCard {
  id: string;
  name: string;
  description: string;
  logo: string;
  category: string;
  status: 'coming_soon' | 'available' | 'connected';
  docUrl?: string;
  requiresKey?: boolean;
}

const INTEGRATIONS: IntegrationCard[] = [
  {
    id: 'spotify',
    name: 'Spotify',
    description: 'Distribute your released tracks directly to Spotify and sync your artist profile',
    logo: '🎵',
    category: 'Streaming',
    status: 'coming_soon',
  },
  {
    id: 'apple-music',
    name: 'Apple Music',
    description: 'Publish to Apple Music, track plays, and manage your artist identity',
    logo: '🍎',
    category: 'Streaming',
    status: 'coming_soon',
  },
  {
    id: 'soundcloud',
    name: 'SoundCloud',
    description: 'Auto-publish mixes, sync follower data, and track engagement',
    logo: '☁️',
    category: 'Streaming',
    status: 'coming_soon',
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Auto-sync project files, stems, and exports to your Dropbox',
    logo: '📦',
    category: 'Cloud Storage',
    status: 'coming_soon',
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Backup sessions and share files with collaborators via Google Drive',
    logo: '📂',
    category: 'Cloud Storage',
    status: 'coming_soon',
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Share project updates, new releases, and get fan reactions in your Discord server',
    logo: '💬',
    category: 'Community',
    status: 'coming_soon',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Auto-publish release artwork and snippets to Instagram for pre-release hype',
    logo: '📸',
    category: 'Social',
    status: 'coming_soon',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Upload lyric videos, studio sessions, and track debuts directly',
    logo: '▶️',
    category: 'Social',
    status: 'coming_soon',
  },
  {
    id: 'ableton',
    name: 'Ableton Live',
    description: 'Import project files and session clips from Ableton Live sets',
    logo: '🎛️',
    category: 'DAW',
    status: 'coming_soon',
    requiresKey: true,
  },
  {
    id: 'pro-tools',
    name: 'Pro Tools',
    description: 'Seamless Pro Tools session import/export with track metadata intact',
    logo: '🎚️',
    category: 'DAW',
    status: 'coming_soon',
    requiresKey: true,
  },
  {
    id: 'logic-pro',
    name: 'Logic Pro',
    description: 'Import Logic project files and transfer stems to Mixx Club',
    logo: '🎹',
    category: 'DAW',
    status: 'coming_soon',
    requiresKey: true,
  },
];

const CATEGORIES = ['All', ...Array.from(new Set(INTEGRATIONS.map(i => i.category)))];

export default function Integrations() {
  const [activeCategory, setActiveCategory] = React.useState('All');

  const filtered = INTEGRATIONS.filter(
    i => activeCategory === 'All' || i.category === activeCategory
  );

  return (
    <>
      <Helmet>
        <title>Integrations | Mixx Club</title>
        <meta name="description" content="Connect Mixx Club with your favorite tools — DAWs, cloud storage, streaming platforms, and more." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <main className="container max-w-5xl mx-auto px-4 py-6">
          <Link
            to="/settings"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Settings
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Plug className="w-7 h-7 text-primary" />
              <h1 className="text-3xl font-bold">Integrations</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Connect your workflow with the tools you already use — DAWs, cloud storage, streaming platforms, and social channels.
            </p>
          </div>

          {/* Unlock overlay wrapper */}
          <div className="relative">
            {!IS_UNLOCKED && (
              <div className="absolute inset-0 z-20 flex items-start justify-center pt-16 rounded-xl" style={{ background: 'hsl(var(--background)/0.92)', backdropFilter: 'blur(8px)' }}>
                <Card className="p-10 text-center max-w-md border-primary/30">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Integrations Unlocking Soon</h2>
                  <p className="text-muted-foreground mb-4">
                    Third-party integrations unlock at <strong>{UNLOCK_THRESHOLD} community members</strong>.
                  </p>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(COMMUNITY_COUNT / UNLOCK_THRESHOLD) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {COMMUNITY_COUNT} / {UNLOCK_THRESHOLD} members — {UNLOCK_THRESHOLD - COMMUNITY_COUNT} to go
                  </p>
                  <Badge className="mt-4">Phase 3 Feature</Badge>
                </Card>
              </div>
            )}

            <div className={!IS_UNLOCKED ? 'pointer-events-none select-none' : ''}>
              {/* Category filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                {CATEGORIES.map(cat => (
                  <Button
                    key={cat}
                    size="sm"
                    variant={activeCategory === cat ? 'default' : 'outline'}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>

              {/* Integrations Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <TooltipProvider>
                  {filtered.map((integration) => (
                    <Card key={integration.id} className="p-4 flex flex-col justify-between hover:bg-muted/30 transition-colors">
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{integration.logo}</div>
                            <div>
                              <h3 className="font-semibold">{integration.name}</h3>
                              <Badge variant="secondary" className="text-xs mt-0.5">{integration.category}</Badge>
                            </div>
                          </div>
                          {integration.status === 'connected' && (
                            <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-green-500" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>

                        {integration.requiresKey && (
                          <div className="flex items-center gap-2 mb-3">
                            <Input placeholder="API Key..." className="h-8 text-xs" />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex-1">
                              <Button className="w-full" size="sm" disabled={integration.status === 'coming_soon'}>
                                {integration.status === 'connected' ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 mr-1" />
                                    Connected
                                  </>
                                ) : (
                                  <>
                                    <Plug className="w-3.5 h-3.5 mr-1" />
                                    Connect
                                  </>
                                )}
                              </Button>
                            </div>
                          </TooltipTrigger>
                          {integration.status === 'coming_soon' && (
                            <TooltipContent>
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Coming in Phase 3
                              </div>
                            </TooltipContent>
                          )}
                        </Tooltip>

                        {integration.docUrl && (
                          <Button size="sm" variant="ghost" asChild>
                            <a href={integration.docUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </TooltipProvider>
              </div>

              {/* Request Integration */}
              <Card className="p-6 bg-muted/30">
                <div className="flex items-start gap-4">
                  <ChevronRight className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Need a different integration?</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Tell us what tools you use and we'll prioritize building it into the platform.
                    </p>
                    <div className="flex gap-2">
                      <Input placeholder="e.g., Cubase, Tidal, Notion..." className="max-w-xs" />
                      <Button>Request</Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

// Need React import for useState inside the component
import React from 'react';
