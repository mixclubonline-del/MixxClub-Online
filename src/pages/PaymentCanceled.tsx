import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, MessageCircle } from 'lucide-react';

export default function PaymentCanceled() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/5 py-12">
      <div className="container max-w-lg mx-auto px-4">
        <Card className="p-8 text-center">
          <div className="mb-6">
            <XCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Payment Canceled</h1>
            <p className="text-muted-foreground">
              Your payment was not completed. No charges have been made to your account.
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/pricing">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Pricing
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link to="/contact">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Support
              </Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Having trouble? We're here to help. Reach out to our support team.
          </p>
        </Card>
      </div>
    </div>
  );
}
