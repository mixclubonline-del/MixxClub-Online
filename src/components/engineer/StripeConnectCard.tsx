import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Loader2,
  CreditCard,
  ExternalLink,
  Clock
} from 'lucide-react';
import { useStripeConnect } from '@/hooks/useStripeConnect';

interface StripeConnectCardProps {
  compact?: boolean;
}

export const StripeConnectCard = ({ compact = false }: StripeConnectCardProps) => {
  const { 
    status, 
    isLoading, 
    isOnboarding, 
    startOnboarding,
    refreshStatus,
    canReceivePayouts,
    hasRequirements,
  } = useStripeConnect();

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Not connected - show onboarding CTA
  if (!status.connected) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
        <CardHeader className={compact ? 'pb-2' : ''}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className={compact ? 'text-lg' : 'text-xl'}>
                Connect Your Bank Account
              </CardTitle>
              {!compact && (
                <CardDescription>
                  Start receiving payouts for your work
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!compact && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>70% revenue share</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Weekly automatic payouts</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Secure via Stripe</span>
              </div>
            </div>
          )}
          
          <Button 
            onClick={startOnboarding} 
            disabled={isOnboarding}
            className="w-full"
            size={compact ? 'default' : 'lg'}
          >
            {isOnboarding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Get Paid
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Connected but setup incomplete
  if (!status.detailsSubmitted || hasRequirements) {
    return (
      <Card className="bg-yellow-500/10 border-yellow-500/30">
        <CardHeader className={compact ? 'pb-2' : ''}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <CardTitle className={compact ? 'text-lg' : 'text-xl'}>
                  Complete Your Setup
                </CardTitle>
                {!compact && (
                  <CardDescription className="text-yellow-400/80">
                    A few more steps to start receiving payouts
                  </CardDescription>
                )}
              </div>
            </div>
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              <AlertCircle className="w-3 h-3 mr-1" />
              Pending
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {status.requirements.currently_due.length > 0 && !compact && (
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-yellow-400 font-medium mb-2">
                Items needed:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {status.requirements.currently_due.slice(0, 3).map((req, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                    {req.replace(/_/g, ' ').replace(/\./g, ' → ')}
                  </li>
                ))}
                {status.requirements.currently_due.length > 3 && (
                  <li className="text-yellow-400">
                    +{status.requirements.currently_due.length - 3} more items
                  </li>
                )}
              </ul>
            </div>
          )}
          
          <Button 
            onClick={startOnboarding} 
            disabled={isOnboarding}
            className="w-full bg-yellow-600 hover:bg-yellow-700"
          >
            {isOnboarding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Opening...
              </>
            ) : (
              <>
                Continue Setup
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Fully connected and enabled
  if (canReceivePayouts) {
    return (
      <Card className="bg-green-500/10 border-green-500/30">
        <CardHeader className={compact ? 'pb-2' : ''}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <CardTitle className={compact ? 'text-lg' : 'text-xl'}>
                  Payouts Enabled
                </CardTitle>
                {!compact && status.details.bankLast4 && (
                  <CardDescription className="text-green-400/80">
                    Bank account ****{status.details.bankLast4}
                  </CardDescription>
                )}
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Active
            </Badge>
          </div>
        </CardHeader>
        {!compact && (
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Your earnings will be automatically transferred weekly
              </p>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.open('https://dashboard.stripe.com/connect/accounts/overview', '_blank')}
              >
                Manage Account
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    );
  }

  // Connected but restricted
  return (
    <Card className="bg-red-500/10 border-red-500/30">
      <CardHeader className={compact ? 'pb-2' : ''}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <CardTitle className={compact ? 'text-lg' : 'text-xl'}>
                Account Restricted
              </CardTitle>
              {!compact && (
                <CardDescription className="text-red-400/80">
                  Action required to resume payouts
                </CardDescription>
              )}
            </div>
          </div>
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            Restricted
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={startOnboarding} 
          disabled={isOnboarding}
          variant="destructive"
          className="w-full"
        >
          {isOnboarding ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Opening...
            </>
          ) : (
            <>
              Resolve Issues
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
