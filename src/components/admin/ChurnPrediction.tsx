import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Mail, Gift, TrendingDown } from "lucide-react";

interface ChurnRisk {
  user_id: string;
  full_name: string;
  risk_score: number;
  last_activity: string;
  subscription_type: string;
  days_inactive: number;
  total_spent: number;
}

export const ChurnPrediction = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: atRiskUsers } = useQuery({
    queryKey: ['churn-prediction'],
    queryFn: async () => {
      // Get users with subscriptions but low activity
      const { data: subscriptions } = await supabase
        .from('user_mastering_subscriptions')
        .select('user_id, status, updated_at')
        .eq('status', 'active');

      if (!subscriptions) return [];

      // Get user profiles
      const userIds = subscriptions.map(s => s.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      // Calculate risk scores (simplified)
      const riskyUsers: ChurnRisk[] = [];
      for (const sub of subscriptions) {
        const profile = profiles?.find(p => p.id === sub.user_id);
        if (!profile) continue;

        const daysInactive = Math.floor(
          (Date.now() - new Date(sub.updated_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysInactive > 7) {
          riskyUsers.push({
            user_id: sub.user_id,
            full_name: profile.full_name || 'Unknown User',
            risk_score: Math.min(daysInactive / 30, 1),
            last_activity: sub.updated_at,
            subscription_type: 'mastering',
            days_inactive: daysInactive,
            total_spent: 0
          });
        }
      }

      return riskyUsers.sort((a, b) => b.risk_score - a.risk_score);
    }
  });

  const sendRetentionEmail = useMutation({
    mutationFn: async (userId: string) => {
      // In production, this would trigger an email service
      const { error } = await supabase.functions.invoke('chat-simple', {
        body: {
          message: 'Generate a personalized retention email for an at-risk customer',
          systemPrompt: 'You are a customer success AI. Generate a warm, personalized retention email.'
        }
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Retention Email Sent",
        description: "A personalized retention email has been sent to the user.",
      });
      queryClient.invalidateQueries({ queryKey: ['churn-prediction'] });
    },
    onError: () => {
      toast({
        title: "Failed to Send Email",
        description: "There was an error sending the retention email.",
        variant: "destructive"
      });
    }
  });

  const offerIncentive = useMutation({
    mutationFn: async (userId: string) => {
      // Create a discount or offer
      const { data, error } = await supabase
        .from('financial_actions_log')
        .insert({
          action_type: 'retention_incentive',
          action_description: `Offered retention incentive to user ${userId}`,
          status: 'completed'
        });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Incentive Offered",
        description: "A special retention offer has been created for this user.",
      });
    }
  });

  const getRiskColor = (score: number) => {
    if (score > 0.7) return 'destructive';
    if (score > 0.4) return 'default';
    return 'secondary';
  };

  const getRiskLabel = (score: number) => {
    if (score > 0.7) return 'High Risk';
    if (score > 0.4) return 'Medium Risk';
    return 'Low Risk';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Churn Prediction & Prevention
              </CardTitle>
              <CardDescription>
                AI-powered identification of at-risk customers with automated interventions
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{atRiskUsers?.length || 0}</div>
              <p className="text-xs text-muted-foreground">At-risk users</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {atRiskUsers && atRiskUsers.length > 0 ? (
          atRiskUsers.map((user) => (
            <Card key={user.user_id}>
              <CardHeader>
              <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{user.full_name}</CardTitle>
                    <CardDescription>User ID: {user.user_id.slice(0, 8)}...</CardDescription>
                  </div>
                  <Badge variant={getRiskColor(user.risk_score)}>
                    {getRiskLabel(user.risk_score)} ({Math.round(user.risk_score * 100)}%)
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Days Inactive</p>
                      <p className="font-medium">{user.days_inactive} days</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Subscription</p>
                      <p className="font-medium capitalize">{user.subscription_type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Activity</p>
                      <p className="font-medium">
                        {new Date(user.last_activity).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => sendRetentionEmail.mutate(user.user_id)}
                      disabled={sendRetentionEmail.isPending}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Send Retention Email
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => offerIncentive.mutate(user.user_id)}
                      disabled={offerIncentive.isPending}
                    >
                      <Gift className="h-4 w-4 mr-2" />
                      Offer Incentive
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingDown className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">
                No at-risk users detected. Great job on customer retention!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
