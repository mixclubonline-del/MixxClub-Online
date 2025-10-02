import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface CalendarEvent {
  id: string;
  user_id: string;
  event_type: 'deadline' | 'reminder' | 'milestone' | 'meeting' | 'release' | 'review';
  title: string;
  description?: string;
  event_date: string;
  reminder_date?: string;
  status: 'pending' | 'completed' | 'cancelled' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, any>;
  is_recurring: boolean;
  recurrence_rule?: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
}

export const useAdminCalendarEvents = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["admin-calendar-events", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("admin_calendar_events")
        .select("*")
        .eq("user_id", user.id)
        .order("event_date", { ascending: true });
      
      if (error) throw error;
      return data as CalendarEvent[];
    },
    enabled: !!user,
  });
};

export const useUpcomingEvents = (limit: number = 5) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["admin-upcoming-events", user?.id, limit],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("admin_calendar_events")
        .select("*")
        .eq("user_id", user.id)
        .gte("event_date", new Date().toISOString())
        .in("status", ["pending"])
        .order("event_date", { ascending: true })
        .limit(limit);
      
      if (error) throw error;
      return data as CalendarEvent[];
    },
    enabled: !!user,
  });
};

export const useOverdueEvents = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["admin-overdue-events", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("admin_calendar_events")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "overdue")
        .order("event_date", { ascending: false });
      
      if (error) throw error;
      return data as CalendarEvent[];
    },
    enabled: !!user,
  });
};

export const useCreateCalendarEvent = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (eventData: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("admin_calendar_events")
        .insert({
          ...eventData,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-calendar-events"] });
      queryClient.invalidateQueries({ queryKey: ["admin-upcoming-events"] });
      toast.success("Event scheduled successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create event");
      console.error(error);
    },
  });
};

export const useUpdateCalendarEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CalendarEvent> & { id: string }) => {
      const { data, error } = await supabase
        .from("admin_calendar_events")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-calendar-events"] });
      queryClient.invalidateQueries({ queryKey: ["admin-upcoming-events"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overdue-events"] });
      toast.success("Event updated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to update event");
      console.error(error);
    },
  });
};

export const useDeleteCalendarEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("admin_calendar_events")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-calendar-events"] });
      queryClient.invalidateQueries({ queryKey: ["admin-upcoming-events"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overdue-events"] });
      toast.success("Event deleted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to delete event");
      console.error(error);
    },
  });
};

export const useCompleteCalendarEvent = () => {
  const updateEvent = useUpdateCalendarEvent();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return updateEvent.mutateAsync({
        id,
        status: 'completed',
        completed_at: new Date().toISOString(),
      });
    },
  });
};