import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Music,
  BarChart3,
  Waves,
  Target,
  Upload
} from "lucide-react";
import { toast } from "sonner";

interface MasteringSubscription {
  mastering_packages: {
    name: string;
    track_limit: number;
  };
  tracks_used: number;
}

interface AIMasteringServiceProps {
  subscription: MasteringSubscription | null;
}

export const AIMasteringService = ({ subscription }: AIMasteringServiceProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("spotify");
  const [masteringProgress, setMasteringProgress] = useState(0);

  const platforms = [
    { id: "spotify", name: "Spotify", lufs: "-14 LUFS", description: "Optimized for streaming" },
    { id: "apple", name: "Apple Music", lufs: "-16 LUFS", description: "Hi-res audio ready" },
    { id: "youtube", name: "YouTube", lufs: "-13 LUFS", description: "Video platform optimized" },
    { id: "soundcloud", name: "SoundCloud", lufs: "-12 LUFS", description: "Independent artist focus" },
    { id: "tidal", name: "TIDAL", lufs: "-14 LUFS", description: "HiFi & MQA compatible" },
    { id: "cd", name: "CD Master", lufs: "-9 LUFS", description: "Physical release standard" }
  ];

  const analysisData = [
    { label: "Dynamic Range", value: "12.3 LU", status: "good" },
    { label: "Peak Level", value: "-0.1 dBFS", status: "optimal" },
    { label: "RMS Level", value: "-12.5 dBFS", status: "good" },
    { label: "Stereo Width", value: "85%", status: "optimal" },
    { label: "Phase Correlation", value: "+0.92", status: "good" },
    { label: "THD+N", value: "0.003%", status: "optimal" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "optimal": return "text-green-500";
      case "good": return "text-blue-500";
      case "warning": return "text-yellow-500";
      default: return "text-muted-foreground";
    }
  };

  const handleStartMastering = () => {
    setIsProcessing(true);
    setMasteringProgress(0);
    
    const interval = setInterval(() => {
      setMasteringProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          toast.success('Mastering complete! Track processed successfully.');
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* Subscription Status */}
      {subscription && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="text-center">
              <Badge className="mb-2">{subscription.mastering_packages.name} Plan</Badge>
              <p className="text-sm text-muted-foreground">
                {subscription.mastering_packages.track_limit === -1 
                  ? 'Unlimited tracks' 
                  : `${subscription.tracks_used}/${subscription.mastering_packages.track_limit} tracks used`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Your Track
          </CardTitle>
          <CardDescription>
            Upload a WAV or AIFF file for professional AI mastering
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop your audio file here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Supports WAV, AIFF up to 100MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Mastering Interface */}
      <Tabs defaultValue="platforms" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platforms.map((platform) => (
              <Card 
                key={platform.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedPlatform === platform.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedPlatform(platform.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{platform.name}</CardTitle>
                    <Badge variant="secondary">{platform.lufs}</Badge>
                  </div>
                  <CardDescription>{platform.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant={selectedPlatform === platform.id ? "default" : "outline"} 
                    className="w-full"
                  >
                    {selectedPlatform === platform.id ? "Selected" : "Optimize For"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Audio Analysis
              </CardTitle>
              <CardDescription>
                Real-time analysis of your track's technical characteristics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analysisData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className={`text-sm font-mono ${getStatusColor(item.status)}`}>
                        {item.value}
                      </span>
                    </div>
                    <Progress 
                      value={Math.random() * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Waves className="w-5 h-5" />
                AI Mastering Engine
              </CardTitle>
              <CardDescription>
                Neural processing with real-time preview
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing...</span>
                    <span>{masteringProgress}%</span>
                  </div>
                  <Progress value={masteringProgress} className="h-2" />
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Loudness Target</label>
                  <Slider defaultValue={[-14]} min={-23} max={-6} step={0.1} />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>-23 LUFS</span>
                    <span>-6 LUFS</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Dynamic Range</label>
                  <Slider defaultValue={[12]} min={6} max={20} step={0.1} />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>6 LU</span>
                    <span>20 LU</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Stereo Enhancement</label>
                  <Slider defaultValue={[85]} min={0} max={100} step={1} />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Mono</span>
                    <span>Wide</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  className="flex-1 gap-2" 
                  onClick={handleStartMastering}
                  disabled={isProcessing}
                >
                  <Music className="w-4 h-4" />
                  {isProcessing ? "Processing..." : "Master Track"}
                </Button>
                <Button variant="outline" className="gap-2">
                  <Play className="w-4 h-4" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
