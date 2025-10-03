import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAdminCalendar } from "@/hooks/useAdminCalendar";
import { Calendar, Clock, AlertCircle, CheckCircle2, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function AdminCalendarWidget() {
  const { events, isLoading, completeEvent } = useAdminCalendar();
  
  const now = new Date();
  const upcomingEvents = events
    .filter(e => new Date(e.event_date) > now && e.status !== 'completed')
    .slice(0, 5);
  const overdueEvents = events
    .filter(e => new Date(e.event_date) < now && e.status !== 'completed');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'deadline': return AlertCircle;
      case 'milestone': return CheckCircle2;
      case 'meeting': return Calendar;
      default: return Clock;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendar & Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-16 bg-muted rounded" />
            <div className="h-16 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendar & Deadlines
            </CardTitle>
            <CardDescription>
              {upcomingEvents.length} upcoming events
              {overdueEvents.length > 0 && 
                `, ${overdueEvents.length} overdue`
              }
            </CardDescription>
          </div>
          <Button size="icon" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {/* Overdue Events */}
            {overdueEvents.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-destructive text-sm font-semibold">
                  <AlertCircle className="h-4 w-4" />
                  Overdue
                </div>
                {overdueEvents.map((event) => {
                  const EventIcon = getEventIcon(event.event_type);
                  return (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-destructive/20 bg-destructive/5"
                    >
                      <EventIcon className="h-4 w-4 text-destructive mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <Badge variant={getPriorityColor(event.priority)} className="text-xs">
                            {event.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Was due {formatDistanceToNow(new Date(event.event_date), { addSuffix: true })}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => completeEvent(event.id)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Clock className="h-4 w-4" />
                  Upcoming
                </div>
                {upcomingEvents.map((event) => {
                  const EventIcon = getEventIcon(event.event_type);
                  return (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <EventIcon className="h-4 w-4 text-primary mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <Badge variant={getPriorityColor(event.priority)} className="text-xs">
                            {event.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(event.event_date), { addSuffix: true })}
                        </p>
                        {event.description && (
                          <p className="text-xs text-muted-foreground">{event.description}</p>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => completeEvent(event.id)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {upcomingEvents.length === 0 && overdueEvents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming events or deadlines</p>
                  <p className="text-sm mt-2">
                    Use Mixx Bot to schedule reminders and track important dates
                  </p>
                </div>
              )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}