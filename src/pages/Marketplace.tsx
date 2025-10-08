import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MarketplaceGrid } from "@/components/marketplace/MarketplaceGrid";
import { PointsBalance } from "@/components/points/PointsBalance";
import { PointsLedger } from "@/components/points/PointsLedger";
import { useMarketplace } from "@/hooks/useMarketplace";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Coins, Scale, Package, Plus } from "lucide-react";
import { isFeatureEnabled } from "@/config/featureFlags";
import { useState } from "react";

const Marketplace = () => {
  const { createItem } = useMarketplace();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    item_type: 'sample_pack',
    item_name: '',
    item_description: '',
    price: 0,
    thumbnail_url: '',
    file_url: ''
  });

  const isUnlocked = isFeatureEnabled("MARKETPLACE_ENABLED");

  const handleSubmit = () => {
    createItem.mutate(formData, {
      onSuccess: () => {
        setDialogOpen(false);
        setFormData({
          item_type: 'sample_pack',
          item_name: '',
          item_description: '',
          price: 0,
          thumbnail_url: '',
          file_url: ''
        });
      }
    });
  };

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Marketplace</h1>
            <p className="text-muted-foreground">
              Discover plugins, presets, and sounds from the community
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                List Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>List New Item</DialogTitle>
                <DialogDescription>
                  Create a listing for your plugin, preset, or sample pack
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="item_type">Item Type</Label>
                    <Select 
                      value={formData.item_type}
                      onValueChange={(value) => setFormData({ ...formData, item_type: value })}
                    >
                      <SelectTrigger id="item_type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plugin">Plugin</SelectItem>
                        <SelectItem value="preset">Preset</SelectItem>
                        <SelectItem value="sample_pack">Sample Pack</SelectItem>
                        <SelectItem value="template">Template</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USD)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        price: parseFloat(e.target.value) || 0 
                      })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="item_name">Item Name</Label>
                  <Input
                    id="item_name"
                    value={formData.item_name}
                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                    placeholder="Epic Reverb Plugin"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="item_description">Description</Label>
                  <Textarea
                    id="item_description"
                    value={formData.item_description}
                    onChange={(e) => setFormData({ ...formData, item_description: e.target.value })}
                    placeholder="Describe your item..."
                    rows={3}
                  />
                </div>
                
                <Button 
                  onClick={handleSubmit} 
                  disabled={!formData.item_name || formData.price < 0}
                  className="w-full"
                >
                  Create Listing
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
