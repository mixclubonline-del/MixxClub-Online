import { useState } from 'react';
import { Check, Plus, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddonService, calculateAddonPrice, formatAddonPrice } from '@/hooks/useAddonServices';

interface AddOnSelectorProps {
  addons: AddonService[];
  basePrice: number;
  selectedAddons: string[];
  onToggleAddon: (addonId: string) => void;
}

export function AddOnSelector({ addons, basePrice, selectedAddons, onToggleAddon }: AddOnSelectorProps) {
  if (!addons || addons.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Enhance Your Order</h3>
      </div>
      
      <div className="grid gap-3">
        {addons.map((addon) => {
          const isSelected = selectedAddons.includes(addon.id);
          const addonPrice = calculateAddonPrice(addon, basePrice);
          
          return (
            <Card
              key={addon.id}
              className={`p-4 cursor-pointer transition-all ${
                isSelected 
                  ? 'border-primary bg-primary/5' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => onToggleAddon(addon.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{addon.service_name}</span>
                    {addon.is_percentage && (
                      <Badge variant="secondary" className="text-xs">
                        {addon.percentage_value}% of order
                      </Badge>
                    )}
                  </div>
                  {addon.service_description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {addon.service_description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-primary">
                    +${addonPrice.toFixed(0)}
                  </span>
                  <Button
                    size="sm"
                    variant={isSelected ? 'default' : 'outline'}
                    className="h-8 w-8 p-0"
                  >
                    {isSelected ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
