import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, X, Crown, Music } from 'lucide-react';
import { GlassPanel } from '@/components/crm/design';
import type { ProducerBeat } from '@/hooks/useProducerBeats';

interface LicenseComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beat: ProducerBeat;
  onPurchase?: (licenseType: 'lease' | 'exclusive') => void;
}

const formatPrice = (cents: number | null) => {
  return `$${((cents || 0) / 100).toFixed(0)}`;
};

const TIERS = [
  {
    key: 'lease' as const,
    name: 'Lease',
    icon: <Music className="h-5 w-5" />,
    color: 'rgba(59, 130, 246, 0.5)',
    features: [
      { label: 'MP3 Download', included: true },
      { label: 'WAV Download', included: false },
      { label: 'Track Stems', included: false },
      { label: 'Up to 50,000 streams', included: true },
      { label: 'Non-exclusive rights', included: true },
      { label: 'Music video use', included: true },
      { label: 'Radio broadcasting', included: false },
      { label: 'Unlimited distribution', included: false },
    ],
  },
  {
    key: 'exclusive' as const,
    name: 'Exclusive',
    icon: <Crown className="h-5 w-5 text-yellow-500" />,
    color: 'rgba(234, 179, 8, 0.5)',
    features: [
      { label: 'MP3 Download', included: true },
      { label: 'WAV Download', included: true },
      { label: 'Track Stems', included: true },
      { label: 'Unlimited streams', included: true },
      { label: 'Full exclusive rights', included: true },
      { label: 'Music video use', included: true },
      { label: 'Radio broadcasting', included: true },
      { label: 'Unlimited distribution', included: true },
    ],
  },
];

export function LicenseComparisonModal({ open, onOpenChange, beat, onPurchase }: LicenseComparisonModalProps) {
  const tierPrices: Record<'lease' | 'exclusive', number> = {
    lease: beat.price_cents || 1999,
    exclusive: beat.exclusive_price_cents || 29900,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">License Options — {beat.title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {TIERS.map((tier) => (
            <GlassPanel
              key={tier.key}
              accent={tier.color}
              glow={tier.key === 'exclusive'}
              className={tier.key === 'exclusive' ? 'ring-2 ring-primary/50' : ''}
              padding="p-5"
            >
              <div className="space-y-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    {tier.icon}
                    <h3 className="font-bold text-lg">{tier.name}</h3>
                  </div>
                  <p className="text-2xl font-black text-foreground">
                    {formatPrice(tierPrices[tier.key])}
                  </p>
                </div>

                <div className="space-y-2">
                  {tier.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-sm">
                      {feature.included ? (
                        <Check className="h-4 w-4 text-green-500 shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                      )}
                      <span className={feature.included ? 'text-foreground' : 'text-muted-foreground/60'}>
                        {feature.label}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full"
                  variant={tier.key === 'exclusive' ? 'default' : 'secondary'}
                  onClick={() => {
                    onPurchase?.(tier.key);
                    onOpenChange(false);
                  }}
                >
                  {tier.key === 'exclusive' ? 'Buy Exclusive' : 'Get Lease'}
                </Button>
              </div>
            </GlassPanel>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
