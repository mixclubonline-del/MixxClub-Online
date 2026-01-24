import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Zap,
  Mic,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Play,
  Video,
  Image
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, isToday } from 'date-fns';
import type { PrimeContent, ContentType, ContentStatus } from '@/lib/api/prime-content';

interface PrimeContentCalendarProps {
  content: PrimeContent[];
  onSelectContent: (content: PrimeContent) => void;
}

const contentTypeIcons: Record<ContentType, React.ReactNode> = {
  'hot-take': <Zap className="h-3 w-3" />,
  'production-tip': <Mic className="h-3 w-3" />,
  'industry-insight': <TrendingUp className="h-3 w-3" />,
  'platform-promo': <Sparkles className="h-3 w-3" />,
  'trend-reaction': <RefreshCw className="h-3 w-3" />
};

const statusColors: Record<ContentStatus, string> = {
  pending: 'bg-yellow-500',
  generating: 'bg-blue-500',
  ready: 'bg-emerald-500',
  approved: 'bg-green-500',
  scheduled: 'bg-purple-500',
  posted: 'bg-muted-foreground',
  rejected: 'bg-destructive'
};

const contentTypeColors: Record<ContentType, string> = {
  'hot-take': 'bg-orange-500/80',
  'production-tip': 'bg-blue-500/80',
  'industry-insight': 'bg-purple-500/80',
  'platform-promo': 'bg-green-500/80',
  'trend-reaction': 'bg-pink-500/80'
};

export default function PrimeContentCalendar({ content, onSelectContent }: PrimeContentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const contentByDate = useMemo(() => {
    const map = new Map<string, PrimeContent[]>();
    
    content.forEach((item) => {
      // Use scheduled_for if available, otherwise created_at
      const dateKey = item.scheduled_for 
        ? format(new Date(item.scheduled_for), 'yyyy-MM-dd')
        : format(new Date(item.created_at), 'yyyy-MM-dd');
      
      const existing = map.get(dateKey) || [];
      map.set(dateKey, [...existing, item]);
    });
    
    return map;
  }, [content]);

  const selectedDateContent = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return contentByDate.get(dateKey) || [];
  }, [selectedDate, contentByDate]);

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  // Get first day of month to calculate offset
  const firstDayOfMonth = startOfMonth(currentMonth);
  const startOffset = firstDayOfMonth.getDay(); // 0 = Sunday

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Content Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button variant="ghost" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for offset */}
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="h-24 bg-muted/20 rounded-md" />
          ))}

          {/* Day cells */}
          {days.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayContent = contentByDate.get(dateKey) || [];
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentDay = isToday(day);

            return (
              <Dialog key={dateKey}>
                <DialogTrigger asChild>
                  <button
                    onClick={() => setSelectedDate(day)}
                    className={`
                      h-24 p-1 rounded-md border transition-all text-left
                      hover:border-primary/50 hover:bg-accent/30
                      ${isSelected ? 'border-primary bg-accent/50' : 'border-border/30 bg-muted/10'}
                      ${isCurrentDay ? 'ring-2 ring-primary/50' : ''}
                    `}
                  >
                    <div className={`
                      text-xs font-medium mb-1
                      ${isCurrentDay ? 'text-primary' : 'text-foreground'}
                    `}>
                      {format(day, 'd')}
                    </div>
                    
                    {/* Content indicators */}
                    <div className="space-y-0.5 overflow-hidden">
                      {dayContent.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className={`
                            flex items-center gap-1 px-1 py-0.5 rounded text-[10px] text-white truncate
                            ${contentTypeColors[item.content_type]}
                          `}
                        >
                          {contentTypeIcons[item.content_type]}
                          <span className="truncate">{item.topic || item.content_type}</span>
                        </div>
                      ))}
                      {dayContent.length > 3 && (
                        <div className="text-[10px] text-muted-foreground px-1">
                          +{dayContent.length - 3} more
                        </div>
                      )}
                    </div>
                  </button>
                </DialogTrigger>

                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      Content for {format(day, 'MMMM d, yyyy')}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <ScrollArea className="max-h-[60vh]">
                    {dayContent.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No content scheduled for this day
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {dayContent.map((item) => (
                          <ContentPreviewCard 
                            key={item.id} 
                            content={item}
                            onSelect={() => onSelectContent(item)}
                          />
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border/30">
          <span className="text-xs text-muted-foreground">Content Types:</span>
          {Object.entries(contentTypeColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-xs capitalize">{type.replace('-', ' ')}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface ContentPreviewCardProps {
  content: PrimeContent;
  onSelect: () => void;
}

function ContentPreviewCard({ content, onSelect }: ContentPreviewCardProps) {
  const typeColor = contentTypeColors[content.content_type];
  const statusColor = statusColors[content.status];

  return (
    <div 
      onClick={onSelect}
      className="p-3 rounded-lg border border-border/50 bg-card hover:bg-accent/30 cursor-pointer transition-colors"
    >
      <div className="flex gap-3">
        {/* Thumbnail */}
        {content.image_url && (
          <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-muted">
            <img 
              src={content.image_url} 
              alt="" 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={`${typeColor} text-white text-[10px]`}>
              {contentTypeIcons[content.content_type]}
              <span className="ml-1 capitalize">{content.content_type.replace('-', ' ')}</span>
            </Badge>
            <div className={`w-2 h-2 rounded-full ${statusColor}`} title={content.status} />
            <span className="text-xs text-muted-foreground capitalize">{content.status}</span>
          </div>

          {content.topic && (
            <p className="text-sm font-medium line-clamp-1 mb-1">
              {content.topic}
            </p>
          )}

          <p className="text-xs text-muted-foreground line-clamp-2">
            {content.script}
          </p>

          {/* Media indicators */}
          <div className="flex items-center gap-2 mt-2">
            {content.audio_url && (
              <Badge variant="outline" className="text-[10px]">
                <Play className="h-2 w-2 mr-1" />
                Audio
              </Badge>
            )}
            {content.video_url && (
              <Badge variant="outline" className="text-[10px]">
                <Video className="h-2 w-2 mr-1" />
                Video
              </Badge>
            )}
            {content.image_url && (
              <Badge variant="outline" className="text-[10px]">
                <Image className="h-2 w-2 mr-1" />
                Image
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
