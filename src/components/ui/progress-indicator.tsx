import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, Upload, Brain, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  description?: string;
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStep?: number;
  progress?: number;
  className?: string;
}

export const ProgressIndicator = ({ 
  steps, 
  currentStep, 
  progress = 0, 
  className 
}: ProgressIndicatorProps) => {
  const getStepIcon = (step: ProgressStep, index: number) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-primary" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'active':
        if (step.id.includes('upload')) return <Upload className="w-5 h-5 text-primary animate-pulse" />;
        if (step.id.includes('ai') || step.id.includes('analysis')) return <Brain className="w-5 h-5 text-primary animate-pulse" />;
        return <Clock className="w-5 h-5 text-primary animate-spin" />;
      default:
        return <div className="w-5 h-5 rounded-full bg-muted border-2 border-muted-foreground" />;
    }
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Overall Progress Bar */}
      {progress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="text-primary font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Step Indicators */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
              step.status === 'active' && "border-primary/50 bg-primary/5",
              step.status === 'completed' && "border-primary/30 bg-primary/10",
              step.status === 'error' && "border-destructive/50 bg-destructive/5",
              step.status === 'pending' && "border-muted bg-muted/30"
            )}
          >
            <div className="flex-shrink-0">
              {getStepIcon(step, index)}
            </div>
            <div className="flex-1 min-w-0">
              <div className={cn(
                "font-medium text-sm",
                step.status === 'completed' && "text-primary",
                step.status === 'error' && "text-destructive",
                step.status === 'active' && "text-foreground",
                step.status === 'pending' && "text-muted-foreground"
              )}>
                {step.label}
              </div>
              {step.description && (
                <div className="text-xs text-muted-foreground mt-1">
                  {step.description}
                </div>
              )}
            </div>
            {step.status === 'active' && (
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};