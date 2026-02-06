import { motion } from 'framer-motion';
import { ShoppingBag, Gift, Star, Unlock, Music, Ticket } from 'lucide-react';

interface SpendingDestination {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  glow: string;
  minCost: number;
}

const DESTINATIONS: SpendingDestination[] = [
  {
    id: 'merch',
    name: 'Artist Merch',
    description: 'Exclusive drops & collabs',
    icon: ShoppingBag,
    color: 'text-purple-400',
    glow: 'rgba(192,132,252,0.12)',
    minCost: 100,
  },
  {
    id: 'tips',
    name: 'Tip Artists',
    description: 'Support your favorites',
    icon: Gift,
    color: 'text-pink-400',
    glow: 'rgba(244,114,182,0.12)',
    minCost: 10,
  },
  {
    id: 'premium',
    name: 'Premium Access',
    description: 'Unlock exclusive content',
    icon: Unlock,
    color: 'text-amber-400',
    glow: 'rgba(251,191,36,0.12)',
    minCost: 500,
  },
  {
    id: 'events',
    name: 'Event Tickets',
    description: 'VIP access & meet-ups',
    icon: Ticket,
    color: 'text-blue-400',
    glow: 'rgba(96,165,250,0.12)',
    minCost: 200,
  },
  {
    id: 'music',
    name: 'Beat Marketplace',
    description: 'Buy beats & samples',
    icon: Music,
    color: 'text-emerald-400',
    glow: 'rgba(52,211,153,0.12)',
    minCost: 50,
  },
  {
    id: 'votes',
    name: 'Power Votes',
    description: 'Boost your favorites',
    icon: Star,
    color: 'text-orange-400',
    glow: 'rgba(251,146,60,0.12)',
    minCost: 25,
  },
];

interface SpendingDestinationsProps {
  balance: number;
  onNavigate?: (destination: string) => void;
}

export function SpendingDestinations({ balance, onNavigate }: SpendingDestinationsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm tracking-wide uppercase text-muted-foreground">Ways to Spend</h3>
        <span className="text-sm text-muted-foreground">
          Balance: <span className="text-primary font-medium">{balance.toLocaleString()}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {DESTINATIONS.map((dest, i) => {
          const canAfford = balance >= dest.minCost;
          
          return (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <div
                className={`relative rounded-xl border p-4 cursor-pointer transition-all duration-300 overflow-hidden group ${
                  canAfford
                    ? 'border-white/[0.08] hover:border-white/[0.15] hover:scale-[1.03]'
                    : 'border-white/[0.04] opacity-50'
                }`}
                style={{
                  background: canAfford ? dest.glow : 'rgba(255,255,255,0.02)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                }}
                onClick={() => canAfford && onNavigate?.(dest.id)}
              >
                {/* Hover glow */}
                {canAfford && (
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, ${dest.glow.replace('0.12', '0.25')} 0%, transparent 70%)`,
                    }}
                  />
                )}

                <div className="relative z-10">
                  <div
                    className="p-2 rounded-lg w-fit mb-3"
                    style={{ background: dest.glow }}
                  >
                    <dest.icon className={`h-5 w-5 ${dest.color}`} />
                  </div>
                  <h4 className="font-medium text-sm">{dest.name}</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    {dest.description}
                  </p>
                  <p className={`text-xs ${canAfford ? dest.color : 'text-muted-foreground'}`}>
                    From {dest.minCost} coinz
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
