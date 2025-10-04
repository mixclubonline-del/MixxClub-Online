import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Store, Upload, DollarSign, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ArtistMerchManager() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [storefront, setStorefront] = useState<any>(null);
  const [formData, setFormData] = useState({
    storefront_slug: "",
    bio: "",
    banner_image_url: ""
  });
  const [sales, setSales] = useState<any[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadStorefront();
    loadSales();
  }, [user]);

  const loadStorefront = async () => {
    try {
      const { data, error } = await supabase
        .from("artist_storefronts")
        .select("*")
        .eq("artist_id", user?.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      
      if (data) {
        setStorefront(data);
        setFormData({
          storefront_slug: data.storefront_slug,
          bio: data.bio || "",
          banner_image_url: data.banner_image_url || ""
        });
      }
    } catch (error: any) {
      toast.error("Failed to load storefront");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadSales = async () => {
    try {
      const { data: storefrontData } = await supabase
        .from("artist_storefronts")
        .select("id")
        .eq("artist_id", user?.id)
        .maybeSingle();

      if (!storefrontData) return;

      const { data, error } = await supabase
        .from("merch_sales")
        .select("*")
        .eq("artist_id", storefrontData.id)
        .order("sale_date", { ascending: false });

      if (error) throw error;

      setSales(data || []);
      const total = data?.reduce((sum, sale) => sum + Number(sale.commission_amount), 0) || 0;
      setTotalEarnings(total);
    } catch (error: any) {
      console.error("Failed to load sales:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.storefront_slug.match(/^[a-z0-9-]+$/)) {
      toast.error("Slug can only contain lowercase letters, numbers, and hyphens");
      return;
    }

    try {
      if (storefront) {
        const { error } = await supabase
          .from("artist_storefronts")
          .update(formData)
          .eq("id", storefront.id);

        if (error) throw error;
        toast.success("Storefront updated!");
      } else {
        const { error } = await supabase
          .from("artist_storefronts")
          .insert([{ ...formData, artist_id: user?.id }]);

        if (error) throw error;
        toast.success("Storefront created! Pending admin approval.");
      }
      
      loadStorefront();
    } catch (error: any) {
      toast.error(error.message || "Failed to save storefront");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Store className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Merch Manager</h1>
          <p className="text-muted-foreground">Create and manage your artist storefront</p>
        </div>
      </div>

      {storefront && !storefront.is_approved && (
        <Card className="mb-6 border-yellow-500">
          <CardContent className="pt-6">
            <Badge variant="outline" className="bg-yellow-500/10">Pending Approval</Badge>
            <p className="text-sm text-muted-foreground mt-2">
              Your storefront is awaiting admin approval before it goes live.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">${totalEarnings.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{sales.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              {storefront ? (storefront.commission_rate * 100).toFixed(0) : 20}%
            </span>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Storefront Settings</CardTitle>
          <CardDescription>
            Customize your artist storefront URL and information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Storefront URL</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">mixclub.com/merch/</span>
                <Input
                  id="slug"
                  value={formData.storefront_slug}
                  onChange={(e) => setFormData({ ...formData, storefront_slug: e.target.value.toLowerCase() })}
                  placeholder="your-artist-name"
                  required
                  pattern="[a-z0-9-]+"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Use lowercase letters, numbers, and hyphens only
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell fans about your brand..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="banner">Banner Image URL</Label>
              <Input
                id="banner"
                type="url"
                value={formData.banner_image_url}
                onChange={(e) => setFormData({ ...formData, banner_image_url: e.target.value })}
                placeholder="https://..."
              />
              <p className="text-xs text-muted-foreground">
                Recommended size: 1920x400px
              </p>
            </div>

            <Button type="submit" className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              {storefront ? "Update Storefront" : "Create Storefront"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {sales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>Your commission earnings from merch sales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sales.slice(0, 10).map((sale) => (
                <div key={sale.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">
                      {new Date(sale.sale_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Sale: ${Number(sale.sale_amount).toFixed(2)}
                    </p>
                  </div>
                  <Badge variant="outline">
                    +${Number(sale.commission_amount).toFixed(2)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
