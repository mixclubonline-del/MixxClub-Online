import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Disc, Settings2, DollarSign, Plus, TrendingUp, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminMarketplace = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [productCount, setProductCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data } = await supabase.rpc("is_admin", { user_uuid: user.id });
      if (!data) {
        navigate("/");
        return;
      }

      setIsAdmin(true);
      setLoading(false);
      loadProductStats();
    };

    checkAdmin();
  }, [user, navigate]);

  const loadProductStats = async () => {
    try {
      const { count, error } = await supabase
        .from('merch_products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (error) throw error;
      setProductCount(count || 0);
    } catch (error: any) {
      console.error('Error loading product stats:', error);
    }
  };

  const syncProducts = async () => {
    try {
      setSyncing(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('printful-sync-products', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });
      
      if (error) throw error;
      
      toast.success(`Successfully synced ${data?.productCount || 0} products from Printful!`);
      setLastSyncTime(new Date());
      loadProductStats();
    } catch (error: any) {
      console.error('Sync error:', error);
      toast.error(error.message || 'Failed to sync products');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Marketplace Management</h1>
            <p className="text-muted-foreground">Sync and manage Printful merchandise products</p>
          </div>
          <Button onClick={syncProducts} disabled={syncing}>
            {syncing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Sync Products
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Active Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{productCount}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Currently available in store
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Last Sync
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">
                {lastSyncTime ? lastSyncTime.toLocaleString() : 'Never'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Printful integration status
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Revenue (Coming Soon)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">$0.00</p>
              <p className="text-sm text-muted-foreground mt-1">
                Total merch sales
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Printful Integration
              </CardTitle>
              <CardDescription>Merchandise products via Printful</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Sync products from Printful to populate the merch store with t-shirts, hoodies, and more branded gear.
              </p>
              <div className="space-y-2 text-sm">
                <p>✓ Automated product syncing</p>
                <p>✓ Print-on-demand fulfillment</p>
                <p>✓ No inventory management needed</p>
                <p>✓ Direct integration with store</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Disc className="w-5 h-5" />
                Future Marketplace Features
              </CardTitle>
              <CardDescription>Coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Sample pack library</p>
                <p>• Engineer preset collections</p>
                <p>• DAW project templates</p>
                <p>• Revenue sharing system</p>
                <p>• Creator storefronts</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Feature Roadmap</CardTitle>
            <CardDescription>Planned capabilities for the Marketplace</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Sample pack upload and categorization</li>
              <li>• Audio preview player for samples</li>
              <li>• Preset file management (VST, AU formats)</li>
              <li>• Template library (project files for popular DAWs)</li>
              <li>• Creator profiles and storefronts</li>
              <li>• Automated revenue distribution system</li>
              <li>• Rating and review system for marketplace items</li>
              <li>• Bundle creation and discount tools</li>
              <li>• License management (commercial vs personal use)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminMarketplace;
