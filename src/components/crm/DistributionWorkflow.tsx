import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Music, 
  Upload, 
  Calendar,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface DistributionWorkflowProps {
  projectId: string;
  projectTitle: string;
  audioFileUrl?: string;
}

export const DistributionWorkflow = ({ 
  projectId, 
  projectTitle, 
  audioFileUrl 
}: DistributionWorkflowProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"intro" | "metadata" | "confirm">("intro");

  if (step === "intro") {
    return (
      <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-primary to-accent-cyan rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <Badge variant="default" className="text-xs">NEW</Badge>
          </div>
          <CardTitle className="text-2xl">Ready to Release Your Music?</CardTitle>
          <CardDescription className="text-base">
            Your track is mixed and mastered! Now let's get it on Spotify, Apple Music, and 150+ streaming platforms worldwide.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold mb-1">1. Choose Distributor</p>
                <p className="text-sm text-muted-foreground">Connect with DistroKid, TuneCore, or CD Baby</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
              <div className="p-2 bg-accent-cyan/10 rounded-lg">
                <Music className="h-5 w-5 text-accent-cyan" />
              </div>
              <div>
                <p className="font-semibold mb-1">2. Add Metadata</p>
                <p className="text-sm text-muted-foreground">Track info, artwork, and release details</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
              <div className="p-2 bg-accent-green/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-accent-green" />
              </div>
              <div>
                <p className="font-semibold mb-1">3. Release</p>
                <p className="text-sm text-muted-foreground">Schedule and distribute worldwide</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              size="lg" 
              className="flex-1 gap-2"
              onClick={() => navigate("/distribution")}
            >
              Start Distribution
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/distribution")}
            >
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};
