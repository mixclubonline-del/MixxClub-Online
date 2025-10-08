import { Loader2, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface LoadingStateProps {
  status: 'idle' | 'uploading' | 'processing' | 'analyzing' | 'complete' | 'error';
  progress?: number;
  message?: string;
  error?: string;
}

export function LoadingState({ status, progress = 0, message, error }: LoadingStateProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'uploading':
        return {
          icon: Upload,
          title: 'Uploading Stems',
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
        };
      case 'processing':
        return {
          icon: Loader2,
          title: 'Creating Session',
          color: 'text-purple-500',
          bgColor: 'bg-purple-500/10',
        };
      case 'analyzing':
        return {
          icon: Loader2,
          title: 'AI Analysis in Progress',
          color: 'text-orange-500',
          bgColor: 'bg-orange-500/10',
        };
      case 'complete':
        return {
          icon: CheckCircle2,
          title: 'Complete',
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
        };
      case 'error':
        return {
          icon: AlertCircle,
          title: 'Error',
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
        };
      default:
        return null;
    }
  };

  if (status === 'idle') return null;

  const config = getStatusConfig();
  if (!config) return null;

  const Icon = config.icon;
  const shouldSpin = status === 'uploading' || status === 'processing' || status === 'analyzing';

  return (
    <div className={`rounded-lg border p-6 ${config.bgColor}`}>
      <div className="flex items-start gap-4">
        <div className={`rounded-full p-2 ${config.bgColor}`}>
          <Icon className={`h-6 w-6 ${config.color} ${shouldSpin ? 'animate-spin' : ''}`} />
        </div>
        
        <div className="flex-1 space-y-3">
          <div>
            <h3 className={`font-semibold ${config.color}`}>{config.title}</h3>
            {message && (
              <p className="text-sm text-muted-foreground mt-1">{message}</p>
            )}
            {error && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
          </div>

          {status !== 'complete' && status !== 'error' && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">{progress}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface StepIndicatorProps {
  steps: Array<{
    id: string;
    label: string;
    status: 'pending' | 'active' | 'complete' | 'error';
  }>;
}

export function StepIndicator({ steps }: StepIndicatorProps) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        
        return (
          <div key={step.id} className="relative">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  step.status === 'complete'
                    ? 'border-green-500 bg-green-500 text-white'
                    : step.status === 'active'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                    : step.status === 'error'
                    ? 'border-red-500 bg-red-500/10 text-red-500'
                    : 'border-muted bg-background text-muted-foreground'
                }`}
              >
                {step.status === 'complete' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : step.status === 'active' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : step.status === 'error' ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <span className="text-sm">{index + 1}</span>
                )}
              </div>
              
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    step.status === 'complete'
                      ? 'text-green-500'
                      : step.status === 'active'
                      ? 'text-blue-500'
                      : step.status === 'error'
                      ? 'text-red-500'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </p>
              </div>
            </div>
            
            {!isLast && (
              <div
                className={`ml-4 mt-2 h-6 w-0.5 ${
                  step.status === 'complete' ? 'bg-green-500' : 'bg-muted'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface UploadProgressProps {
  fileName: string;
  progress: number;
  size: number;
}

export function UploadProgress({ fileName, progress, size }: UploadProgressProps) {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="truncate font-medium">{fileName}</span>
        <span className="text-muted-foreground">{formatSize(size)}</span>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{progress}% uploaded</span>
        <span>{formatSize((size * progress) / 100)} / {formatSize(size)}</span>
      </div>
    </div>
  );
}
