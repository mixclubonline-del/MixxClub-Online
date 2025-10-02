import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Disc, Settings2, DollarSign, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminMarketplace = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

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
    };

    checkAdmin();
  }, [user, navigate]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Marketplace Expansion</h1>
            <p className="text-muted-foreground">Manage sample libraries, presets, and templates</p>
          </div>
          <Badge variant="outline" className="text-warning border-warning">
            Coming Soon
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Disc className="w-5 h-5" />
                Sample Library
              </CardTitle>
              <CardDescription>Upload and manage audio samples</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Curate a collection of high-quality samples for artists to use in their productions.
              </p>
              <Button disabled className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Sample Pack
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="w-5 h-5" />
                Preset Collections
              </CardTitle>
              <CardDescription>Share engineer presets</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Allow engineers to sell their custom plugin presets and mixing templates.
              </p>
              <Button disabled className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Upload Presets
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Revenue Sharing
              </CardTitle>
              <CardDescription>Configure marketplace splits</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Set fair revenue splits between creators, MixClub, and contributors.
              </p>
              <Button disabled className="w-full">
                <Settings2 className="w-4 h-4 mr-2" />
                Configure Splits
              </Button>
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
