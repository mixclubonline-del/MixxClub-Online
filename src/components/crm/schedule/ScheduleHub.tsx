/**
 * ScheduleHub — Calendar view with GlassPanel/HubHeader design tokens.
 * 
 * Queries collaboration_sessions and collaborative_projects for
 * scheduled events and deadlines, displayed in a month-view calendar.
 */

import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Target,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { GlassPanel, HubHeader, EmptyState } from '../design';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';

interface ScheduleEvent {
  id: string;
  title: string;
  date: Date;
  type: 'session' | 'deadline';
  status?: string | null;
}

export const ScheduleHub = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch scheduled sessions
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['schedule-sessions', user?.id, currentMonth.toISOString()],
    queryFn: async () => {
      const monthStart = startOfMonth(currentMonth).toISOString();
      const monthEnd = endOfMonth(currentMonth).toISOString();

      const { data, error } = await supabase
        .from('collaboration_sessions')
        .select('id, title, session_name, scheduled_start, scheduled_end, status')
        .eq('host_user_id', user!.id)
        .not('scheduled_start', 'is', null)
        .gte('scheduled_start', monthStart)
        .lte('scheduled_start', monthEnd)
        .order('scheduled_start', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch project deadlines
  const { data: deadlines, isLoading: deadlinesLoading } = useQuery({
    queryKey: ['schedule-deadlines', user?.id, currentMonth.toISOString()],
    queryFn: async () => {
      const monthStart = startOfMonth(currentMonth).toISOString();
      const monthEnd = endOfMonth(currentMonth).toISOString();

      const { data, error } = await supabase
        .from('collaborative_projects')
        .select('id, title, deadline, status')
        .not('deadline', 'is', null)
        .gte('deadline', monthStart)
        .lte('deadline', monthEnd)
        .order('deadline', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const isLoading = sessionsLoading || deadlinesLoading;

  // Merge sessions and deadlines into a unified event list
  const events: ScheduleEvent[] = useMemo(() => {
    const result: ScheduleEvent[] = [];

    sessions?.forEach((s) => {
      if (s.scheduled_start) {
        result.push({
          id: s.id,
          title: s.title || s.session_name || 'Untitled Session',
          date: parseISO(s.scheduled_start),
          type: 'session',
          status: s.status,
        });
      }
    });

    deadlines?.forEach((d) => {
      if (d.deadline) {
        result.push({
          id: d.id,
          title: d.title,
          date: parseISO(d.deadline),
          type: 'deadline',
          status: d.status,
        });
      }
    });

    return result.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [sessions, deadlines]);

  // Calendar grid days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDay = monthStart.getDay();
    const padding = Array.from({ length: startDay }, () => null);
    return [...padding, ...days];
  }, [currentMonth]);

  const getEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(e.date, day));

  // Upcoming events (next 7 days from today)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return events.filter((e) => e.date >= now && e.date <= weekFromNow);
  }, [events]);

  const weekDays = isMobile
    ? ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      <HubHeader
        icon={<Calendar className="h-5 w-5 text-blue-400" />}
        title="Schedule"
        subtitle="Sessions, deadlines, and upcoming events"
        accent="rgba(59, 130, 246, 0.5)"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="border-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold text-foreground min-w-[140px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="border-white/10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {/* Calendar Grid */}
      <GlassPanel glow accent="rgba(59, 130, 246, 0.3)" padding="p-4">
        {isLoading ? (
          <HubSkeleton variant="cards" count={6} />
        ) : (
          <>
            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day, i) => (
                <div
                  key={`${day}-${i}`}
                  className="text-center text-xs font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar cells */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const dayEvents = getEventsForDay(day);
                const hasSession = dayEvents.some((e) => e.type === 'session');
                const hasDeadline = dayEvents.some((e) => e.type === 'deadline');
                const today = isToday(day);
                const inMonth = isSameMonth(day, currentMonth);

                return (
                  <motion.div
                    key={day.toISOString()}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.005 }}
                    className={`
                      aspect-square rounded-lg flex flex-col items-center justify-center relative
                      text-sm transition-all cursor-default
                      ${today ? 'bg-primary/20 border border-primary/40 font-bold text-primary' : ''}
                      ${!inMonth ? 'text-muted-foreground/30' : 'text-foreground'}
                      ${dayEvents.length > 0 ? 'hover:bg-accent/10' : ''}
                    `}
                  >
                    <span className={isMobile ? 'text-xs' : 'text-sm'}>
                      {format(day, 'd')}
                    </span>

                    {dayEvents.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {hasSession && (
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        )}
                        {hasDeadline && (
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                Session
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                Deadline
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded border border-primary/40 bg-primary/20" />
                Today
              </div>
            </div>
          </>
        )}
      </GlassPanel>

      {/* Upcoming Events */}
      <GlassPanel padding="p-5" accent="rgba(59, 130, 246, 0.2)">
        <HubHeader
          icon={<Clock className="h-5 w-5 text-blue-400" />}
          title="Upcoming This Week"
          subtitle={`${upcomingEvents.length} event${upcomingEvents.length !== 1 ? 's' : ''} ahead`}
          accent="rgba(59, 130, 246, 0.5)"
        />

        <div className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : upcomingEvents.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No upcoming events"
              description="Scheduled sessions and deadlines will appear here"
            />
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <GlassPanel
                  key={event.id}
                  hoverable
                  padding="p-3"
                  accent={event.type === 'session' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(239, 68, 68, 0.3)'}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full shrink-0 ${
                        event.type === 'session'
                          ? 'bg-blue-500/10 text-blue-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}
                    >
                      {event.type === 'session' ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <Target className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-foreground">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(event.date, isMobile ? 'MMM d' : 'EEEE, MMM d · h:mm a')}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        event.type === 'session'
                          ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                          : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }
                    >
                      {event.type === 'session' ? 'Session' : 'Deadline'}
                    </Badge>
                  </div>
                </GlassPanel>
              ))}
            </div>
          )}
        </div>
      </GlassPanel>
    </div>
  );
};
