import { useEffect, Suspense, lazy, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import StudioHub from '@/components/studio/StudioHub';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Music, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  FileAudio,
  TrendingUp,
  BarChart3,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';

const NeuralNetworkViz = lazy(() => import('@/components/3d/r3f/NeuralNetworkViz').then(m => ({ default: m.NeuralNetworkViz })));

const EngineerStudio = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

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
          <NeuralNetworkViz isProcessing={isProcessing} className="w-full h-full" />
        </Suspense>
      </div>
      
      <Navigation />
      <div className="pt-16 relative z-10">
        <StudioHub userRole="engineer" />
      </div>
    </div>
  );
};

export default EngineerStudio;
