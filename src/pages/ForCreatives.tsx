import { useEffect } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { EcosystemStoryController } from '@/components/creatives/EcosystemStoryController';
import { useEcosystemAssets } from '@/hooks/useEcosystemAssets';

export default function ForCreatives() {
  const { assets, isLoading } = useEcosystemAssets();

  return (
    <>
      <SEOHead
        title="The Ecosystem — How Everyone Eats | MixxClub"
        description="Artists, engineers, producers, fans — one ecosystem where everyone eats. Discover the new music economy."
        canonicalUrl="https://mixxclub.lovable.app/for-creatives"
        ogImage={assets.connection.url}
      />
      <EcosystemStoryController assets={assets} isLoading={isLoading} />
    </>
  );
}
