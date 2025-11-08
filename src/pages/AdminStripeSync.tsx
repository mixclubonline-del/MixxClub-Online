import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface ServicePackage {
  id: string;
  name: string;
  price: number;
  currency: string;
  type: 'mastering' | 'mixing' | 'distribution' | 'addon';
  isRecurring?: boolean;
}

export default function AdminStripeSync() {
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const { toast } = useToast();

  const fetchAllPackages = async () => {
    setLoading(true);
    try {
      const allPackages: ServicePackage[] = [];

      // Fetch mastering packages
      const { data: mastering } = await supabase.from('mastering_packages').select('*');
      if (mastering) {
        allPackages.push(...mastering.map(p => ({
          id: p.id,
          name: `Mastering - ${p.name}`,
          price: p.price,
          currency: p.currency,
          type: 'mastering' as const,
        })));
      }

      // Fetch mixing packages
      const { data: mixing } = await supabase.from('mixing_packages').select('*');
      if (mixing) {
        allPackages.push(...mixing.map(p => ({
          id: p.id,
          name: `Mixing - ${p.name}`,
          price: p.price,
          currency: p.currency,
          type: 'mixing' as const,
        })));
      }

      // Fetch distribution packages
      const { data: distribution } = await supabase.from('distribution_packages').select('*');
      if (distribution) {
        allPackages.push(...distribution.map(p => ({
          id: p.id,
          name: `Distribution - ${p.package_name}`,
          price: p.price,
          currency: p.currency,
          type: 'distribution' as const,
          isRecurring: true,
        })));
      }

      // Fetch add-on services
      const { data: addons } = await supabase.from('add_on_services').select('*');
      if (addons) {
        allPackages.push(...addons.map(p => ({
          id: p.id,
          name: `Add-on - ${p.service_name}`,
          price: p.price,
          currency: p.currency,
          type: 'addon' as const,
        })));
      }

      setPackages(allPackages);
      toast({
        title: 'Packages Loaded',
        description: `Found ${allPackages.length} packages`,
      });
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load packages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Stripe Product Sync</h1>
          <p className="text-muted-foreground mt-2">
            Manage your Stripe products and prices for all services
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
            <CardDescription>
              Create products in your Stripe dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="font-semibold">Option 1: Manual Creation (Recommended)</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Go to your Stripe Dashboard → Products</li>
                <li>Create a product for each package below</li>
                <li>Set the price to match the amounts shown</li>
                <li>For Distribution packages, set as "Recurring" with "Yearly" billing</li>
                <li>Copy the Price ID (starts with price_) for each</li>
              </ol>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => window.open('https://dashboard.stripe.com/products', '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Stripe Dashboard
              </Button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-2">
              <p className="font-semibold text-blue-900 dark:text-blue-100">Option 2: Dynamic Pricing (Current)</p>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Your payment functions already support dynamic pricing! They create products on-the-fly
                when users checkout. No manual product creation needed unless you want to track them
                in Stripe's dashboard.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Service Packages</CardTitle>
                <CardDescription>
                  All packages from your database
                </CardDescription>
              </div>
              <Button
                onClick={fetchAllPackages}
                disabled={loading}
                variant="outline"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {packages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Click "Refresh" to load your packages</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Billing</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.map((pkg) => (
                    <TableRow key={pkg.id}>
                      <TableCell className="font-medium">{pkg.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{pkg.type}</Badge>
                      </TableCell>
                      <TableCell>
                        ${(pkg.price).toFixed(2)} {pkg.currency.toUpperCase()}
                      </TableCell>
                      <TableCell>
                        {pkg.isRecurring ? (
                          <Badge variant="secondary">Yearly</Badge>
                        ) : (
                          <Badge>One-time</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-muted-foreground">
                            Dynamic pricing enabled
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Functions</CardTitle>
            <CardDescription>
              Your edge functions for processing payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">create-payment-checkout</p>
                  <p className="text-sm text-muted-foreground">
                    Handles package purchases (mastering, mixing, distribution, add-ons)
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto mt-1"
                    onClick={() => window.open('https://supabase.com/dashboard/project/htvmkylgrrlaydhdbonl/functions/create-payment-checkout/logs', '_blank')}
                  >
                    View Logs →
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">create-shareable-payment-link</p>
                  <p className="text-sm text-muted-foreground">
                    Creates shareable payment links for partnerships and custom amounts
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto mt-1"
                    onClick={() => window.open('https://supabase.com/dashboard/project/htvmkylgrrlaydhdbonl/functions/create-shareable-payment-link/logs', '_blank')}
                  >
                    View Logs →
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">stripe-webhook (Optional)</p>
                  <p className="text-sm text-muted-foreground">
                    Already configured for handling subscription updates
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
