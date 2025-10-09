import { Helmet } from 'react-helmet-async';
import NeuralHub from '@/components/mixclub/NeuralHub';

export default function MixClubHome() {
  return (
    <>
      <Helmet>
        <title>Mixxclub — Music Collaboration Network</title>
        <meta 
          name="description" 
          content="The social hub for music creators. Connect with artists, engineers, and producers in a collaborative network." 
        />
        <meta name="keywords" content="music collaboration, social network, artists, engineers, music community" />
      </Helmet>

      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <NeuralHub />
      </div>
    </>
  );
}
