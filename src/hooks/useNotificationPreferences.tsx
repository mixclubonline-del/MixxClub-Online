import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface NotificationPreferences {
  session_invitations: boolean;
  collaboration_updates: boolean;
  project_updates: boolean;
  payment_updates: boolean;
  system_notifications: boolean;
  email_notifications: boolean;
}

export const useNotificationPreferences = (userId: string | undefined) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    session_invitations: true,
    collaboration_updates: true,
    project_updates: true,
    payment_updates: true,
    system_notifications: true,
    email_notifications: true,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      loadPreferences();
    }
  }, [userId]);

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setPreferences({
          session_invitations: data.session_invitations,
          collaboration_updates: data.collaboration_updates,
          project_updates: data.project_updates,
          payment_updates: data.payment_updates,
          system_notifications: data.system_notifications,
          email_notifications: data.email_notifications,
        });
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    try {
      const { data: existing } = await supabase
        .from("notification_preferences")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from("notification_preferences")
          .update({ [key]: value })
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("notification_preferences")
          .insert({
            user_id: userId,
            [key]: value,
          });

        if (error) throw error;
      }

      setPreferences((prev) => ({ ...prev, [key]: value }));
      
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      console.error("Error updating preference:", error);
      toast({
        title: "Error",
        description: "Failed to update notification preferences.",
        variant: "destructive",
      });
    }
  };

  return {
    preferences,
    loading,
    updatePreference,
  };
};
