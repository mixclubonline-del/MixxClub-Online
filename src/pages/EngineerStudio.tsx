import { useEffect } from 'react';
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

const EngineerStudio = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-16">
        <StudioHub userRole="engineer" />
      </div>
    </div>
  );
};

export default EngineerStudio;
