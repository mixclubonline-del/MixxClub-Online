import { motion } from 'framer-motion';
import { Package, Search } from 'lucide-react';

interface EmptyBazaarProps {
  hasFilters?: boolean;
}

export function EmptyBazaar({ hasFilters }: EmptyBazaarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-24 px-4"
    >
      <div className="relative mb-6">
        {/* Glow effect */}
        <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-orange-500/20 to-purple-500/20 rounded-full" />
        
        <div className="relative p-6 rounded-3xl bg-white/5 border border-white/10">
          {hasFilters ? (
            <Search className="h-16 w-16 text-white/30" />
          ) : (
            <Package className="h-16 w-16 text-white/30" />
          )}
        </div>
      </div>

      <h3 className="text-2xl font-semibold text-white mb-2">
        {hasFilters ? 'No items found' : 'Bazaar is empty'}
      </h3>
      
      <p className="text-white/50 text-center max-w-md">
        {hasFilters 
          ? 'Try adjusting your search or filters to find what you\'re looking for'
          : 'Check back soon for new beats, samples, and presets from our creators'
        }
      </p>
    </motion.div>
  );
}
