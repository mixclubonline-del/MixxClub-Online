import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, Upload, FileAudio } from "lucide-react";
import { useAIGeneration } from "@/hooks/useAIGeneration";

interface ReadinessCheck {
  category: string;
  status: "pass" | "warning" | "fail";
  message: string;
  suggestion?: string;
  priority?: string;
}

interface MixReadinessResult {
  score: number;
  checks: ReadinessCheck[];
  overallFeedback: string;
  metrics: {
    lufs: number;
    peak: number;
    stereoCorrelation: number;
    dynamicRange: number;
    frequencyBalance: {
      bass: number;
      mids: number;
      highs: number;
    };
  };
}

export const MixReadinessChecker = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<MixReadinessResult | null>(null);

  const { generate, isGenerating } = useAIGeneration<{ analysis: MixReadinessResult }>({
    functionName: 'analyze-mix-readiness',
    successMessage: 'Mix analysis complete!',
    errorMessage: 'Failed to analyze mix',
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
    }
  };

  const analyzeMix = async () => {
    if (!selectedFile) return;

    const data = await generate({
      audioUrl: URL.createObjectURL(selectedFile),
      fileName: selectedFile.name,
    });

    if (data?.analysis) {
      setResult(data.analysis);
    }
  };

  const getScoreGrade = (score: number) => {
    if (score >= 95) return { grade: 'A+', color: 'text-green-500' };
    if (score >= 85) return { grade: 'A', color: 'text-green-500' };
    if (score >= 75) return { grade: 'B', color: 'text-blue-500' };
    if (score >= 65) return { grade: 'C', color: 'text-yellow-500' };
    if (score >= 50) return { grade: 'D', color: 'text-orange-500' };
    return { grade: 'F', color: 'text-red-500' };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'fail': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  const { grade, color } = result ? getScoreGrade(result.score) : { grade: '', color: '' };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <FileAudio className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Mix Readiness Checker</h3>
      </div>

      {!result && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            {selectedFile ? (
              <div className="space-y-2">
                <FileAudio className="w-12 h-12 mx-auto text-primary" />
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  Upload your mix to analyze readiness for mastering
                </p>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="mix-upload"
                />
                <label htmlFor="mix-upload">
                  <Button variant="outline" asChild>
                    <span>Select Audio File</span>
                  </Button>
                </label>
              </>
            )}
          </div>

          {selectedFile && (
            <Button onClick={analyzeMix} disabled={isGenerating} className="w-full">
              {isGenerating ? "Analyzing Mix..." : "Analyze Mix Readiness"}
            </Button>
          )}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Score Display */}
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full border-8 border-primary/20 flex items-center justify-center">
                <span className={`text-4xl font-bold ${color}`}>{grade}</span>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <Badge variant="secondary">{result.score}/100</Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {result.overallFeedback}
            </p>
          </div>

          {/* Technical Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">LUFS</p>
              <p className="text-lg font-semibold">{result.metrics.lufs.toFixed(1)} dB</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Peak</p>
              <p className="text-lg font-semibold">{result.metrics.peak.toFixed(1)} dBFS</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Stereo</p>
              <p className="text-lg font-semibold">{result.metrics.stereoCorrelation.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Dynamic Range</p>
              <p className="text-lg font-semibold">{result.metrics.dynamicRange.toFixed(1)} dB</p>
            </div>
          </div>

          {/* Frequency Balance */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Frequency Balance</p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Bass</span>
                <span>{(result.metrics.frequencyBalance.bass * 100).toFixed(0)}%</span>
              </div>
              <Progress value={result.metrics.frequencyBalance.bass * 100} />
              <div className="flex justify-between text-xs">
                <span>Mids</span>
                <span>{(result.metrics.frequencyBalance.mids * 100).toFixed(0)}%</span>
              </div>
              <Progress value={result.metrics.frequencyBalance.mids * 100} />
              <div className="flex justify-between text-xs">
                <span>Highs</span>
                <span>{(result.metrics.frequencyBalance.highs * 100).toFixed(0)}%</span>
              </div>
              <Progress value={result.metrics.frequencyBalance.highs * 100} />
            </div>
          </div>

          {/* Checks */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Detailed Analysis</p>
            {result.checks.map((check, index) => (
              <div key={index} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(check.status)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{check.category}</p>
                    {check.priority && (
                      <Badge variant="outline" className="text-xs">
                        {check.priority}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{check.message}</p>
                  {check.suggestion && (
                    <p className="text-xs text-primary">{check.suggestion}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button onClick={() => { setResult(null); setSelectedFile(null); }} variant="outline" className="w-full">
            Analyze Another Mix
          </Button>
        </div>
      )}
    </Card>
  );
};
