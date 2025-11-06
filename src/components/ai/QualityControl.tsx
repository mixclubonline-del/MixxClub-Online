import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Upload, AlertCircle, Download } from "lucide-react";
import { useAIGeneration } from "@/hooks/useAIGeneration";
import { toast } from "sonner";

export const QualityControl = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const { generate, isGenerating, data } = useAIGeneration<{
    overallScore: number;
    checks: {
      mixReadiness: { score: number; issues: string[] };
      platformCompliance: { 
        spotify: boolean; 
        appleMusic: boolean; 
        youtube: boolean;
        issues: string[];
      };
      phaseIssues: { detected: boolean; locations: number[] };
      clipping: { detected: boolean; locations: number[] };
      lufs: { value: number; target: number; compliant: boolean };
    };
    recommendations: string[];
    report: string;
  }>({
    functionName: 'quality-control',
    successMessage: 'Quality check complete!',
    errorMessage: 'Failed to analyze quality',
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        toast.error('Please upload an audio file');
        return;
      }
      setAudioFile(file);
    }
  };

  const handleAnalyze = async () => {
    if (!audioFile) {
      toast.error('Please upload an audio file first');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const audioData = e.target?.result as string;
      
      await generate({
        audioData,
        platforms: ['spotify', 'appleMusic', 'youtube'],
      });
    };
    reader.readAsDataURL(audioFile);
  };

  const downloadReport = () => {
    if (data?.report) {
      const blob = new Blob([data.report], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'quality-control-report.pdf';
      link.click();
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Quality Control Dashboard</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Upload Master</label>
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
              id="qc-upload"
            />
            <label htmlFor="qc-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {audioFile ? audioFile.name : 'Click to upload audio file'}
              </p>
            </label>
          </div>
        </div>

        <Button 
          onClick={handleAnalyze} 
          disabled={isGenerating || !audioFile}
          className="w-full"
        >
          {isGenerating ? 'Analyzing...' : 'Run Quality Check'}
        </Button>

        {data && (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium">Overall Quality Score</p>
                <span className="text-2xl font-bold">{data.overallScore}/100</span>
              </div>
              <Progress value={data.overallScore} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">Mix Readiness</p>
                <div className="flex items-center gap-2">
                  {data.checks.mixReadiness.score >= 80 ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  )}
                  <span className="text-lg font-semibold">
                    {data.checks.mixReadiness.score}/100
                  </span>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">LUFS Compliance</p>
                <div className="flex items-center gap-2">
                  {data.checks.lufs.compliant ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="text-sm">
                    {data.checks.lufs.value} LUFS
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-3">Platform Compliance</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant={data.checks.platformCompliance.spotify ? "default" : "destructive"}>
                  Spotify {data.checks.platformCompliance.spotify ? '✓' : '✗'}
                </Badge>
                <Badge variant={data.checks.platformCompliance.appleMusic ? "default" : "destructive"}>
                  Apple Music {data.checks.platformCompliance.appleMusic ? '✓' : '✗'}
                </Badge>
                <Badge variant={data.checks.platformCompliance.youtube ? "default" : "destructive"}>
                  YouTube {data.checks.platformCompliance.youtube ? '✓' : '✗'}
                </Badge>
              </div>
            </div>

            {data.checks.phaseIssues.detected && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  <p className="text-sm font-medium">Phase Cancellation Detected</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Found at {data.checks.phaseIssues.locations.length} location(s)
                </p>
              </div>
            )}

            {data.checks.clipping.detected && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-sm font-medium">Clipping Detected</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Found at {data.checks.clipping.locations.length} location(s)
                </p>
              </div>
            )}

            {data.recommendations.length > 0 && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-3">Recommendations</p>
                <ul className="space-y-2">
                  {data.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button onClick={downloadReport} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download PDF Report
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
