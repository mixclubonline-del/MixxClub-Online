/**
 * The VIP Booth
 * 
 * Room 4: Member access.
 * Premium glassmorphic pricing with billing toggle, hover highlights, and sparkle effects.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Check, Sparkles, X } from 'lucide-react';
import { ClubRoom } from '../ClubRoom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useSubscriptionPlans, getYearlyDiscountPercent } from '@/hooks/useSubscriptionPlans';
import { useNavigate } from 'react-router-dom';
import vipBoothVideo from '@/assets/videos/vip_booth.webp';

const PLAN_GLOWS = [
  { border: 'rgba(255, 255, 255, 0.06)', glow: 'none', hoverGlow: '0 0 40px -15px hsl(var(--primary) / 0.2)' },
  { border: 'rgba(212, 175, 55, 0.35)', glow: '0 0 60px -15px rgba(212, 175, 55, 0.25)', hoverGlow: '0 0 80px -15px rgba(212, 175, 55, 0.4)' },
  { border: 'rgba(255, 255, 255, 0.08)', glow: 'none', hoverGlow: '0 0 40px -15px hsl(var(--primary) / 0.2)' },
];

export function VIPBooth() {
  const { data: plans, isLoading } = useSubscriptionPlans();
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);

  const displayPlans = plans?.slice(0, 3) || [
    { id: '1', display_name: 'Free', price_monthly: 0, price_yearly: 0, features: ['Basic uploads', 'Community access', 'AI analysis'] },
    { id: '2', display_name: 'Starter', price_monthly: 19, price_yearly: 190, features: ['10 mixes/month', 'Priority matching', 'HD downloads', 'Analytics dashboard'] },
    { id: '3', display_name: 'Pro', price_monthly: 49, price_yearly: 470, features: ['Unlimited mixes', 'VIP engineers', 'Distribution', 'Revenue tracking'] },
  ];

  return (
    <ClubRoom id="vip" className="bg-background relative overflow-hidden">
      {/* VIP amber ambient glow — intensifies on card hover */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)' }}
        animate={{
          scale: hoveredPlan === 1 ? [1.2, 1.4, 1.2] : [1, 1.25, 1],
          opacity: hoveredPlan === 1 ? [0.5, 0.8, 0.5] : [0.3, 0.6, 0.3],
        }}
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

        {/* Hero Banner */}
        <motion.div
          className="w-full max-w-5xl mb-10 rounded-2xl overflow-hidden relative group border border-white/[0.06]"
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

        {/* Billing Toggle */}
        <motion.div
          className="flex items-center gap-3 mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
        >
          <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <Switch checked={isYearly} onCheckedChange={setIsYearly} />
          <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Yearly
          </span>
          {isYearly && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mg-pill text-xs px-2 py-1"
              style={{ color: 'rgb(212, 175, 55)' }}
            >
              Save up to 20%
            </motion.span>
          )}
        </motion.div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 w-full max-w-5xl mb-12">
          {displayPlans.map((plan, index) => {
            const isPopular = index === 1;
            const planGlow = PLAN_GLOWS[index];
            const isHovered = hoveredPlan === index;
            const price = isYearly && 'price_yearly' in plan && plan.price_yearly
              ? Math.round((plan.price_yearly as number) / 12)
              : plan.price_monthly;
            const yearlyDiscount = 'price_yearly' in plan && plan.price_yearly
              ? getYearlyDiscountPercent(plan as any)
              : 0;

            return (
              <motion.div
                key={plan.id}
                className={`mg-panel relative p-6 ${isPopular ? 'md:scale-105' : ''}`}
                style={{
                  boxShadow: isHovered ? planGlow.hoverGlow : planGlow.glow,
                  transition: 'box-shadow 0.3s ease',
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                onHoverStart={() => setHoveredPlan(index)}
                onHoverEnd={() => setHoveredPlan(null)}
              >
                {/* Popular badge */}
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

                {/* Sparkle particles on popular card */}
                {isPopular && (
                  <>
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full pointer-events-none"
                        style={{ background: 'rgb(212, 175, 55)' }}
                        animate={{
                          x: [0, (i - 1) * 30, 0],
                          y: [-10 - i * 15, -30 - i * 20, -10 - i * 15],
                          opacity: [0, 0.8, 0],
                          scale: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 3 + i * 0.5,
                          repeat: Infinity,
                          delay: i * 0.8,
                        }}
                      />
                    ))}
                  </>
                )}

                <h3 className="text-xl font-bold mb-2">{plan.display_name}</h3>

                <div className="mb-6">
                  <motion.span
                    key={`${price}-${isYearly}`}
                    className="text-4xl font-black text-foreground"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    ${price}
                  </motion.span>
                  {price > 0 && (
                    <span className="text-muted-foreground">/month</span>
                  )}

                  {isYearly && yearlyDiscount > 0 && (
                    <span
                      className="ml-2 text-xs px-2 py-1 rounded-full"
                      style={{
                        background: 'rgba(212, 175, 55, 0.12)',
                        color: 'rgb(212, 175, 55)',
                      }}
                    >
                      Save {yearlyDiscount}%
                    </span>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {(Array.isArray(plan.features) ? plan.features.slice(0, 4) : []).map((feature, i) => (
                    <motion.li
                      key={i}
                      className="flex items-center gap-2 text-sm transition-opacity"
                      style={{
                        opacity: hoveredPlan !== null && hoveredPlan !== index ? 0.4 : 1,
                        color: 'hsl(var(--muted-foreground))',
                      }}
                    >
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: isPopular ? 'rgb(212, 175, 55)' : 'hsl(var(--primary))' }} />
                      {feature}
                    </motion.li>
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
                  {plan.price_monthly === 0 ? 'Get Started Free' : isYearly ? 'Start Yearly Plan' : 'Choose Plan'}
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
