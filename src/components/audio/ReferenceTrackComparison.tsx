import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileAudio, ArrowRightLeft, TrendingUp, TrendingDown } from "lucide-react";
import { useAIGeneration } from "@/hooks/useAIGeneration";
import { AudioComparison } from "./AudioComparison";

interface ComparisonSuggestion {
  action: string;
  priority: "high" | "medium" | "low";
  reason: string;
}

interface ComparisonResult {
  suggestions: ComparisonSuggestion[];
  summary: string;
  userMix: {
    lufs: number;
    peak: number;
    stereoWidth: number;
    dynamicRange: number;
  };
  referenceMix: {
    lufs: number;
    peak: number;
    stereoWidth: number;
    dynamicRange: number;
  };
  deltas: {
    lufs: number;
    peak: number;
    stereoWidth: number;
    dynamicRange: number;
  };
}

export const ReferenceTrackComparison = () => {
  const [userTrack, setUserTrack] = useState<File | null>(null);
  const [referenceTrack, setReferenceTrack] = useState<File | null>(null);
  const [result, setResult] = useState<ComparisonResult | null>(null);

  const { generate, isGenerating } = useAIGeneration<{ comparison: ComparisonResult }>({
    functionName: 'compare-reference-track',
    successMessage: 'Comparison complete!',
    errorMessage: 'Failed to compare tracks',
  });

  const handleUserTrackSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUserTrack(file);
      setResult(null);
    }
  };

  const handleReferenceTrackSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReferenceTrack(file);
      setResult(null);
    }
  };

  const compareTracks = async () => {
    if (!userTrack || !referenceTrack) return;

    const data = await generate({
      userTrackUrl: URL.createObjectURL(userTrack),
      referenceTrackUrl: URL.createObjectURL(referenceTrack),
      userTrackName: userTrack.name,
      referenceTrackName: referenceTrack.name,
    });

    if (data?.comparison) {
      setResult(data.comparison);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const DeltaIndicator = ({ value, unit }: { value: number; unit: string }) => {
    const isPositive = value > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const color = Math.abs(value) < 0.5 ? 'text-green-500' : 'text-yellow-500';
    
    return (
      <div className={`flex items-center gap-1 ${color}`}>
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">
          {isPositive ? '+' : ''}{value.toFixed(1)}{unit}
        </span>
      </div>
    );
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <ArrowRightLeft className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Reference Track Comparison</h3>
      </div>

      {!result && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Your Mix */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Mix</label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                {userTrack ? (
                  <div className="space-y-2">
                    <FileAudio className="w-10 h-10 mx-auto text-primary" />
                    <p className="font-medium text-sm">{userTrack.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(userTrack.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleUserTrackSelect}
                      className="hidden"
                      id="user-track-upload"
                    />
                    <label htmlFor="user-track-upload">
                      <Button variant="outline" size="sm" asChild>
                        <span>Upload Your Mix</span>
                      </Button>
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* Reference Track */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Reference Track</label>
              <div className="border-2 border-dashed border-primary/50 rounded-lg p-6 text-center">
                {referenceTrack ? (
                  <div className="space-y-2">
                    <FileAudio className="w-10 h-10 mx-auto text-primary" />
                    <p className="font-medium text-sm">{referenceTrack.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(referenceTrack.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleReferenceTrackSelect}
                      className="hidden"
                      id="reference-track-upload"
                    />
                    <label htmlFor="reference-track-upload">
                      <Button variant="outline" size="sm" asChild>
                        <span>Upload Reference</span>
                      </Button>
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>

          {userTrack && referenceTrack && (
            <>
              <AudioComparison
                audioFileA={URL.createObjectURL(userTrack)}
                audioFileB={URL.createObjectURL(referenceTrack)}
                titleA="Your Mix"
                titleB="Reference"
              />
              
              <Button onClick={compareTracks} disabled={isGenerating} className="w-full">
                {isGenerating ? "Analyzing Tracks..." : "Compare & Get AI Suggestions"}
              </Button>
            </>
          )}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm">{result.summary}</p>
          </div>

          {/* Metrics Comparison */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">LUFS</p>
              <div className="flex items-center justify-between">
                <span className="text-sm">{result.userMix.lufs.toFixed(1)} dB</span>
                <DeltaIndicator value={result.deltas.lufs} unit=" dB" />
              </div>
              <p className="text-xs text-muted-foreground">Target: {result.referenceMix.lufs.toFixed(1)} dB</p>
            </div>

            <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Peak</p>
              <div className="flex items-center justify-between">
                <span className="text-sm">{result.userMix.peak.toFixed(1)} dB</span>
                <DeltaIndicator value={result.deltas.peak} unit=" dB" />
              </div>
              <p className="text-xs text-muted-foreground">Target: {result.referenceMix.peak.toFixed(1)} dB</p>
            </div>

            <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Stereo Width</p>
              <div className="flex items-center justify-between">
                <span className="text-sm">{result.userMix.stereoWidth}%</span>
                <DeltaIndicator value={result.deltas.stereoWidth} unit="%" />
              </div>
              <p className="text-xs text-muted-foreground">Target: {result.referenceMix.stereoWidth}%</p>
            </div>

            <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Dynamic Range</p>
              <div className="flex items-center justify-between">
                <span className="text-sm">{result.userMix.dynamicRange.toFixed(1)} dB</span>
                <DeltaIndicator value={result.deltas.dynamicRange} unit=" dB" />
              </div>
              <p className="text-xs text-muted-foreground">Target: {result.referenceMix.dynamicRange.toFixed(1)} dB</p>
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="space-y-3">
            <p className="text-sm font-medium">AI Mixing Suggestions</p>
            {result.suggestions.map((suggestion, index) => (
              <div key={index} className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm flex-1">{suggestion.action}</p>
                  <Badge variant="outline" className={getPriorityColor(suggestion.priority)}>
                    {suggestion.priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
              </div>
            ))}
          </div>

          <Button 
            onClick={() => { setResult(null); setUserTrack(null); setReferenceTrack(null); }} 
            variant="outline" 
            className="w-full"
          >
            Compare New Tracks
          </Button>
        </div>
      )}
    </Card>
  );
};
