import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Activity, Gauge, Sparkles } from "lucide-react";

interface AudioAnalysisResult {
  bpm: number;
  timeSignature: string;
  keySignature: string;
  genre: string;
  confidence: number;
  audioQuality: string;
  duration: number;
  instruments: string[];
  rhythmPattern: string;
  recommendations: {
    sessionBpm: number;
    sessionTimeSignature: string;
    suggestedEffects: string[];
  };
}

interface AudioAnalysisPanelProps {
  analysis: AudioAnalysisResult;
  trackName: string;
}

export function AudioAnalysisPanel({ analysis, trackName }: AudioAnalysisPanelProps) {
  const confidenceColor = analysis.confidence >= 0.8 ? "bg-green-500" : 
                          analysis.confidence >= 0.6 ? "bg-yellow-500" : "bg-red-500";

  return (
    <Card className="glass border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Analysis: {trackName}
        </CardTitle>
        <CardDescription>
          Confidence: 
          <Badge className={`ml-2 ${confidenceColor}`}>
            {Math.round(analysis.confidence * 100)}%
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Tempo</p>
              <p className="font-semibold">{analysis.bpm} BPM</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Key</p>
              <p className="font-semibold">{analysis.keySignature}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Time</p>
              <p className="font-semibold">{analysis.timeSignature}</p>
            </div>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground">Genre</p>
            <Badge variant="outline">{analysis.genre}</Badge>
          </div>
        </div>

        {analysis.instruments && analysis.instruments.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Detected Instruments</p>
            <div className="flex flex-wrap gap-1">
              {analysis.instruments.map((instrument, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {instrument}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-xs text-muted-foreground mb-2">AI Recommendations</p>
          <div className="space-y-1 text-sm">
            <p>• Session BPM: {analysis.recommendations.sessionBpm}</p>
            <p>• Time Signature: {analysis.recommendations.sessionTimeSignature}</p>
            {analysis.recommendations.suggestedEffects.length > 0 && (
              <p>• Effects: {analysis.recommendations.suggestedEffects.join(", ")}</p>
            )}
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">Quality: {analysis.audioQuality}</p>
          <p className="text-xs text-muted-foreground">Duration: {Math.round(analysis.duration)}s</p>
        </div>
      </CardContent>
    </Card>
  );
}
