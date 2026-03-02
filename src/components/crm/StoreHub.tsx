/**
 * StoreHub — Wrapped with GlassPanel design token for visual consistency.
 * 
 * Thin wrapper around StorefrontManager with glassmorphic container,
 * section header, and ambient glow.
 */

import { StorefrontManager } from '@/components/storefront/StorefrontManager';
import { GlassPanel, HubHeader } from './design';
import { ShoppingBag } from 'lucide-react';

export const StoreHub = () => {
  return (
    <div className="space-y-6">
      <HubHeader
        icon={<ShoppingBag className="h-5 w-5 text-emerald-400" />}
        title="Store"
        subtitle="Manage your merch, products & digital goods"
        accent="rgba(52, 211, 153, 0.5)"
      />
      <GlassPanel glow padding="p-4" accent="rgba(52, 211, 153, 0.3)">
        <StorefrontManager />
      </GlassPanel>
    </div>
  );
};
