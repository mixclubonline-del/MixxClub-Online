import { useSearchParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  XCircle, 
  ArrowLeft, 
  MessageCircle, 
  RefreshCw, 
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

const typeConfig: Record<string, { label: string; returnPath: string; returnLabel: string }> = {
  subscription: { label: 'Subscription', returnPath: '/pricing', returnLabel: 'View Plans' },
  mixing: { label: 'Mixing Service', returnPath: '/services/mixing', returnLabel: 'View Mixing Packages' },
  mastering: { label: 'Mastering Service', returnPath: '/services/mastering', returnLabel: 'View Mastering Packages' },
  beat: { label: 'Beat Purchase', returnPath: '/marketplace', returnLabel: 'Browse Beats' },
};

export default function PaymentCanceled() {
  const [searchParams] = useSearchParams();
  const paymentType = searchParams.get('type') || '';
  const config = typeConfig[paymentType];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/5 py-12 px-4">
      <div className="container max-w-2xl mx-auto">
        <Card className="p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold">Payment Canceled</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              {config
                ? `Your ${config.label.toLowerCase()} payment was not completed. No charges have been made.`
                : 'Your payment was not completed. No charges have been made to your account.'}
            </p>
          </div>

          <Separator />

          {/* Security Notice */}
          <div className="flex items-start gap-3 bg-primary/5 rounded-lg p-4">
            <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-sm">Your information is safe</p>
              <p className="text-sm text-muted-foreground">
                No payment was processed and no card details were stored.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {config ? (
              <Button className="flex-1" asChild>
                <Link to={config.returnPath}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {config.returnLabel}
                </Link>
              </Button>
            ) : (
              <Button className="flex-1" asChild>
                <Link to="/pricing">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Return to Pricing
                </Link>
              </Button>
            )}

            <Button variant="outline" className="flex-1" asChild>
              <Link to="/contact">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Support
              </Link>
            </Button>
          </div>

          {/* FAQ */}
          <div className="bg-accent/30 rounded-lg p-4 space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Common Questions
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Was I charged?</strong> No — canceling before completion means no charge is made.</p>
              <p><strong>Can I try again?</strong> Absolutely. Return to the pricing page and select your package.</p>
              <p><strong>Need help?</strong> Our support team is available 24/7 to assist with payment issues.</p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground">
            Questions? <Link to="/contact" className="text-primary hover:underline">Contact our support team</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
