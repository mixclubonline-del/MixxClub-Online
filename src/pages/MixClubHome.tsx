import { SEOHead } from '@/components/SEOHead';
import PrimeLanding from '@/components/prime/PrimeLanding';

export default function MixClubHome() {
  return (
    <>
      <SEOHead
        title="From Bedroom to Billboard"
        description="Transform your sound with AI-powered tools, professional engineers, and a collaborative network. From bedroom recordings to radio-ready tracks."
        keywords="MIXXCLUB, music mixing, mastering, AI studio, music collaboration, professional engineers, music production"
      />

      {/* No navigation overlay — the hallway is a pure immersive experience.
          Navigation begins at How It Works (/how-it-works) and beyond. */}
      <div className="min-h-screen">
        <PrimeLanding />
      </div>
    </>
  );
}
