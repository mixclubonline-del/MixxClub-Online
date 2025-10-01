import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const NotificationTestPanel = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const triggerTestNotification = async (type: string, title: string, message: string) => {
    if (!user) {
      toast.error("You must be logged in to test notifications");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc('create_notification', {
        p_user_id: user.id,
        p_type: type,
        p_title: title,
        p_message: message,
        p_action_url: '/artist-crm',
        p_metadata: { test: true, timestamp: new Date().toISOString() }
      });

      if (error) throw error;
      toast.success("Test notification sent!");
    } catch (error) {
      console.error("Error sending test notification:", error);
      toast.error("Failed to send test notification");
    } finally {
      setLoading(false);
    }
  };

  const testScenarios = [
    {
      type: "project_update",
      title: "Project Status Updated",
      message: "Your project 'Test Track' status changed to in_progress",
      description: "Tests project update notifications"
    },
    {
      type: "review_received",
      title: "New Review Received",
      message: "You received a 5.0 star review on your recent project",
      description: "Tests review notification system"
    },
    {
      type: "bonus_awarded",
      title: "Bonus Awarded! 🎉",
      message: "You earned a $50 bonus for excellent work",
      description: "Tests bonus notification system"
    },
    {
      type: "payment_received",
      title: "Payment Received",
      message: "You received a payment of $200",
      description: "Tests payment notification system"
    },
    {
      type: "job_application",
      title: "New Job Application",
      message: "An engineer applied to your job posting",
      description: "Tests job application notifications"
    },
    {
      type: "review_prompt",
      title: "Rate Your Engineer",
      message: "Your project is complete! Please rate your experience.",
      description: "Tests review prompt notifications"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Testing Panel</CardTitle>
        <CardDescription>
          Test real-time notifications by triggering different notification types
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testScenarios.map((scenario) => (
            <Card key={scenario.type}>
              <CardHeader>
                <CardTitle className="text-sm">{scenario.title}</CardTitle>
                <CardDescription className="text-xs">
                  {scenario.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => triggerTestNotification(scenario.type, scenario.title, scenario.message)}
                  disabled={loading}
                  className="w-full"
                  size="sm"
                >
                  Trigger Test
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Testing Instructions:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Click any test button above to trigger a notification</li>
            <li>Check the notification bell icon in the navigation bar for the unread count</li>
            <li>Click the bell icon to open the notification panel</li>
            <li>Verify the notification appears with correct content</li>
            <li>Test marking notifications as read</li>
            <li>Test on mobile devices for mobile compatibility</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
