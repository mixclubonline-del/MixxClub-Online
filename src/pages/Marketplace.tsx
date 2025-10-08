import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarketplaceGrid } from "@/components/marketplace/MarketplaceGrid";
import { PointsBalance } from "@/components/points/PointsBalance";
import { PointsLedger } from "@/components/points/PointsLedger";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Coins, Scale, Package } from "lucide-react";
import { isFeatureEnabled } from "@/config/featureFlags";

const Marketplace = () => {
  const isUnlocked = isFeatureEnabled("MARKETPLACE_ENABLED");

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Marketplace - Coming Soon</CardTitle>
              <CardDescription className="text-lg">
                Unlock at 500 community members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Buy and sell plugins, presets, sample packs, and more!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Marketplace</h1>
          <p className="text-muted-foreground">
            Discover plugins, presets, and sounds from the community
          </p>
        </div>

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="browse" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Browse
            </TabsTrigger>
            <TabsTrigger value="points" className="gap-2">
              <Coins className="h-4 w-4" />
              Points
            </TabsTrigger>
            <TabsTrigger value="disputes" className="gap-2">
              <Scale className="h-4 w-4" />
              Disputes
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <Package className="h-4 w-4" />
              Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <MarketplaceGrid />
          </TabsContent>

          <TabsContent value="points" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <PointsBalance />
              <PointsLedger />
            </div>
          </TabsContent>

          <TabsContent value="disputes">
            <Card>
              <CardHeader>
                <CardTitle>Dispute Resolution</CardTitle>
                <CardDescription>
                  Manage purchase disputes and refunds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-12">
                  No active disputes
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>
                  View your purchase history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-12">
                  No orders yet
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Marketplace;
