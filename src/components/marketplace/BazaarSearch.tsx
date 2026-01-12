import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BazaarSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  categories?: Array<{ id: string; category_name: string }>;
}

export function BazaarSearch({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  categories = [],
}: BazaarSearchProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="sticky top-20 z-30 px-4 md:px-8 py-4"
    >
      <div className="max-w-5xl mx-auto">
        <div className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl p-4 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search beats, samples, presets..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-orange-500/50 focus:ring-orange-500/20"
              />
            </div>
            
            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-full md:w-[180px] h-12 bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/10 backdrop-blur-xl">
                <SelectItem value="all" className="text-white hover:bg-white/10">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="text-white hover:bg-white/10">
                    {cat.category_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-full md:w-[180px] h-12 bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/10 backdrop-blur-xl">
                <SelectItem value="newest" className="text-white hover:bg-white/10">Newest</SelectItem>
                <SelectItem value="popular" className="text-white hover:bg-white/10">Most Popular</SelectItem>
                <SelectItem value="price-low" className="text-white hover:bg-white/10">Price: Low to High</SelectItem>
                <SelectItem value="price-high" className="text-white hover:bg-white/10">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
