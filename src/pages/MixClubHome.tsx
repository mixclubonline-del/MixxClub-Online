import { Helmet } from 'react-helmet-async';
import Navigation from '@/components/Navigation';
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
        <meta name="keywords" content="music mixing, mastering, AI studio, music collaboration, professional engineers, music production" />
      </Helmet>

      <div className="min-h-screen">
        <Navigation />
        <div className="pt-16">
          <PrimeLanding />
        </div>
      </div>
    </>
  );
}
