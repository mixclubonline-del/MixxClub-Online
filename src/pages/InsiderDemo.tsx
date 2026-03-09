import { useNavigate } from 'react-router-dom';
import { InsiderDemoExperience } from '@/components/demo/InsiderDemoExperience';
import { trackEvent } from '@/lib/analytics';

export default function InsiderDemo() {
  const navigate = useNavigate();

  return (
    <InsiderDemoExperience
      onBack={() => navigate('/')}
      onLearnMore={() => navigate('/?scene=info')}
      onJoinNow={() => {
        trackEvent('funnel_cta_click', 'funnel', 'demo_join_now');
        trackEvent('funnel_conversion_complete', 'funnel', 'how_it_works');
        navigate('/home');
      }}
    />
  );
}
