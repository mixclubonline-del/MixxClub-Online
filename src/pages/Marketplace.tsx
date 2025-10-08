import { useState, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMarketplace } from "@/hooks/useMarketplace";
import { isFeatureEnabled } from "@/config/featureFlags";
import { Lock, Search, ShoppingCart, Star, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SplineBackground } from '@/components/3d/spline/SplineBackground';

const Product3DCard = lazy(() => import('@/components/3d/r3f/Product3DCard').then(m => ({ default: m.Product3DCard })));

const Marketplace = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  const { items, isLoading: itemsLoading } = useMarketplace();

  const isUnlocked = isFeatureEnabled("MARKETPLACE_ENABLED");

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Community Marketplace - Coming Soon</CardTitle>
              <CardDescription className="text-lg">
                This feature unlocks at 500 community members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                The marketplace will allow you to buy and sell sample packs, presets, templates, and more.
                Join our growing community to unlock this feature!
              </p>
              <Button onClick={() => navigate("/")}>
                Return Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <SplineBackground 
        scene="https://prod.spline.design/Xqw7yqfqzKP01SoH/scene.splinecode"
        className="opacity-10"
      />
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Community Marketplace</h1>
          <p className="text-muted-foreground">
            Discover and purchase high-quality samples, presets, and templates from the community
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={selectedType} onValueChange={setSelectedType}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="sample_pack">Sample Packs</TabsTrigger>
              <TabsTrigger value="preset">Presets</TabsTrigger>
              <TabsTrigger value="template">Templates</TabsTrigger>
              <TabsTrigger value="plugin">Plugins</TabsTrigger>
            </TabsList>
          </Tabs>

        </div>

        {/* Items Grid */}
        {itemsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : items && items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const productType = item.item_type === 'sample_pack' ? 'vinyl' : 
                                 item.item_type === 'preset' ? 'cassette' : 'plugin';
              
              return (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <CardHeader className="p-0 relative">
                    {item.thumbnail_url ? (
                      <div className="relative">
                        <img
                          src={item.thumbnail_url}
                          alt={item.item_name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Suspense fallback={<div className="w-full h-full bg-card/80" />}>
                            <Product3DCard 
                              type={productType}
                              color="#8b5cf6"
                              className="w-full h-full"
                            />
                          </Suspense>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-muted flex items-center justify-center relative">
                        <Suspense fallback={<ShoppingCart className="h-12 w-12 text-muted-foreground" />}>
                          <Product3DCard 
                            type={productType}
                            color="#8b5cf6"
                            className="w-full h-full absolute inset-0"
                          />
                        </Suspense>
                      </div>
                    )}
                  </CardHeader>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1 line-clamp-1">{item.item_name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.item_description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">
                        {item.average_rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      ${item.price?.toFixed(2) || '0.00'}
                    </span>
                    <Button
                      onClick={() => navigate(`/marketplace/${item.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </div>
        ) : (
          <Card className="text-center p-12">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No items found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
