import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { StripeConnectWizard } from '@/components/engineer/StripeConnectWizard';
import { useStripeConnect } from '@/hooks/useStripeConnect';

export const PaymentIntegration = () => {
  const { canReceivePayouts, isLoading } = useStripeConnect();

  return (
    <div className="space-y-6">
      {/* Show wizard prominently for unconnected engineers */}
      {!isLoading && !canReceivePayouts && <StripeConnectWizard />}

      <Card>
        <CardHeader>
          <CardTitle>Payment Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {canReceivePayouts
                ? 'Your payment account is active. Earnings are transferred weekly.'
                : 'Complete the payout setup above to start receiving payments for your work.'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
