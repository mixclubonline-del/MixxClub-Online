/**
 * The VIP Booth
 * 
 * Room 4: Member access.
 * Exclusive pricing reveal with subscription plans.
 */

import { motion } from 'framer-motion';
import { Crown, Check, Sparkles } from 'lucide-react';
import { ClubRoom } from '../ClubRoom';
import { Button } from '@/components/ui/button';
import { useSubscriptionPlans, getYearlyDiscountPercent } from '@/hooks/useSubscriptionPlans';
import { useNavigate } from 'react-router-dom';

export function VIPBooth() {
  const { data: plans, isLoading } = useSubscriptionPlans();
  const navigate = useNavigate();

  // Show first 3 plans or fallback
  const displayPlans = plans?.slice(0, 3) || [
    { id: '1', display_name: 'Free', price_monthly: 0, features: ['Basic uploads', 'Community access', 'AI analysis'] },
    { id: '2', display_name: 'Starter', price_monthly: 19, features: ['10 mixes/month', 'Priority matching', 'HD downloads'] },
    { id: '3', display_name: 'Pro', price_monthly: 49, features: ['Unlimited mixes', 'VIP engineers', 'Distribution'] },
  ];

  return (
    <ClubRoom id="vip" className="bg-background">
      <div className="container px-6 py-20 flex flex-col items-center justify-center min-h-[100svh]">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-primary" />
            <span className="text-sm uppercase tracking-widest text-primary/80">
              The VIP Booth
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black mb-4">
            Member{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              access.
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground">
            No hidden fees. No contracts. Cancel anytime.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 w-full max-w-5xl mb-12">
          {displayPlans.map((plan, index) => {
            const isPopular = index === 1;
            const yearlyDiscount = 'price_yearly' in plan && plan.price_yearly 
              ? getYearlyDiscountPercent(plan as any) 
              : 0;

            return (
              <motion.div
                key={plan.id}
                className={`relative p-6 rounded-2xl border transition-all ${
                  isPopular 
                    ? 'bg-primary/5 border-primary/40 scale-105' 
                    : 'bg-muted/20 border-border/30 hover:border-primary/30'
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Popular badge */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Most Popular
                  </div>
                )}

                {/* Plan name */}
                <h3 className="text-xl font-bold mb-2">{plan.display_name}</h3>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-black text-foreground">
                    ${plan.price_monthly}
                  </span>
                  {plan.price_monthly > 0 && (
                    <span className="text-muted-foreground">/month</span>
                  )}
                  
                  {yearlyDiscount > 0 && (
                    <span className="ml-2 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      Save {yearlyDiscount}% yearly
                    </span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {(Array.isArray(plan.features) ? plan.features.slice(0, 4) : []).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  onClick={() => navigate('/auth?mode=signup')}
                  variant={isPopular ? 'default' : 'outline'}
                  className="w-full"
                >
                  {plan.price_monthly === 0 ? 'Get Started Free' : 'Choose Plan'}
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Trust line */}
        <motion.p
          className="text-sm text-muted-foreground text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Trusted by 10,000+ artists and engineers worldwide
        </motion.p>
      </div>
    </ClubRoom>
  );
}
