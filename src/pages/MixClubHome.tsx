import { Helmet } from 'react-helmet-async';
import PrimeLanding from '@/components/prime/PrimeLanding';
import { HomeOverlayNav } from '@/components/home/HomeOverlayNav';

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

      <HomeOverlayNav />
      <div className="min-h-screen">
        <PrimeLanding />
      </div>
    </>
  );
}
