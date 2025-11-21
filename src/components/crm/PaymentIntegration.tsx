import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const PaymentIntegration = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Integration</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Payment processing is handled through Stripe checkout sessions.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
