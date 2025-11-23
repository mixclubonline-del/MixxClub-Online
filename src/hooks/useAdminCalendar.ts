export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  event_type: string;
  event_date: string;
  reminder_date?: string;
  status: string;
  priority?: string;
  is_recurring: boolean;
  recurrence_rule?: string;
  metadata?: any;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export const useAdminCalendar = () => {
  return {
    events: [],
    isLoading: false,
    createEvent: async (event: any) => {},
    updateEvent: async (data: any) => {},
    deleteEvent: async (id: string) => {},
    completeEvent: async (id: string) => {},
  };
};
