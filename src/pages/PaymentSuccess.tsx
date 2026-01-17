import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  CheckCircle2, 
  Download, 
  Home, 
  Loader2, 
  Mail, 
  MessageCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentDetails {
  id: string | null;
  amount: number;
  currency: string;
  packageType: string;
  packageName: string;
  status: string;
  completedAt: string;
}

interface VerificationResponse {
  success: boolean;
  payment: PaymentDetails;
  customer: {
    email: string | null;
  };
}

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState<VerificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  useEffect(() => {
    const verifySession = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setLoading(false);
        return;
      }

      try {
        const { data, error: invokeError } = await supabase.functions.invoke('verify-stripe-session', {
          body: { sessionId }
        });

        if (invokeError) throw invokeError;

        setVerification(data);

        // Trigger confetti on successful payment
        if (data?.success) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } catch (err) {
        console.error('Verification error:', err);
        setError('Failed to verify payment. Please contact support if you were charged.');
        toast.error('Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [sessionId]);

  const handleDownloadInvoice = async () => {
    if (!verification?.payment?.id) {
      toast.error('No payment record found');
      return;
    }

    setDownloadingInvoice(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-invoice', {
        body: { paymentId: verification.payment.id }
      });

      if (error) throw error;

      // Create blob and download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${verification.payment.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Invoice downloaded');
    } catch (err) {
      console.error('Invoice download error:', err);
      toast.error('Failed to download invoice');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-accent/5">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error || !verification?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-accent/5 px-4">
        <Card className="p-8 max-w-md text-center space-y-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <MessageCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Verification Issue</h1>
          <p className="text-muted-foreground">
            {error || 'We couldn\'t verify your payment. If you were charged, please contact our support team.'}
          </p>
          <div className="flex flex-col gap-2 pt-4">
            <Button asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/support">Contact Support</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const { payment, customer } = verification;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/5 py-12 px-4">
      <div className="container max-w-2xl mx-auto">
        <Card className="p-8 space-y-8">
          {/* Success Header */}
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-500 animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold">Payment Successful!</h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. Your order has been confirmed.
            </p>
          </div>

          <Separator />

          {/* Order Details */}
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Order Details</h2>
            
            <div className="bg-accent/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Package</span>
                <span className="font-medium">{payment.packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="capitalize">{payment.packageType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold text-lg">
                  ${payment.amount.toFixed(2)} {payment.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="inline-flex items-center gap-1 text-green-500">
                  <CheckCircle2 className="w-4 h-4" />
                  Completed
                </span>
              </div>
              {payment.id && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-mono text-sm">{payment.id.slice(0, 8)}...</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span>{new Date(payment.completedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Confirmation Email */}
          {customer.email && (
            <div className="flex items-start gap-3 bg-primary/5 rounded-lg p-4">
              <Mail className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Confirmation email sent</p>
                <p className="text-sm text-muted-foreground">
                  We've sent a receipt to <strong>{customer.email}</strong>
                </p>
              </div>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1" asChild>
              <Link to="/dashboard">
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
            
            {payment.id && (
              <Button 
                variant="outline" 
                onClick={handleDownloadInvoice}
                disabled={downloadingInvoice}
              >
                {downloadingInvoice ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download Invoice
              </Button>
            )}
          </div>

          {/* Next Steps */}
          <div className="bg-accent/30 rounded-lg p-4 space-y-3">
            <h3 className="font-medium">What's Next?</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              {payment.packageType === 'mixing' || payment.packageType === 'mastering' ? (
                <>
                  <p className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-primary" />
                    Upload your audio files in your dashboard
                  </p>
                  <p className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-primary" />
                    Our engineers will begin working on your project
                  </p>
                  <p className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-primary" />
                    You'll receive updates via email and in-app notifications
                  </p>
                </>
              ) : payment.packageType === 'subscription' ? (
                <>
                  <p className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-primary" />
                    Your subscription is now active
                  </p>
                  <p className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-primary" />
                    Access all premium features from your dashboard
                  </p>
                  <p className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-primary" />
                    Manage your subscription in Settings
                  </p>
                </>
              ) : (
                <>
                  <p className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-primary" />
                    Your purchase is being processed
                  </p>
                  <p className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-primary" />
                    Check your dashboard for updates
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Support Link */}
          <p className="text-center text-sm text-muted-foreground">
            Questions? <Link to="/support" className="text-primary hover:underline">Contact our support team</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
