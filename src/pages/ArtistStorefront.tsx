import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShoppingCart, ArrowLeft } from "lucide-react";
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

interface Storefront {
  id: string;
  storefront_slug: string;
  bio: string;
  banner_image_url: string;
  commission_rate: number;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

export default function ArtistStorefront() {
  const { username } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [storefront, setStorefront] = useState<Storefront | null>(null);
  const [products, setProducts] = useState<MerchProduct[]>([]);
  const [cart, setCart] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    loadStorefront();
  }, [username]);

  const loadStorefront = async () => {
    try {
      const { data: storefrontData, error: storefrontError } = await supabase
        .from("artist_storefronts")
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq("storefront_slug", username)
        .eq("is_approved", true)
        .single();

      if (storefrontError) throw storefrontError;
      setStorefront(storefrontData);

      const { data: productsData, error: productsError } = await (supabase as any)
        .from("merch_products")
        .select(`
          *,
          merch_variants (*)
        `)
        .eq("artist_id", storefrontData.id)
        .eq("is_active", true);

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (error: any) {
      toast.error("Storefront not found");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (variantId: string) => {
    const newCart = new Map(cart);
    newCart.set(variantId, (newCart.get(variantId) || 0) + 1);
    setCart(newCart);
    toast.success("Added to cart");
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
        <p className="text-muted-foreground">Loading storefront...</p>
      </div>
    );
  }

  if (!storefront) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Storefront not found</p>
        <Link to="/merch">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Merch Store
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/merch">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Store
        </Button>
      </Link>

      {storefront.banner_image_url && (
        <div className="w-full h-48 md:h-64 rounded-lg overflow-hidden mb-8">
          <img 
            src={storefront.banner_image_url} 
            alt="Banner"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex items-start gap-6 mb-8">
        <Avatar className="h-20 w-20">
          <AvatarImage src={storefront.profiles?.avatar_url} />
          <AvatarFallback className="text-2xl">
            {storefront.profiles?.full_name?.[0]}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-2">{storefront.profiles?.full_name}</h1>
          {storefront.bio && (
            <p className="text-muted-foreground">{storefront.bio}</p>
          )}
        </div>

        {getCartItemCount() > 0 && (
          <Button variant="secondary" className="relative">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Cart
            <Badge variant="destructive" className="absolute -top-2 -right-2">
              {getCartItemCount()}
            </Badge>
          </Button>
        )}
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No products available yet.</p>
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
