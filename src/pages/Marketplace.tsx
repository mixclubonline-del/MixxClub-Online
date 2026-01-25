import { useState } from "react";
import { useBackendMarketplaceCart, MarketplaceProducts } from "@/backend-integration";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { MarketplaceBazaar } from "@/components/marketplace/MarketplaceBazaar";
import { BazaarHeader } from "@/components/marketplace/BazaarHeader";
import { BazaarSearch } from "@/components/marketplace/BazaarSearch";
import { FloatingCart } from "@/components/marketplace/FloatingCart";
import bazaarImage from "@/assets/commerce-bazaar.jpg";

export default function Marketplace() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { cartItems, addItem, removeItem, updateQuantity, getTotalPrice } = useBackendMarketplaceCart(user?.id || "");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"trending" | "newest" | "bestselling" | "rating">("newest");

  const handleAddToCart = (item: { id: string; title: string; price: number; image?: string }) => {
    addItem({
      product_id: item.id,
      quantity: 1,
      price: item.price,
    });
    toast({
      title: "Added to cart",
      description: `${item.title} has been added to your cart.`,
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    removeItem(productId);
  };

  // Transform cart items for FloatingCart component
  const floatingCartItems = cartItems.map(item => ({
    id: item.product_id,
    title: `Product ${item.product_id.slice(0, 8)}`,
    price: item.price,
    quantity: item.quantity,
    image: "",
  }));

  return (
    <MarketplaceBazaar backgroundAsset={bazaarImage}>
      <BazaarHeader />

      <BazaarSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={(value) => setSortBy(value as "trending" | "newest" | "bestselling" | "rating")}
        categories={[]}
      />

      <div className="container mx-auto px-4 py-8">
        <MarketplaceProducts 
          userId={user?.id || ""}
          category={selectedCategory !== "all" ? selectedCategory : undefined}
          sortBy={sortBy}
        />
      </div>

      <FloatingCart
        items={floatingCartItems}
        total={getTotalPrice()}
        onRemove={handleRemoveFromCart}
        onUpdateQuantity={updateQuantity}
      />
    </MarketplaceBazaar>
  );
}
