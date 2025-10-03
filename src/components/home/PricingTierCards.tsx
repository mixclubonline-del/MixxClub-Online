import { motion } from 'framer-motion';
import { Star, TrendingUp, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PricingTier {
  id: string;
  name: string;
  price: string;
  level: string;
  features: string[];
  icon: typeof Star;
  popular?: boolean;
}

const tiers: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$29',
    level: 'Rising Talent',
    features: ['Up-and-coming engineers', 'Standard delivery (48-72hr)', '2 revisions included'],
    icon: Star,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$79',
    level: 'Proven Pros',
    features: ['Experienced engineers', 'Fast delivery (24-48hr)', '5 revisions included', 'Portfolio highlights'],
    icon: TrendingUp,
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$149+',
    level: 'Studio Veterans',
    features: ['Industry veterans', 'Priority delivery (12-24hr)', 'Unlimited revisions', 'Major label credits'],
    icon: Award,
  },
];

export const PricingTierCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-8">
      {tiers.map((tier, index) => (
        <motion.div
          key={tier.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`relative overflow-hidden p-6 border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
            tier.popular ? 'border-primary shadow-lg' : 'border-border hover:border-primary/50'
          }`}>
            {tier.popular && (
              <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                Most Popular
              </Badge>
            )}
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <tier.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{tier.name}</h3>
                <p className="text-sm text-muted-foreground">{tier.level}</p>
              </div>
            </div>

            <div className="mb-4">
              <span className="text-4xl font-bold">{tier.price}</span>
              <span className="text-muted-foreground">/track</span>
            </div>

            <ul className="space-y-2">
              {tier.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-1">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
