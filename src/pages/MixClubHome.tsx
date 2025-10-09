import { Helmet } from 'react-helmet-async';
import NeuralHub from '@/components/mixclub/NeuralHub';

export default function MixClubHome() {
  return (
    <>
      <Helmet>
        <title>MIXXCLUB — Music Collaboration Network</title>
        <meta 
          name="description" 
          content="The social hub for music creators. Connect with artists, engineers, and producers in a collaborative network powered by MIXXCLUB." 
        />
        <meta name="keywords" content="MIXXCLUB, music collaboration, social network, artists, engineers, music community" />
      </Helmet>

      <div className="min-h-screen overflow-y-auto overflow-x-hidden bg-[#0a0a1a]">
        <div className="w-full py-8">
          <NeuralHub />
        </div>
      </div>
    </>
  );
}
