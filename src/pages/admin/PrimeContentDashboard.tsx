import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  Sparkles, 
  Play, 
  Pause, 
  Check, 
  X, 
  Clock, 
  Copy, 
  Image, 
  Video, 
  Mic, 
  RefreshCw,
  TrendingUp,
  Zap,
  Calendar,
  ExternalLink,
  CalendarDays,
  List
} from 'lucide-react';
import {
  generatePrimeContent,
  fetchContentQueue,
  updateContentStatus,
  markAsPosted,
  deleteContent,
  getContentStats,
  type PrimeContent,
  type ContentType,
  type ContentStatus
} from '@/lib/api/prime-content';
import PrimeContentCalendar from '@/components/admin/PrimeContentCalendar';

const contentTypeLabels: Record<ContentType, { label: string; icon: React.ReactNode; color: string }> = {
  'hot-take': { label: 'Hot Take', icon: <Zap className="h-4 w-4" />, color: 'bg-orange-500/20 text-orange-400' },
  'production-tip': { label: 'Production Tip', icon: <Mic className="h-4 w-4" />, color: 'bg-blue-500/20 text-blue-400' },
  'industry-insight': { label: 'Industry Insight', icon: <TrendingUp className="h-4 w-4" />, color: 'bg-purple-500/20 text-purple-400' },
  'platform-promo': { label: 'Platform Promo', icon: <Sparkles className="h-4 w-4" />, color: 'bg-green-500/20 text-green-400' },
  'trend-reaction': { label: 'Trend Reaction', icon: <RefreshCw className="h-4 w-4" />, color: 'bg-pink-500/20 text-pink-400' }
};

const statusColors: Record<ContentStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  generating: 'bg-blue-500/20 text-blue-400',
  ready: 'bg-emerald-500/20 text-emerald-400',
  approved: 'bg-green-500/20 text-green-400',
  scheduled: 'bg-purple-500/20 text-purple-400',
  posted: 'bg-gray-500/20 text-gray-400',
  rejected: 'bg-red-500/20 text-red-400'
};

export default function PrimeContentDashboard() {
  const [content, setContent] = useState<PrimeContent[]>([]);
  const [allContent, setAllContent] = useState<PrimeContent[]>([]);
  const [stats, setStats] = useState({ pending: 0, ready: 0, approved: 0, posted: 0, totalThisWeek: 0 });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState<ContentType>('hot-take');
  const [customTopic, setCustomTopic] = useState('');
  const [activeTab, setActiveTab] = useState('ready');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [selectedContent, setSelectedContent] = useState<PrimeContent | null>(null);

  useEffect(() => {
    loadContent();
    loadStats();
    loadAllContent();
  }, [activeTab]);

  const loadContent = async () => {
    setLoading(true);
    const statusFilter = activeTab === 'all' ? undefined : activeTab as ContentStatus;
    const data = await fetchContentQueue({ status: statusFilter, limit: 50 });
    setContent(data);
    setLoading(false);
  };

  const loadAllContent = async () => {
    // Load all content for calendar view (no status filter)
    const data = await fetchContentQueue({ limit: 200 });
    setAllContent(data);
  };

  const loadStats = async () => {
    const data = await getContentStats();
    setStats(data);
  };

  const handleSelectContentFromCalendar = (item: PrimeContent) => {
    setSelectedContent(item);
    // Switch to list view and set the appropriate tab
    setViewMode('list');
    setActiveTab(item.status);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    toast.loading('Prime is cooking up some content...', { id: 'generating' });

    try {
      const result = await generatePrimeContent({
        contentType: selectedType,
        topic: customTopic || undefined,
        platforms: ['tiktok', 'instagram', 'twitter'],
        includeVoice: true,
        includeImage: true,
        includeVideo: false
      });

      if (result.success) {
        toast.success('Content generated! Check the Ready tab.', { id: 'generating' });
        setCustomTopic('');
        loadContent();
        loadStats();
      } else {
        toast.error(result.error || 'Generation failed', { id: 'generating' });
      }
    } catch (error) {
      toast.error('Failed to generate content', { id: 'generating' });
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async (contentId: string) => {
    const success = await updateContentStatus(contentId, 'approved');
    if (success) {
      toast.success('Content approved!');
      loadContent();
      loadStats();
    }
  };

  const handleReject = async (contentId: string, reason: string) => {
    const success = await updateContentStatus(contentId, 'rejected', { rejectionReason: reason });
    if (success) {
      toast.success('Content rejected');
      loadContent();
      loadStats();
    }
  };

  const handleMarkPosted = async (contentId: string, platforms: string[]) => {
    const success = await markAsPosted(contentId, platforms);
    if (success) {
      toast.success('Marked as posted!');
      loadContent();
      loadStats();
    }
  };

  const handleDelete = async (contentId: string) => {
    const success = await deleteContent(contentId);
    if (success) {
      toast.success('Content deleted');
      loadContent();
      loadStats();
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const playAudio = (audioUrl: string, contentId: string) => {
    if (playingAudio === contentId && audioRef) {
      audioRef.pause();
      setPlayingAudio(null);
      return;
    }

    if (audioRef) {
      audioRef.pause();
    }

    const audio = new Audio(audioUrl);
    audio.onended = () => setPlayingAudio(null);
    audio.play();
    setAudioRef(audio);
    setPlayingAudio(contentId);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Prime Content Engine
            </h1>
            <p className="text-muted-foreground mt-1">
              Generate and manage Prime's viral social content
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-emerald-400">{stats.ready}</div>
              <div className="text-sm text-muted-foreground">Ready</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-400">{stats.approved}</div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-gray-400">{stats.posted}</div>
              <div className="text-sm text-muted-foreground">Posted</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-primary">{stats.totalThisWeek}</div>
              <div className="text-sm text-muted-foreground">This Week</div>
            </CardContent>
          </Card>
        </div>

        {/* Generate Section */}
        <Card className="bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Generate New Content
            </CardTitle>
            <CardDescription>Let Prime cook up some viral content for your socials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Select value={selectedType} onValueChange={(v) => setSelectedType(v as ContentType)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Content type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(contentTypeLabels).map(([key, { label, icon }]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        {icon}
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Textarea
                placeholder="Custom topic (optional - leave empty to use trending topics)"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="flex-1 min-w-[300px] h-10 resize-none"
              />

              <Button 
                onClick={handleGenerate} 
                disabled={generating}
                className="bg-primary hover:bg-primary/90"
              >
                {generating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* View Toggle */}
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm text-muted-foreground">View:</span>
          <div className="flex rounded-lg border border-border/50 overflow-hidden">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none"
            >
              <List className="h-4 w-4 mr-1" />
              List
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="rounded-none"
            >
              <CalendarDays className="h-4 w-4 mr-1" />
              Calendar
            </Button>
          </div>
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <PrimeContentCalendar 
            content={allContent} 
            onSelectContent={handleSelectContentFromCalendar}
          />
        )}

        {/* Content Queue (List View) */}
        {viewMode === 'list' && (
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Content Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="ready">Ready ({stats.ready})</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="posted">Posted</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab}>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : content.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No content in this category. Generate some!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {content.map((item) => (
                        <ContentCard
                          key={item.id}
                          content={item}
                          isPlaying={playingAudio === item.id}
                          onPlayAudio={() => item.audio_url && playAudio(item.audio_url, item.id)}
                          onApprove={() => handleApprove(item.id)}
                          onReject={(reason) => handleReject(item.id, reason)}
                          onMarkPosted={(platforms) => handleMarkPosted(item.id, platforms)}
                          onDelete={() => handleDelete(item.id)}
                          onCopy={copyToClipboard}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

interface ContentCardProps {
  content: PrimeContent;
  isPlaying: boolean;
  onPlayAudio: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onMarkPosted: (platforms: string[]) => void;
  onDelete: () => void;
  onCopy: (text: string, label: string) => void;
}

function ContentCard({ 
  content, 
  isPlaying, 
  onPlayAudio, 
  onApprove, 
  onReject, 
  onMarkPosted,
  onDelete,
  onCopy 
}: ContentCardProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const typeInfo = contentTypeLabels[content.content_type];

  const platformContent = content.platform_content || {};

  return (
    <Card className="bg-card border-border/50">
      <CardContent className="pt-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Media Preview */}
          <div className="flex-shrink-0 space-y-2">
            {content.image_url && (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-muted">
                <img 
                  src={content.image_url} 
                  alt="Generated visual" 
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-1 left-1 bg-black/50">
                  <Image className="h-3 w-3" />
                </Badge>
              </div>
            )}
            {content.video_url && (
              <Badge className="bg-purple-500/20 text-purple-400">
                <Video className="h-3 w-3 mr-1" />
                Video
              </Badge>
            )}
            {content.audio_url && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onPlayAudio}
                className="w-full"
              >
                {isPlaying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                {isPlaying ? 'Pause' : 'Play'} Audio
              </Button>
            )}
          </div>

          {/* Content Details */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={typeInfo.color}>
                {typeInfo.icon}
                <span className="ml-1">{typeInfo.label}</span>
              </Badge>
              <Badge className={statusColors[content.status]}>
                {content.status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(content.created_at).toLocaleDateString()}
              </span>
            </div>

            {content.topic && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                <strong>Topic:</strong> {content.topic}
              </p>
            )}

            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-sm line-clamp-3">{content.script}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2"
                onClick={() => onCopy(content.script, 'Script')}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy Script
              </Button>
            </div>

            {/* Platform Previews */}
            {Object.keys(platformContent).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(platformContent).map(([platform, data]) => (
                  <Dialog key={platform}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        {platform}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="capitalize">{platform} Content</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Caption</label>
                          <div className="mt-1 p-3 bg-muted rounded-lg text-sm">
                            {(data as any).caption}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-1"
                            onClick={() => onCopy((data as any).caption, `${platform} caption`)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                        {(data as any).hashtags?.length > 0 && (
                          <div>
                            <label className="text-sm font-medium">Hashtags</label>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {(data as any).hashtags.map((tag: string, i: number) => (
                                <Badge key={i} variant="secondary">#{tag}</Badge>
                              ))}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="mt-1"
                              onClick={() => onCopy((data as any).hashtags.map((t: string) => `#${t}`).join(' '), 'Hashtags')}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy All
                            </Button>
                          </div>
                        )}
                        <Button 
                          className="w-full"
                          onClick={() => {
                            onMarkPosted([platform]);
                          }}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Mark as Posted to {platform}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            )}

            {/* Actions */}
            {(content.status === 'ready' || content.status === 'pending') && (
              <div className="flex gap-2 pt-2">
                <Button onClick={onApprove} size="sm" className="bg-green-600 hover:bg-green-700">
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-400 border-red-400/50">
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reject Content</DialogTitle>
                    </DialogHeader>
                    <Textarea
                      placeholder="Reason for rejection..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        onReject(rejectReason);
                        setShowRejectDialog(false);
                        setRejectReason('');
                      }}
                    >
                      Confirm Reject
                    </Button>
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground ml-auto"
                  onClick={onDelete}
                >
                  Delete
                </Button>
              </div>
            )}

            {content.status === 'approved' && (
              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={() => onMarkPosted(['tiktok', 'instagram', 'twitter'])}
                  size="sm"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Mark All Posted
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
