import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Headphones, 
  DollarSign, 
  FolderOpen, 
  Phone, 
  Users,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCRMInteractions } from '@/hooks/useCRMInteractions';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

const interactionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  message: MessageSquare,
  session: Headphones,
  payment: DollarSign,
  project: FolderOpen,
  call: Phone,
  meeting: Users,
};

const interactionColors: Record<string, string> = {
  message: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  session: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  payment: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  project: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  call: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  meeting: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
};

const sentimentColors: Record<string, string> = {
  positive: 'text-emerald-400',
  neutral: 'text-muted-foreground',
  negative: 'text-red-400',
};

export const InteractionTimeline: React.FC = () => {
  const { interactions, loading: isLoading } = useCRMInteractions();

  // Group interactions by date
  const groupedInteractions = React.useMemo(() => {
    if (!interactions) return {};
    
    const groups: Record<string, typeof interactions> = {};
    
    interactions.forEach((interaction) => {
      const date = format(new Date(interaction.occurred_at), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(interaction);
    });

    return groups;
  }, [interactions]);

  const sortedDates = Object.keys(groupedInteractions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  // Calculate stats
  const totalInteractions = interactions?.length || 0;
  const thisWeek = interactions?.filter((i) => {
    const date = new Date(i.occurred_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date >= weekAgo;
  }).length || 0;

  const positiveCount = interactions?.filter((i) => i.sentiment === 'positive').length || 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-accent rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold">{totalInteractions}</p>
            <p className="text-xs text-muted-foreground">Total Interactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-emerald-400 mb-1" />
            <p className="text-2xl font-bold">{thisWeek}</p>
            <p className="text-xs text-muted-foreground">This Week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-5 w-5 mx-auto text-blue-400 mb-1" />
            <p className="text-2xl font-bold">{positiveCount}</p>
            <p className="text-xs text-muted-foreground">Positive</p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedDates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No activity yet</p>
              <p className="text-sm">Interactions will appear here as you engage with clients</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-8">
                {sortedDates.map((date) => (
                  <div key={date}>
                    {/* Date Header */}
                    <div className="sticky top-0 bg-card z-10 py-2">
                      <Badge variant="outline" className="text-xs">
                        {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                      </Badge>
                    </div>

                    {/* Interactions for this date */}
                    <div className="relative ml-4 border-l-2 border-border pl-6 space-y-4 mt-4">
                      {groupedInteractions[date].map((interaction, index) => {
                        const Icon = interactionIcons[interaction.interaction_type] || MessageSquare;
                        
                        return (
                          <motion.div
                            key={interaction.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative"
                          >
                            {/* Timeline dot */}
                            <div 
                              className={cn(
                                'absolute -left-[33px] h-4 w-4 rounded-full border-2 border-card',
                                interactionColors[interaction.interaction_type]?.split(' ')[0] || 'bg-muted'
                              )}
                            />

                            {/* Content */}
                            <div className="group p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                              <div className="flex items-start gap-3">
                                <div 
                                  className={cn(
                                    'h-10 w-10 rounded-full flex items-center justify-center shrink-0',
                                    interactionColors[interaction.interaction_type] || 'bg-muted'
                                  )}
                                >
                                  <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {interaction.interaction_type}
                                    </Badge>
                                    {interaction.sentiment && (
                                      <span 
                                        className={cn(
                                          'text-xs capitalize',
                                          sentimentColors[interaction.sentiment]
                                        )}
                                      >
                                        {interaction.sentiment}
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-1 text-sm text-foreground">
                                    {interaction.summary}
                                  </p>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {format(new Date(interaction.occurred_at), 'h:mm a')}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
