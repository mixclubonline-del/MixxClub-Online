import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMarketplace } from '@/hooks/useMarketplace';
import { Loader2, ShoppingCart } from 'lucide-react';

export const MarketplaceGrid = () => {
  const { items, isLoading, purchaseItem } = useMarketplace();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items?.map((item) => (
        <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          {item.thumbnail_url && (
            <div className="aspect-video bg-muted relative overflow-hidden">
              <img 
                src={item.thumbnail_url} 
                alt={item.item_name}
                className="object-cover w-full h-full"
              />
            </div>
          )}
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="line-clamp-1">{item.item_name}</CardTitle>
              <Badge variant="secondary" className="shrink-0">
                {item.item_type}
              </Badge>
            </div>
            {item.item_description && (
              <CardDescription className="line-clamp-2">
                {item.item_description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-2xl font-bold text-primary">
                  ${item.price.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="text-lg font-semibold">
                  {item.average_rating?.toFixed(1) || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full gap-2" 
              onClick={() => purchaseItem.mutate(item.id)}
              disabled={purchaseItem.isPending}
            >
              {purchaseItem.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
              Purchase Now
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
