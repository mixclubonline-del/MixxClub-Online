import { useState } from "react";
import { useState } from "react";
// import { useMarketplaceItems, useMarketplaceCategories, usePurchaseItem } from "@/hooks/useMarketplace.tsx"; // Replaced by backend component
import { useBackendMarketplaceCart, MarketplaceProducts } from "@/backend-integration";
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
  const { cartItems, total: cartTotal, addToCart, removeFromCart, updateQuantity } = useBackendMarketplaceCart(user?.id);

  // Deprecated local state logic replaced by hook
  /* 
  const [cart, setCart] = useState<any[]>([]);
  ...
  */

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

      {/* Products Grid - Now Powered by Backend Component */}
      <div className="container mx-auto px-4 py-8">
        <MarketplaceProducts 
            userId={user?.id}
            searchQuery={searchQuery}
            category={selectedCategory}
            sortBy={sortBy}
        />
      </div>

      {/* Floating Cart */}
      <FloatingCart
        items={cartItems}
        total={cartTotal}
        onRemove={removeFromCart}
        onUpdateQuantity={updateQuantity}
      />
    </MarketplaceBazaar>
  );
}
