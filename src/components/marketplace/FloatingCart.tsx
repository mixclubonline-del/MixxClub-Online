import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Minus, Plus, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

interface FloatingCartProps {
  items: CartItem[];
  total: number;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

export function FloatingCart({ items, total, onRemove, onUpdateQuantity }: FloatingCartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Floating Cart Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 
          text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-shadow"
      >
        <ShoppingCart className="h-6 w-6" />
        {itemCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-6 w-6 p-0 flex items-center justify-center bg-white text-orange-600 border-0"
          >
            {itemCount}
          </Badge>
        )}
      </motion.button>

      {/* Cart Panel Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Cart Panel */}
            <motion.div
              initial={{ opacity: 0, x: 100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-4 top-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-md 
                backdrop-blur-xl bg-black/80 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20">
                    <ShoppingCart className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Your Cart</h3>
                    <p className="text-sm text-white/50">{itemCount} items</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5 text-white/60" />
                </button>
              </div>

              {/* Items */}
              <div className="max-h-[50vh] overflow-y-auto p-4 space-y-3">
                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 mx-auto text-white/20 mb-3" />
                    <p className="text-white/40">Your cart is empty</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10"
                    >
                      {/* Image */}
                      <div className="w-14 h-14 rounded-lg bg-black/30 overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="h-6 w-6 text-white/20" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">{item.title}</h4>
                        <p className="text-orange-400 font-semibold">${item.price}</p>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <Minus className="h-4 w-4 text-white/60" />
                        </button>
                        <span className="w-8 text-center text-white text-sm">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <Plus className="h-4 w-4 text-white/60" />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => onRemove(item.id)}
                        className="p-1 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        <X className="h-4 w-4 text-red-400" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="p-6 border-t border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Total</span>
                    <span className="text-2xl font-bold text-white">${total.toFixed(2)}</span>
                  </div>
                  <Button 
                    className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Checkout
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
