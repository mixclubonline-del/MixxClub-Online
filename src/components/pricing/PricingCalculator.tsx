/**
 * PricingCalculator — Interactive cost estimator with service selection,
 * package picking, add-on toggles, and MixxCoinz tier discount simulation.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ChevronDown, Coins, Check, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { GlassPanel } from '@/components/crm/design/GlassPanel';
import { MixingPackage } from '@/hooks/useMixingPackages';
import { MasteringPackage } from '@/hooks/useMasteringPackages';
import { AddonService, calculateAddonPrice } from '@/hooks/useAddonServices';
import { useNavigate } from 'react-router-dom';

const TIER_OPTIONS = [
  { label: 'Newcomer', discount: 0 },
  { label: 'Supporter', discount: 3 },
  { label: 'Advocate', discount: 5 },
  { label: 'Champion', discount: 10 },
  { label: 'Legend', discount: 15 },
] as const;

interface PricingCalculatorProps {
  mixingPackages?: (MixingPackage & { is_featured?: boolean })[];
  masteringPackages?: (MasteringPackage & { is_featured?: boolean })[];
  addons?: AddonService[];
}

export function PricingCalculator({ mixingPackages, masteringPackages, addons }: PricingCalculatorProps) {
  const navigate = useNavigate();
  const [calcService, setCalcService] = useState<'mixing' | 'mastering'>('mixing');
  const [selectedPkgId, setSelectedPkgId] = useState<string>('');
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [tierIndex, setTierIndex] = useState(0);

  const packages = calcService === 'mixing' ? mixingPackages : masteringPackages;

  // Auto-select first package when switching service or if none selected
  const selectedPkg = useMemo(() => {
    if (!packages || packages.length === 0) return null;
    const found = packages.find(p => p.id === selectedPkgId);
    return found || packages[0];
  }, [packages, selectedPkgId]);

  const basePrice = selectedPkg?.price ?? 0;

  // Filter addons for current service type
  const filteredAddons = useMemo(() => {
    if (!addons) return [];
    return addons.filter(a =>
      a.applicable_to?.includes(calcService) || a.applicable_to?.length === 0
    );
  }, [addons, calcService]);

  // Compute totals
  const breakdown = useMemo(() => {
    let addonsTotal = 0;
    const addonDetails: { name: string; price: number }[] = [];

    for (const addonId of selectedAddonIds) {
      const addon = filteredAddons.find(a => a.id === addonId);
      if (addon) {
        const p = calculateAddonPrice(addon, basePrice);
        addonsTotal += p;
        addonDetails.push({ name: addon.service_name, price: p });
      }
    }

    const subtotal = basePrice + addonsTotal;
    const discountPercent = TIER_OPTIONS[tierIndex].discount;
    const discountAmount = Math.floor(subtotal * discountPercent / 100);
    const total = subtotal - discountAmount;

    return { addonsTotal, addonDetails, subtotal, discountPercent, discountAmount, total };
  }, [basePrice, selectedAddonIds, filteredAddons, tierIndex]);

  const handleToggleAddon = (addonId: string) => {
    setSelectedAddonIds(prev =>
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    );
  };

  // Reset addons when switching service
  const handleServiceChange = (val: string) => {
    setCalcService(val as 'mixing' | 'mastering');
    setSelectedAddonIds([]);
    setSelectedPkgId('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
    >
      <GlassPanel accent="rgba(168,85,247,0.2)" glow className="overflow-visible">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Pricing Calculator</h3>
            <p className="text-sm text-muted-foreground">Estimate your total with add-ons and tier discounts</p>
          </div>
        </div>

        <div className="grid md:grid-cols-[1fr_300px] gap-8">
          {/* Left — Selections */}
          <div className="space-y-6">
            {/* Service Type */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Service Type</Label>
              <RadioGroup
                value={calcService}
                onValueChange={handleServiceChange}
                className="flex gap-4"
              >
                <label className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${calcService === 'mixing' ? 'border-primary bg-primary/10' : 'border-border/50 hover:border-primary/30'}`}>
                  <RadioGroupItem value="mixing" />
                  <span className="font-medium text-sm">Mixing</span>
                </label>
                <label className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${calcService === 'mastering' ? 'border-primary bg-primary/10' : 'border-border/50 hover:border-primary/30'}`}>
                  <RadioGroupItem value="mastering" />
                  <span className="font-medium text-sm">Mastering</span>
                </label>
              </RadioGroup>
            </div>

            {/* Package Picker */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Select Package</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {packages?.map(pkg => {
                  const isActive = selectedPkg?.id === pkg.id;
                  const pkgName = 'package_name' in pkg ? pkg.package_name : pkg.name;
                  return (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPkgId(pkg.id)}
                      className={`relative text-left p-3 rounded-xl border transition-all ${
                        isActive
                          ? 'border-primary bg-primary/10 shadow-[0_0_20px_hsl(var(--primary)/0.15)]'
                          : 'border-border/40 hover:border-primary/30 bg-background/30'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute top-2 right-2">
                          <Check className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <span className="font-semibold text-sm block">{pkgName}</span>
                      <span className="text-lg font-bold text-primary">${pkg.price}</span>
                      <span className="text-xs text-muted-foreground block mt-0.5">
                        {pkg.track_limit === 999 ? 'Unlimited' : `Up to ${pkg.track_limit}`} tracks
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add-Ons */}
            {filteredAddons.length > 0 && (
              <div>
                <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Add-On Services
                </Label>
                <div className="space-y-2">
                  {filteredAddons.map(addon => {
                    const checked = selectedAddonIds.includes(addon.id);
                    const price = calculateAddonPrice(addon, basePrice);
                    return (
                      <label
                        key={addon.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          checked ? 'border-primary/50 bg-primary/5' : 'border-border/30 hover:border-primary/20'
                        }`}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => handleToggleAddon(addon.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium">{addon.service_name}</span>
                          {addon.service_description && (
                            <p className="text-xs text-muted-foreground truncate">{addon.service_description}</p>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-primary whitespace-nowrap">
                          +${price.toFixed(0)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tier Discount */}
            <div>
              <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                MixxCoinz Tier Discount
              </Label>
              <div className="flex flex-wrap gap-2">
                {TIER_OPTIONS.map((tier, i) => (
                    <button
                      key={tier.label}
                      onClick={() => setTierIndex(i)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        tierIndex === i
                          ? 'border-accent/60 bg-accent/15 text-accent-foreground'
                          : 'border-border/40 text-muted-foreground hover:border-accent/30'
                      }`}
                    >
                    {tier.label} {tier.discount > 0 ? `(−${tier.discount}%)` : ''}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Earn higher tiers through platform engagement.{' '}
                <a href="/economy" className="text-primary hover:underline">Learn more →</a>
              </p>
            </div>
          </div>

          {/* Right — Live Breakdown */}
          <div className="flex flex-col">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-xl border border-border/40 bg-background/40 backdrop-blur-sm p-5">
                <h4 className="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wider">Estimate</h4>

                <div className="space-y-3">
                  {/* Base */}
                  <div className="flex justify-between text-sm">
                    <span>Base package</span>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={basePrice}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="font-medium"
                      >
                        ${basePrice.toFixed(0)}
                      </motion.span>
                    </AnimatePresence>
                  </div>

                  {/* Add-ons */}
                  {breakdown.addonDetails.map(ad => (
                    <motion.div
                      key={ad.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex justify-between text-sm text-muted-foreground"
                    >
                      <span className="flex items-center gap-1">
                        <Plus className="w-3 h-3" /> {ad.name}
                      </span>
                      <span>+${ad.price.toFixed(0)}</span>
                    </motion.div>
                  ))}

                  {/* Discount */}
                  {breakdown.discountAmount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex justify-between text-sm text-accent-foreground"
                    >
                      <span>{TIER_OPTIONS[tierIndex].label} discount</span>
                      <span>−${breakdown.discountAmount.toFixed(0)}</span>
                    </motion.div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-border/30 my-2" />

                  {/* Total */}
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold">Estimated Total</span>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={breakdown.total}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-2xl font-bold text-primary"
                      >
                        ${breakdown.total.toFixed(0)}
                      </motion.span>
                    </AnimatePresence>
                  </div>

                  {breakdown.discountAmount > 0 && (
                    <p className="text-xs text-accent-foreground">
                      You save ${breakdown.discountAmount.toFixed(0)} with {TIER_OPTIONS[tierIndex].label} tier
                    </p>
                  )}
                </div>
              </div>

              <Button
                onClick={() => {
                  if (selectedPkg) {
                    navigate(`/checkout?type=${calcService}&packageId=${selectedPkg.id}`);
                  } else {
                    navigate('/auth?signup=true');
                  }
                }}
                className="w-full"
                size="lg"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </GlassPanel>
    </motion.div>
  );
}
