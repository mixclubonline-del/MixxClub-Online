import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckoutForm } from '@/components/payments/CheckoutForm';
import { TrustBadges } from '@/components/TrustBadges';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ShieldCheck } from 'lucide-react';

const stripePromise = loadStripe('pk_test_51QYolmP3LFqt9Y0g3xYZGRV3V4sZqF9K8XHD8HvHGmD2uQABr4XYZj8BXvT8KqX6YW9Bj6T5dG3p1KqY8Z9X0Y0Y00YZ0Y0Y0Y');

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const packageId = searchParams.get('package');
  const type = searchParams.get('type'); // 'mixing', 'mastering', 'distribution'

  useEffect(() => {
    const loadOrderDetails = async () => {
      if (!packageId || !type) {
        navigate('/');
        return;
      }

      try {
        const tableName = type === 'mixing' ? 'mixing_packages' 
          : type === 'mastering' ? 'mastering_packages'
          : type === 'distribution' ? 'distribution_packages'
          : null;

        if (!tableName) {
          navigate('/');
          return;
        }

        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', packageId)
          .single();

        if (error) throw error;
        setOrderDetails({ ...data, type });
      } catch (error) {
        console.error('Error loading order:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadOrderDetails();
  }, [packageId, type, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/5 py-12">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Secure Checkout</h1>
          <p className="text-muted-foreground">Complete your purchase securely</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Package</p>
                  <p className="font-medium">{orderDetails?.package_name || orderDetails?.tier_name}</p>
                </div>

                {orderDetails?.track_limit && (
                  <div>
                    <p className="text-sm text-muted-foreground">Track Limit</p>
                    <p className="font-medium">
                      {orderDetails.track_limit === -1 ? 'Unlimited' : orderDetails.track_limit}
                    </p>
                  </div>
                )}

                {orderDetails?.turnaround_days && (
                  <div>
                    <p className="text-sm text-muted-foreground">Turnaround Time</p>
                    <p className="font-medium">{orderDetails.turnaround_days} days</p>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    ${orderDetails?.price || 0}
                  </span>
                </div>

                <div className="pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <span>256-bit SSL Encryption</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <span>PCI DSS Compliant</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <Elements stripe={stripePromise}>
                <CheckoutForm 
                  amount={orderDetails?.price || 0}
                  projectId={packageId!}
                />
              </Elements>
            </Card>

            <div className="mt-6">
              <TrustBadges />
            </div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>By completing this purchase, you agree to our</p>
              <p>
                <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                {' & '}
                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
