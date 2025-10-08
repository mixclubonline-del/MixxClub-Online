import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Suspense, lazy } from 'react';
import StudioHub from '@/components/studio/StudioHub';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Upload, 
  Music, 
  Sparkles,
  FileAudio,
  CheckCircle,
  Clock,
  TrendingUp,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { AudioFileUpload } from '@/components/crm/AudioFileUpload';
import Navigation from '@/components/Navigation';

const NeuralNetworkViz = lazy(() => import('@/components/3d/r3f/NeuralNetworkViz').then(m => ({ default: m.NeuralNetworkViz })));

const ArtistStudio = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAIProcessing, setIsAIProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background relative">
      {/* 3D Neural Network Background */}
      <div className="fixed inset-0 opacity-10 pointer-events-none z-0">
        <Suspense fallback={null}>
          <NeuralNetworkViz isProcessing={isAIProcessing} className="w-full h-full" />
        </Suspense>
      </div>
      
      <Navigation />
      <div className="pt-16 relative z-10">
        <StudioHub userRole="artist" />
      </div>
    </div>
  );
};

export default ArtistStudio;
