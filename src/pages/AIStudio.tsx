import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, Music, Mic, BarChart3, Wrench, Brain, 
  CheckCircle, ArrowLeft, Zap 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MusicGenerator } from "@/components/ai/MusicGenerator";
import { TextToSpeech } from "@/components/ai/TextToSpeech";
import { BusinessAnalytics } from "@/components/ai/BusinessAnalytics";
import { TrackNameGenerator } from "@/components/ai/TrackNameGenerator";
import { AlbumArtworkGenerator } from "@/components/ai/AlbumArtworkGenerator";
import { MixReadinessChecker } from "@/components/audio/MixReadinessChecker";
import { ReferenceTrackComparison } from "@/components/audio/ReferenceTrackComparison";
import { SocialMediaPostGenerator } from "@/components/crm/SocialMediaPostGenerator";
import { AudioRestoration } from "@/components/ai/AudioRestoration";
import { ChordProgressionGenerator } from "@/components/ai/ChordProgressionGenerator";
import { AutomationAssistant } from "@/components/ai/AutomationAssistant";
import { QualityControl } from "@/components/ai/QualityControl";

export default function AIStudio() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-primary" />
                AI Studio
              </h1>
              <p className="text-muted-foreground mt-2">
                Complete AI-powered music production suite
              </p>
            </div>
          </div>
          <Badge variant="default" className="gap-2 px-4 py-2">
            <Zap className="h-4 w-4" />
            12 AI Tools
          </Badge>
        </div>

        <Tabs defaultValue="creation" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="creation" className="gap-2">
              <Music className="h-4 w-4" />
              Creation
            </TabsTrigger>
            <TabsTrigger value="voice" className="gap-2">
              <Mic className="h-4 w-4" />
              Voice
            </TabsTrigger>
            <TabsTrigger value="analysis" className="gap-2">
              <Brain className="h-4 w-4" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="restoration" className="gap-2">
              <Wrench className="h-4 w-4" />
              Restoration
            </TabsTrigger>
            <TabsTrigger value="automation" className="gap-2">
              <Zap className="h-4 w-4" />
              Automation
            </TabsTrigger>
            <TabsTrigger value="business" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Business
            </TabsTrigger>
          </TabsList>

          <TabsContent value="creation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MusicGenerator />
              <ChordProgressionGenerator />
              <AlbumArtworkGenerator />
            </div>
          </TabsContent>

          <TabsContent value="voice" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TextToSpeech />
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Mic className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Voice Commands</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Control your DAW hands-free with voice commands. Available in the DAW interface.
                </p>
                <Button onClick={() => navigate('/daw')}>
                  Open DAW
                </Button>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MixReadinessChecker />
              <ReferenceTrackComparison />
              <QualityControl />
            </div>
          </TabsContent>

          <TabsContent value="restoration" className="space-y-6">
            <AudioRestoration />
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <AutomationAssistant />
          </TabsContent>

          <TabsContent value="business" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BusinessAnalytics />
              <SocialMediaPostGenerator />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
