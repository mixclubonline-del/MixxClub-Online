import { useEffect } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { PromoFunnelController } from '@/components/promo/PromoFunnelController';
import { usePromoAssets } from '@/hooks/usePromoAssets';
import { useFunnelTracking } from '@/hooks/useFunnelTracking';

export default function PromoFunnel() {
  const { assets, isLoading } = usePromoAssets();
  const { trackStep } = useFunnelTracking('promo');

  useEffect(() => {
    const params = Object.fromEntries(new URLSearchParams(window.location.search));
    trackStep('landed', params);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <SEOHead
        title="Your Sound. Elevated"
        description="Professional mixing and mastering for independent artists. Join the culture."
        canonicalUrl="https://mixxclub.lovable.app/go"
        ogImage={assets.hook.url ?? '/og-default.jpg'}
      />
      <PromoFunnelController assets={assets} isLoading={isLoading} trackStep={trackStep} />
    </>
  );
}
