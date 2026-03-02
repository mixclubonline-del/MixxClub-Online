import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStorefront, useStorefrontProducts } from '@/hooks/useStorefront';
import { useMusicCatalogue } from '@/hooks/useMusicCatalogue';
import { useAuth } from '@/hooks/useAuth';
import { StorefrontSetup } from './StorefrontSetup';
import { MusicCatalogue } from '@/components/catalogue/MusicCatalogue';
import { MerchProductEditor } from './MerchProductEditor';
import { 
  Store, 
  Music, 
  ShoppingBag, 
  DollarSign, 
  Settings, 
  Eye,
  Plus,
  TrendingUp,
  Users,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StorefrontManager = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { storefront, isLoading } = useStorefront(user?.id);
  const { products } = useStorefrontProducts(storefront?.id);
  const { tracks } = useMusicCatalogue(user?.id);
  const [showProductEditor, setShowProductEditor] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show setup wizard if no storefront exists
  if (!storefront) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <Store className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2">Create Your Storefront</h2>
          <p className="text-muted-foreground">
            Set up your personal store to sell music and merch
          </p>
        </div>
        <StorefrontSetup onComplete={() => window.location.reload()} />
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Sales',
      value: storefront.total_sales || 0,
      icon: ShoppingBag,
      color: 'text-primary'
    },
    {
      label: 'Revenue',
      value: `$${(storefront.total_revenue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-500'
    },
    {
      label: 'Music Tracks',
      value: tracks?.length || 0,
      icon: Music,
      color: 'text-blue-500'
    },
    {
      label: 'Merch Items',
      value: products?.length || 0,
      icon: ShoppingBag,
      color: 'text-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Store className="w-6 h-6 text-primary" />
            Your Storefront
          </h2>
          <p className="text-muted-foreground">
            Manage your music and merch store
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/store/${storefront.storefront_slug}`)}
          >
            <Eye className="w-4 h-4 mr-2" />
            View Store
            <ExternalLink className="w-3 h-3 ml-2" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="music" className="space-y-4">
        <TabsList>
          <TabsTrigger value="music" className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            Music
          </TabsTrigger>
          <TabsTrigger value="merch" className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Merch
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="music" className="space-y-4">
          <MusicCatalogue />
        </TabsContent>

        <TabsContent value="merch" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Your Products</h3>
            <Button onClick={() => {
              setEditingProduct(null);
              setShowProductEditor(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>

          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product: any) => (
                <Card key={product.id} className="overflow-hidden">
                  {product.thumbnail_url && (
                    <div className="aspect-square bg-muted">
                      <img 
                        src={product.thumbnail_url} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{product.name}</h4>
                      <Badge variant={product.is_active ? "default" : "secondary"}>
                        {product.is_active ? 'Active' : 'Draft'}
                      </Badge>
                    </div>
                    <p className="text-lg font-bold text-primary">
                      ${Number(product.price).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {product.category}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={() => {
                        setEditingProduct(product);
                        setShowProductEditor(true);
                      }}
                    >
                      Edit
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No products yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first product to start selling
              </p>
              <Button onClick={() => setShowProductEditor(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Storefront Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Store URL</p>
                  <p className="font-medium">mixxclub.com/store/{storefront.storefront_slug}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Display Name</p>
                  <p className="font-medium">{storefront.display_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge variant={storefront.is_active ? "default" : "secondary"}>
                    {storefront.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Theme Color</p>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: storefront.theme_color }}
                    />
                    <span>{storefront.theme_color}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Editor Modal */}
      {showProductEditor && (
        <MerchProductEditor
          product={editingProduct}
          storefrontId={storefront.id}
          onClose={() => {
            setShowProductEditor(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
};
