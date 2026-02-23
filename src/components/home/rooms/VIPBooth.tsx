/**
 * The VIP Booth
 * 
 * Room 4: Member access.
 * Premium glassmorphic pricing cards with gold/amber VIP accents.
 */

import { motion } from 'framer-motion';
import { Crown, Check, Sparkles } from 'lucide-react';
import { ClubRoom } from '../ClubRoom';
import { Button } from '@/components/ui/button';
import { useSubscriptionPlans, getYearlyDiscountPercent } from '@/hooks/useSubscriptionPlans';
import { useNavigate } from 'react-router-dom';
import vipBoothVideo from '@/assets/videos/vip_booth.webp';

const PLAN_GLOWS = [
  { border: 'rgba(255, 255, 255, 0.06)', glow: 'none' },
  { border: 'rgba(212, 175, 55, 0.35)', glow: '0 0 60px -15px rgba(212, 175, 55, 0.25)' },
  { border: 'rgba(255, 255, 255, 0.08)', glow: 'none' },
];

export function VIPBooth() {
  const { data: plans, isLoading } = useSubscriptionPlans();
  const navigate = useNavigate();

  const displayPlans = plans?.slice(0, 3) || [
    { id: '1', display_name: 'Free', price_monthly: 0, features: ['Basic uploads', 'Community access', 'AI analysis'] },
    { id: '2', display_name: 'Starter', price_monthly: 19, features: ['10 mixes/month', 'Priority matching', 'HD downloads'] },
    { id: '3', display_name: 'Pro', price_monthly: 49, features: ['Unlimited mixes', 'VIP engineers', 'Distribution'] },
  ];

  return (
    <ClubRoom id="vip" className="bg-background relative overflow-hidden">
      {/* VIP amber ambient glow */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <div className="relative container px-6 py-20 flex flex-col items-center justify-center min-h-[100svh]">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="w-5 h-5" style={{ color: 'rgb(212, 175, 55)' }} />
            <span className="text-sm uppercase tracking-widest" style={{ color: 'rgba(212, 175, 55, 0.8)' }}>
              The VIP Booth
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black mb-4">
            Member{' '}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, rgb(212, 175, 55), rgb(255, 215, 0))' }}>
              access.
            </span>
          </h2>

          <p className="text-xl text-muted-foreground">
            No hidden fees. No contracts. Cancel anytime.
          </p>
        </motion.div>

        {/* Hero Banner — Enlarged */}
        <motion.div
          className="w-full max-w-5xl mb-14 rounded-2xl overflow-hidden relative group border border-white/[0.06]"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <img
            src={vipBoothVideo}
            alt="Premium gold-tinted glowing gear racks with blinking indicators"
            className="w-full h-[260px] md:h-[300px] object-cover group-hover:scale-[1.02] transition-transform duration-700"
            loading="lazy"
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, transparent 25%, hsl(var(--background)) 100%)'
            }}
          />
        </motion.div>

        {/* Pricing cards — Premium Glassmorphic */}
        <div className="grid md:grid-cols-3 gap-6 w-full max-w-5xl mb-12">
          {displayPlans.map((plan, index) => {
            const isPopular = index === 1;
            const planGlow = PLAN_GLOWS[index];
            const yearlyDiscount = 'price_yearly' in plan && plan.price_yearly
              ? getYearlyDiscountPercent(plan as any)
              : 0;

            return (
              <motion.div
                key={plan.id}
                className={`relative p-6 rounded-2xl border transition-all ${isPopular ? 'md:scale-105' : ''
                  }`}
                style={{
                  background: isPopular ? 'rgba(212, 175, 55, 0.04)' : 'rgba(255, 255, 255, 0.03)',
                  borderColor: planGlow.border,
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  boxShadow: planGlow.glow,
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                {/* Popular badge — Gold */}
                {isPopular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                    style={{
                      background: 'linear-gradient(135deg, rgb(212, 175, 55), rgb(255, 215, 0))',
                      color: 'rgb(20, 15, 5)',
                    }}
                  >
                    <Sparkles className="w-3 h-3" /> Most Popular
                  </div>
                )}

                <h3 className="text-xl font-bold mb-2">{plan.display_name}</h3>

                <div className="mb-6">
                  <span className="text-4xl font-black text-foreground">
                    ${plan.price_monthly}
                  </span>
                  {plan.price_monthly > 0 && (
                    <span className="text-muted-foreground">/month</span>
                  )}

                  {yearlyDiscount > 0 && (
                    <span
                      className="ml-2 text-xs px-2 py-1 rounded-full"
                      style={{
                        background: 'rgba(212, 175, 55, 0.12)',
                        color: 'rgb(212, 175, 55)',
                      }}
                    >
                      Save {yearlyDiscount}% yearly
                    </span>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {(Array.isArray(plan.features) ? plan.features.slice(0, 4) : []).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: isPopular ? 'rgb(212, 175, 55)' : 'hsl(var(--primary))' }} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => navigate('/auth?mode=signup')}
                  variant={isPopular ? 'default' : 'outline'}
                  className={`w-full ${isPopular ? '' : 'border-white/[0.08] hover:border-white/[0.15]'}`}
                  style={isPopular ? {
                    background: 'linear-gradient(135deg, rgb(212, 175, 55), rgb(255, 215, 0))',
                    color: 'rgb(20, 15, 5)',
                  } : undefined}
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
