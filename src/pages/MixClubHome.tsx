import { Helmet } from 'react-helmet-async';
import PrimeLanding from '@/components/prime/PrimeLanding';

export default function MixClubHome() {
  return (
    <>
      <Helmet>
        <title>MIXXCLUB — From Bedroom to Billboard</title>
        <meta
          name="description"
          content="Transform your sound with AI-powered tools, professional engineers, and a collaborative network. From bedroom recordings to radio-ready tracks."
        />
        <meta name="keywords" content="MIXXCLUB, music mixing, mastering, AI studio, music collaboration, professional engineers, music production" />
      </Helmet>

      {/* No navigation overlay — the hallway is a pure immersive experience.
          Navigation begins at Choose Your Path (/choose-path) and beyond. */}
      <div className="min-h-screen">
        <PrimeLanding />
      </div>
    </>
  );
}
