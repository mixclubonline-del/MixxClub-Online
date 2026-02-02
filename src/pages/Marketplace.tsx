import { useState } from "react";
import { useMarketplaceItems, useMarketplaceCategories, usePurchaseItem } from "@/hooks/useMarketplace.tsx";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { MarketplaceBazaar } from "@/components/marketplace/MarketplaceBazaar";
import { BazaarHeader } from "@/components/marketplace/BazaarHeader";
import { BazaarSearch } from "@/components/marketplace/BazaarSearch";
import { ProductShowcase } from "@/components/marketplace/ProductShowcase";
import { FloatingCart } from "@/components/marketplace/FloatingCart";
import { EmptyBazaar } from "@/components/marketplace/EmptyBazaar";
import { BazaarSkeleton } from "@/components/marketplace/BazaarSkeleton";
import bazaarImage from "@/assets/commerce-bazaar.jpg";

export default function Marketplace() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: items, isLoading } = useMarketplaceItems();
  const { data: categories } = useMarketplaceCategories();
  const purchaseItem = usePurchaseItem();
  
  const [cart, setCart] = useState<any[]>([]);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleAddToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCart(prev => prev.map(item => 
        item.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  const filteredItems = items?.filter((item: any) => {
    const matchesSearch = item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.item_description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a: any, b: any) => {
    switch (sortBy) {
      case "price-low": return a.price - b.price;
      case "price-high": return b.price - a.price;
      case "popular": return (b.sales_count || 0) - (a.sales_count || 0);
      default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const handlePurchase = async (item: any) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to purchase items.",
        variant: "destructive",
      });
      return;
    }

    await purchaseItem.mutateAsync({
      itemId: item.id,
      buyerId: user.id,
      sellerId: item.seller_id,
      amount: item.price,
    });
  };

  const handleAddToCartClick = (item: any) => {
    handleAddToCart({
      id: item.id,
      title: item.item_name,
      price: item.price,
      image: item.preview_urls?.[0] || "",
    });
    toast({
      title: "Added to cart",
      description: `${item.item_name} has been added to your cart.`,
    });
  };

  if (isLoading) {
    return <BazaarSkeleton />;
  }

  const hasFilters = searchQuery !== "" || selectedCategory !== "all";

  return (
    <MarketplaceBazaar backgroundAsset={bazaarImage}>
      {/* Header */}
      <BazaarHeader />

      {/* Search & Filters */}
      <BazaarSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        categories={categories}
      />

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        {filteredItems && filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item: any, index: number) => (
              <ProductShowcase
                key={item.id}
                item={item}
                index={index}
                onAddToCart={() => handleAddToCartClick(item)}
                onBuyNow={() => handlePurchase(item)}
                isPurchasing={purchaseItem.isPending}
              />
            ))}
          </div>
        ) : (
          <EmptyBazaar hasFilters={hasFilters} />
        )}
      </div>

      {/* Floating Cart */}
      <FloatingCart
        items={cart}
        total={cartTotal}
        onRemove={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
      />
    </MarketplaceBazaar>
  );
}
