import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Music, Palette, Zap, TrendingUp, Star } from "lucide-react";

const Marketplace = () => {
  const categories = [
    { name: "Beats & Instrumentals", icon: Music, count: "Coming Soon" },
    { name: "Sample Packs", icon: Zap, count: "Coming Soon" },
    { name: "Templates & Presets", icon: Palette, count: "Coming Soon" },
    { name: "Services", icon: TrendingUp, count: "Coming Soon" },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Marketplace</h1>
          <p className="text-muted-foreground">
            Buy and sell beats, samples, templates, and services
          </p>
        </div>

        {/* Coming Soon Notice */}
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The Marketplace is currently in development. Soon you'll be able to buy and sell
              music production assets, services, and digital products.
            </p>
            <div className="space-y-2">
              <h3 className="font-semibold">Backend Infrastructure Ready:</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Tables: marketplace_categories, marketplace_listings, marketplace_purchases, marketplace_reviews</li>
                <li>Edge Function: marketplace-purchase</li>
                <li>Payment processing integration</li>
                <li>Review and rating system</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.name} className="hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className="h-5 w-5" />
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">{category.count}</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Sell Your Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Upload and sell beats, sample packs, mixing templates, and more. Set your own
                prices and keep 85% of every sale.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Reviews & Ratings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Build your reputation with customer reviews. Verified purchase badges ensure
                authentic feedback from real buyers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Instant Downloads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Secure, instant delivery of digital products. All purchases include unlimited
                downloads and permanent access to your library.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Start Selling</h3>
                <p className="text-sm text-muted-foreground">
                  Create your first listing when the marketplace launches
                </p>
              </div>
              <Button disabled>
                <ShoppingBag className="mr-2 h-4 w-4" />
                Create Listing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Marketplace;
