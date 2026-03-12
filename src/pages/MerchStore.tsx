import { useState, useEffect } from "react";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShoppingCart, Store } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface MerchVariant {
  id: string;
  name: string;
  price: string;
  size: string | null;
  color: string | null;
  image_url: string;
  sku: string;
}

interface MerchProduct {
  id: string;
  name: string;
  description: string;
  thumbnail_url: string;
  artist_id: string | null;
  merch_variants: MerchVariant[];
  artist_storefronts?: {
    storefront_slug: string;
    bio: string;
    profiles: {
      full_name: string;
      avatar_url: string;
    };
  };
}

export default function MerchStore() {
  const { user } = useAuth();
  const [products, setProducts] = useState<MerchProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('merch_products')
        .select(`
          *,
          merch_variants (*),
          artist_storefronts (
            storefront_slug,
            bio,
            profiles (
              full_name,
              avatar_url
            )
          )
        `)
        .eq('is_active', true);

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error('Failed to load products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  const addToCart = (variantId: string) => {
    const newCart = new Map(cart);
    newCart.set(variantId, (newCart.get(variantId) || 0) + 1);
    setCart(newCart);
    toast.success('Added to cart');
  };

  const getCartTotal = () => {
    let total = 0;
    products.forEach(product => {
      product.merch_variants.forEach(variant => {
        const quantity = cart.get(variant.id) || 0;
        total += parseFloat(variant.price) * quantity;
      });
    });
    return total;
  };

  const getCartItemCount = () => {
    let count = 0;
    cart.forEach(quantity => count += quantity);
    return count;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Loading merch store...</p>
      </div>
    );
  }

  const officialProducts = products.filter(p => !p.artist_id);
  const artistProducts = products.filter(p => p.artist_id);

  const renderProductGrid = (productList: MerchProduct[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {productList.map((product) => (
        <Card key={product.id} className="overflow-hidden">
          <img 
            src={product.thumbnail_url} 
            alt={product.name}
            className="w-full h-64 object-cover"
          />
          <CardHeader>
            <CardTitle>{product.name}</CardTitle>
            <CardDescription>{product.description}</CardDescription>
            {product.artist_storefronts && (
              <Link 
                to={`/merch/${product.artist_storefronts.storefront_slug}`}
                className="flex items-center gap-2 mt-2 text-sm text-primary hover:underline"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={product.artist_storefronts.profiles?.avatar_url} />
                  <AvatarFallback>{product.artist_storefronts.profiles?.full_name?.[0]}</AvatarFallback>
                </Avatar>
                <span className="flex items-center gap-1">
                  <Store className="h-3 w-3" />
                  {product.artist_storefronts.profiles?.full_name}
                </span>
              </Link>
            )}
          </CardHeader>
          
          <CardContent>
            <div className="space-y-2">
              {product.merch_variants.slice(0, 3).map((variant) => (
                <div key={variant.id} className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="font-medium">{variant.name}</span>
                    {variant.size && <Badge variant="outline" className="ml-2">{variant.size}</Badge>}
                    {variant.color && <Badge variant="outline" className="ml-2">{variant.color}</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">${variant.price}</span>
                    <Button 
                      size="sm" 
                      onClick={() => addToCart(variant.id)}
                      disabled={!user}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              {product.merch_variants.length} variants available
            </p>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Mixxclub Merch Store</h1>
          <p className="text-muted-foreground">Exclusive gear for audio professionals</p>
        </div>
        
        <Button variant="secondary" className="relative">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Cart
          {getCartItemCount() > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2">
              {getCartItemCount()}
            </Badge>
          )}
        </Button>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No products available yet. Check back soon!</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="official" className="w-full">
          <TabsList className="grid w-full max-w-md mb-8" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <TabsTrigger value="official">Mixxclub Official</TabsTrigger>
            <TabsTrigger value="artists">Artist Designs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="official">
            {officialProducts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No official products yet.</p>
                </CardContent>
              </Card>
            ) : (
              renderProductGrid(officialProducts)
            )}
          </TabsContent>
          
          <TabsContent value="artists">
            {artistProducts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No artist designs yet. Be the first to create!</p>
                </CardContent>
              </Card>
            ) : (
              renderProductGrid(artistProducts)
            )}
          </TabsContent>
        </Tabs>
      )}

        {getCartItemCount() > 0 && (
          <Card className="fixed bottom-4 right-4 w-80">
            <CardHeader>
              <CardTitle className="text-lg">Cart Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{getCartItemCount()} items</span>
                <span className="text-xl font-bold">${getCartTotal().toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" disabled={!user}>
                Proceed to Checkout
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
  );
}
