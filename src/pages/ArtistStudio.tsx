import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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

const ArtistStudio = () => {
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
        <StudioHub userRole="artist" />
      </div>
    </div>
  );
};

export default ArtistStudio;
