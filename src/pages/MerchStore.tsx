import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, TrendingUp } from "lucide-react";
import { toast } from "sonner";

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
  merch_variants: MerchVariant[];
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
          merch_variants (*)
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

  const syncProducts = async () => {
    if (!user) {
      toast.error('Please log in to sync products');
      return;
    }

    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('printful-sync-products', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });
      
      if (error) throw error;
      
      toast.success(`Synced ${data?.productCount || 0} products from Printful!`);
      loadProducts();
    } catch (error: any) {
      console.error('Sync error:', error);
      toast.error(error.message || 'Failed to sync products');
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

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">MixClub Merch Store</h1>
            <p className="text-muted-foreground">Exclusive gear for audio professionals</p>
          </div>
          
          <div className="flex gap-4">
            <Button onClick={syncProducts} variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              Sync Products
            </Button>
            
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
        </div>

        {products.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No products available yet</p>
              <Button onClick={syncProducts}>Sync Products from Printful</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <img 
                  src={product.thumbnail_url} 
                  alt={product.name}
                  className="w-full h-64 object-cover"
                />
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
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
