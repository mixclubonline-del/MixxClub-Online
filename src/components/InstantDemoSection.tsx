import { useState, useCallback } from 'react';
import { Upload, Sparkles, Music, CheckCircle, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useFlowNavigation } from '@/core/fabric/useFlow';

export const InstantDemoSection = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const { goToAuth } = useFlowNavigation();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    const validTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/flac'];
    
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid audio file (WAV, MP3, or FLAC)');
      return;
    }

    setUploadedFile(file.name);
    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      setIsProcessing(false);
      toast.success('Track analyzed! Preview your mastered version', {
        action: {
          label: 'Get Started',
          onClick: () => goToAuth('signup')
        }
      });
    }, 2500);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <section id="instant-demo" className="py-24 bg-gradient-to-b from-background via-primary/5 to-background relative overflow-hidden scroll-mt-20">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-studio border border-primary/30 mb-6">
              <Sparkles className="w-4 h-4 text-primary animate-pulse-glow" />
              <span className="text-sm font-semibold text-primary">100% FREE - NO SIGNUP REQUIRED</span>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Try AI Mastering Now
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload any track and hear the difference in seconds. Get instant before/after comparison with professional mastering.
            </p>
          </div>

          {/* Upload Area */}
          <div className="glass-studio rounded-3xl p-8 border-2 border-primary/30 hover:border-primary/50 transition-all duration-300 mb-8">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                isDragging 
                  ? 'border-primary bg-primary/10 scale-105' 
                  : 'border-muted-foreground/30 hover:border-primary/50'
              }`}
            >
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isProcessing}
              />

              {isProcessing ? (
                <div className="flex flex-col items-center gap-4 animate-fade-in">
                  <div className="relative">
                    <Sparkles className="w-16 h-16 text-primary animate-spin" />
                    <div className="absolute inset-0 blur-xl bg-primary/50 animate-pulse-glow" />
                  </div>
                  <div className="text-xl font-semibold text-primary">AI Processing Magic...</div>
                  <p className="text-sm text-muted-foreground">Analyzing {uploadedFile}</p>
                </div>
              ) : uploadedFile ? (
                <div className="flex flex-col items-center gap-4 animate-scale-in">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                  <div className="text-xl font-semibold">Ready to Preview!</div>
                  <p className="text-sm text-muted-foreground">{uploadedFile}</p>
                  <Button onClick={() => goToAuth('signup')} size="lg" className="shadow-glow">
                    <Zap className="w-5 h-5 mr-2" />
                    Get Full Master (Free)
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Music className="w-16 h-16 text-primary" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <Upload className="w-4 h-4 text-background" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xl font-semibold mb-2">Drop your audio file here</p>
                    <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                    <div className="inline-flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" /> WAV, MP3, FLAC
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" /> Up to 100MB
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" /> Instant Results
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 glass-studio rounded-xl border border-primary/20">
              <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Instant Results</h3>
              <p className="text-sm text-muted-foreground">Get your mastered preview in under 30 seconds</p>
            </div>
            <div className="text-center p-6 glass-studio rounded-xl border border-primary/20">
              <Music className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">A/B Comparison</h3>
              <p className="text-sm text-muted-foreground">Hear the before and after side by side</p>
            </div>
            <div className="text-center p-6 glass-studio rounded-xl border border-primary/20">
              <CheckCircle className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">100% Free Trial</h3>
              <p className="text-sm text-muted-foreground">No credit card, no signup required to try</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};