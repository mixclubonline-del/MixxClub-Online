import { useEffect, useState } from "react";
import { useFlowNavigation } from '@/core/fabric/useFlow';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, Mail, Users, Briefcase, DollarSign, Settings } from "lucide-react";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationPreferences() {
  const { goBack } = useFlowNavigation();
  const [userId, setUserId] = useState<string>();
  const { preferences, loading, updatePreference } = useNotificationPreferences(userId);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
      }
    });
  }, []);

  const preferenceItems = [
    {
      key: "session_invitations" as const,
      icon: Users,
      title: "Session Invitations",
      description: "Get notified when you're invited to collaboration sessions",
    },
    {
      key: "collaboration_updates" as const,
      icon: Briefcase,
      title: "Collaboration Updates",
      description: "Receive updates about your active collaboration sessions",
    },
    {
      key: "project_updates" as const,
      icon: Settings,
      title: "Project Updates",
      description: "Stay informed about changes to your projects",
    },
    {
      key: "payment_updates" as const,
      icon: DollarSign,
      title: "Payment Updates",
      description: "Get notified about payments and transactions",
    },
    {
      key: "system_notifications" as const,
      icon: Bell,
      title: "System Notifications",
      description: "Receive important system announcements and updates",
    },
    {
      key: "email_notifications" as const,
      icon: Mail,
      title: "Email Notifications",
      description: "Also send notifications to your email address",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => goBack()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notification Preferences</h1>
            <p className="text-muted-foreground mt-2">
              Manage how you receive notifications and updates
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Choose which notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex items-center justify-between space-x-4">
                      <div className="flex items-start space-x-4 flex-1">
                        <Skeleton className="h-10 w-10 rounded" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-full max-w-md" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-11 rounded-full" />
                    </div>
                  ))}
                </>
              ) : (
                preferenceItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between space-x-4"
                    >
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1 flex-1">
                          <Label htmlFor={item.key} className="text-base font-medium cursor-pointer">
                            {item.title}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <Switch
                        id={item.key}
                        checked={preferences[item.key]}
                        onCheckedChange={(checked) => updatePreference(item.key, checked)}
                      />
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Bell className="h-5 w-5 text-primary mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Real-time notifications</p>
                  <p className="text-sm text-muted-foreground">
                    In-app notifications will still appear in real-time regardless of these settings. 
                    These preferences control which notifications trigger alerts and emails.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
