import Navigation from '@/components/Navigation';
import { StorefrontManager } from '@/components/storefront/StorefrontManager';

export default function ArtistMerchManager() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container px-6 pt-24 pb-12">
        <StorefrontManager />
      </div>
    </div>
  );
}
