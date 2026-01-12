import { motion } from 'framer-motion';
import { Music, FileAudio, Wand2, Package, ShoppingCart, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductShowcaseProps {
  item: {
    id: string;
    item_name: string;
    item_description?: string;
    item_type: string;
    price: number;
    preview_urls?: string[];
    sales_count?: number;
    marketplace_categories?: {
      category_name: string;
    };
  };
  onAddToCart: () => void;
  onBuyNow: () => void;
  isPurchasing?: boolean;
  index?: number;
}

export function ProductShowcase({ 
  item, 
  onAddToCart, 
  onBuyNow, 
  isPurchasing,
  index = 0 
}: ProductShowcaseProps) {
  const getItemIcon = (type: string) => {
    switch (type) {
      case "beat": return <Music className="h-5 w-5" />;
      case "sample": return <FileAudio className="h-5 w-5" />;
      case "preset": return <Wand2 className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const getTypeGradient = (type: string) => {
    switch (type) {
      case "beat": return "from-orange-500/20 to-red-500/20";
      case "sample": return "from-cyan-500/20 to-blue-500/20";
      case "preset": return "from-purple-500/20 to-pink-500/20";
      default: return "from-gray-500/20 to-gray-600/20";
    }
  };

  const getTypeBorderColor = (type: string) => {
    switch (type) {
      case "beat": return "hover:border-orange-500/50";
      case "sample": return "hover:border-cyan-500/50";
      case "preset": return "hover:border-purple-500/50";
      default: return "hover:border-white/30";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`group relative backdrop-blur-lg bg-gradient-to-br ${getTypeGradient(item.item_type)} 
        border border-white/10 ${getTypeBorderColor(item.item_type)} rounded-2xl overflow-hidden 
        transition-all duration-300 shadow-lg hover:shadow-2xl`}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className={`absolute inset-0 blur-xl bg-gradient-to-br ${getTypeGradient(item.item_type)}`} />
      </div>

      {/* Content */}
      <div className="relative z-10 p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-white/10 text-white">
              {getItemIcon(item.item_type)}
            </div>
            <Badge variant="outline" className="bg-white/5 border-white/20 text-white/80 text-xs">
              {item.item_type}
            </Badge>
          </div>
          {item.sales_count && item.sales_count > 0 && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              {item.sales_count} sold
            </Badge>
          )}
        </div>

        {/* Preview Image */}
        <div className="aspect-video bg-black/30 rounded-xl overflow-hidden mb-4 border border-white/5">
          {item.preview_urls?.[0] ? (
            <img 
              src={item.preview_urls[0]} 
              alt={item.item_name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-12 w-12 text-white/20" />
            </div>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1 group-hover:text-orange-300 transition-colors">
          {item.item_name}
        </h3>
        <p className="text-sm text-white/50 line-clamp-2 mb-4 min-h-[2.5rem]">
          {item.item_description || "No description available"}
        </p>

        {/* Price & Category */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-white">
            ${item.price}
          </span>
          {item.marketplace_categories && (
            <Badge variant="outline" className="bg-white/5 border-white/10 text-white/60 text-xs">
              {item.marketplace_categories.category_name}
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30"
            onClick={onAddToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Cart
          </Button>
          <Button 
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0"
            onClick={onBuyNow}
            disabled={isPurchasing}
          >
            <Zap className="h-4 w-4 mr-2" />
            Buy Now
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
