import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Zap, Plus } from 'lucide-react';

interface AddOn {
  id: string;
  name: string;
  price: number;
  description: string;
  popular?: boolean;
}

const addOns: AddOn[] = [
  { id: 'revisions', name: 'Unlimited Revisions', price: 20, description: 'No limits on tweaks', popular: true },
  { id: 'rush', name: 'Rush Delivery (12hr)', price: 25, description: 'Priority queue' },
  { id: 'stems', name: 'Stem Separation', price: 15, description: 'Individual track exports' },
  { id: 'tuning', name: 'Vocal Tuning', price: 20, description: 'Professional pitch correction' },
];

const baseTiers = [
  { id: 'starter', name: 'Starter', price: 29 },
  { id: 'professional', name: 'Professional', price: 79 },
  { id: 'premium', name: 'Premium', price: 149 },
];

export const PackageBuilder = () => {
  const [selectedTier, setSelectedTier] = useState('professional');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  const basePrice = baseTiers.find(t => t.id === selectedTier)?.price || 0;
  const addOnTotal = addOns
    .filter(a => selectedAddOns.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);
  const total = basePrice + addOnTotal;

  const toggleAddOn = (id: string) => {
    setSelectedAddOns(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <Card className="p-8">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Build Your Perfect Package</h2>
      </div>

      {/* Base Tier Selection */}
      <div className="mb-8">
        <h3 className="font-semibold mb-3">Select Your Engineer Tier</h3>
        <div className="grid grid-cols-3 gap-3">
          {baseTiers.map((tier) => (
            <Button
              key={tier.id}
              variant={selectedTier === tier.id ? 'default' : 'outline'}
              className="flex flex-col h-auto py-4"
              onClick={() => setSelectedTier(tier.id)}
            >
              <span className="font-bold">{tier.name}</span>
              <span className="text-sm">${tier.price}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Add-ons */}
      <div className="mb-8">
        <h3 className="font-semibold mb-3">Add Premium Services</h3>
        <div className="space-y-3">
          {addOns.map((addOn) => (
            <motion.div
              key={addOn.id}
              whileHover={{ scale: 1.02 }}
              className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                selectedAddOns.includes(addOn.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => toggleAddOn(addOn.id)}
            >
              <Checkbox
                checked={selectedAddOns.includes(addOn.id)}
                onCheckedChange={() => toggleAddOn(addOn.id)}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{addOn.name}</span>
                  {addOn.popular && (
                    <Badge variant="secondary" className="text-xs">Popular</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{addOn.description}</p>
              </div>
              <div className="text-right">
                <Plus className="w-4 h-4 text-primary mb-1" />
                <span className="font-bold">${addOn.price}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-muted-foreground">Base Price</p>
            <p className="text-2xl font-bold">${basePrice}</p>
          </div>
          {addOnTotal > 0 && (
            <div>
              <p className="text-muted-foreground">Add-ons</p>
              <p className="text-2xl font-bold text-primary">+${addOnTotal}</p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground">Total</p>
            <p className="text-3xl font-bold">${total}</p>
          </div>
        </div>
        <Button size="lg" className="w-full">
          Continue with This Package
        </Button>
      </div>
    </Card>
  );
};
