import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Download, Loader2, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function OrderSuccess() {
  const { paymentId } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<any>(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  useEffect(() => {
    const loadPayment = async () => {
      if (!paymentId) return;

      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*, project:projects(title)')
          .eq('id', paymentId)
          .single();

        if (error) throw error;
        setPayment(data);
      } catch (error) {
        console.error('Error loading payment:', error);
        toast({
          title: 'Error',
          description: 'Failed to load order details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadPayment();
  }, [paymentId, toast]);

  const handleDownloadInvoice = async () => {
    setDownloadingInvoice(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-invoice', {
        body: { paymentId },
      });

      if (error) throw error;

      // Create and download invoice as JSON
      const blob = new Blob([JSON.stringify(data.invoiceData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${data.invoiceData.invoiceNumber}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Invoice Downloaded',
        description: 'Your invoice has been downloaded successfully',
      });
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to download invoice',
        variant: 'destructive',
      });
    } finally {
      setDownloadingInvoice(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/5 py-12">
      <div className="container max-w-3xl mx-auto px-4">
        <Card className="p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. Your order has been confirmed.
            </p>
          </div>

          {payment && (
            <div className="bg-accent/50 rounded-lg p-6 mb-6 text-left">
              <h2 className="text-xl font-semibold mb-4">Order Details</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-mono text-sm">{payment.id.substring(0, 8).toUpperCase()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-semibold">${payment.amount}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="capitalize">{payment.payment_method || 'Card'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="capitalize text-green-600 font-medium">{payment.status}</span>
                </div>

                {payment.project?.title && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Project:</span>
                    <span>{payment.project.title}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span>{new Date(payment.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleDownloadInvoice}
              disabled={downloadingInvoice}
              className="w-full"
              variant="outline"
            >
              {downloadingInvoice ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Download Invoice
            </Button>

            <Button asChild className="w-full">
              <Link to="/artist-crm">
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
          </div>

          <div className="mt-6 text-sm text-muted-foreground">
            <p>A confirmation email has been sent to your registered email address.</p>
            <p className="mt-2">
              Need help? <Link to="/contact" className="text-primary hover:underline">Contact Support</Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
