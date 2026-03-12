import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, ExternalLink, Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionManagement } from '@/hooks/useSubscriptionManagement';

const TIER_LABELS: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  pro: 'Pro',
  studio: 'Studio',
};

const TIER_COLORS: Record<string, string> = {
  free: 'bg-muted text-muted-foreground',
  starter: 'bg-primary/10 text-primary',
  pro: 'bg-accent text-accent-foreground',
  studio: 'bg-primary text-primary-foreground',
};

export function SubscriptionSettings() {
  const navigate = useNavigate();
  const { currentPlan, loading, openCustomerPortal } = useSubscriptionManagement();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const tier = currentPlan?.tier || 'free';
  const isSubscribed = currentPlan?.subscribed || false;
  const endDate = currentPlan?.subscriptionEnd
    ? new Date(currentPlan.subscriptionEnd).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
          <CardDescription>
            Manage your subscription and billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Badge className={TIER_COLORS[tier] || TIER_COLORS.free}>
                {TIER_LABELS[tier] || 'Free'}
              </Badge>
              <div>
                <p className="font-semibold">
                  {TIER_LABELS[tier] || 'Free'} Plan
                </p>
                {isSubscribed && endDate && (
                  <p className="text-sm text-muted-foreground">
                    Renews on {endDate}
                  </p>
                )}
                {!isSubscribed && (
                  <p className="text-sm text-muted-foreground">
                    Upgrade to unlock more features
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {isSubscribed && (
              <Button
                variant="outline"
                onClick={openCustomerPortal}
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Manage Subscription
              </Button>
            )}
            {tier !== 'studio' && (
              <Button
                onClick={() => navigate('/pricing')}
                className="flex-1"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isSubscribed ? 'Change Plan' : 'Upgrade'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
