import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMarketplace } from '@/hooks/useMarketplace';
import { Loader2, ShoppingCart, Star, Download } from 'lucide-react';

export const MarketplaceGrid = () => {
  const { items, isLoading, purchaseItem } = useMarketplace();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Card className="text-center p-12">
        <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Items Yet</h3>
        <p className="text-muted-foreground">
          Be the first to list an item on the marketplace!
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-2xl font-bold text-primary">
                  {item.is_free ? 'Free' : `$${item.price.toFixed(2)}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Rating</p>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <p className="text-lg font-semibold">
                    {item.average_rating ? item.average_rating.toFixed(1) : 'New'}
                  </p>
                </div>
              </div>
            </div>
            {item.total_reviews > 0 && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{item.total_reviews} reviews</span>
                <span className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  {item.download_count} downloads
                </span>
              </div>
            )}
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
              {item.is_free ? 'Download Free' : 'Purchase Now'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
