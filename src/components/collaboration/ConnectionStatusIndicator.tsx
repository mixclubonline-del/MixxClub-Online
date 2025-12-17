import React from 'react';
import { Wifi, WifiOff, RefreshCw, Signal, SignalLow, SignalMedium, SignalHigh } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ConnectionStatusIndicatorProps {
  isConnected: boolean;
  isReconnecting: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  reconnectAttempts: number;
  maxAttempts: number;
  onReconnect: () => void;
}

export const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
  isConnected,
  isReconnecting,
  connectionQuality,
  reconnectAttempts,
  maxAttempts,
  onReconnect
}) => {
  const getQualityIcon = () => {
    switch (connectionQuality) {
      case 'excellent':
        return <SignalHigh className="h-4 w-4" />;
      case 'good':
        return <SignalMedium className="h-4 w-4" />;
      case 'poor':
        return <SignalLow className="h-4 w-4" />;
      default:
        return <Signal className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    if (!isConnected) return 'text-destructive';
    switch (connectionQuality) {
      case 'excellent':
        return 'text-green-500';
      case 'good':
        return 'text-yellow-500';
      case 'poor':
        return 'text-orange-500';
      default:
        return 'text-destructive';
    }
  };

  const getStatusText = () => {
    if (isReconnecting) return `Reconnecting... (${reconnectAttempts}/${maxAttempts})`;
    if (!isConnected) return 'Disconnected';
    switch (connectionQuality) {
      case 'excellent':
        return 'Excellent connection';
      case 'good':
        return 'Good connection';
      case 'poor':
        return 'Poor connection';
      default:
        return 'Unknown';
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
              isConnected 
                ? "bg-green-500/10 border border-green-500/20" 
                : "bg-destructive/10 border border-destructive/20"
            )}>
              {isReconnecting ? (
                <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
              ) : isConnected ? (
                <Wifi className={cn("h-3 w-3", getStatusColor())} />
              ) : (
                <WifiOff className="h-3 w-3 text-destructive" />
              )}
              <span className={getStatusColor()}>
                {isConnected ? getQualityIcon() : null}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getStatusText()}</p>
          </TooltipContent>
        </Tooltip>

        {!isConnected && !isReconnecting && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReconnect}
            className="h-7 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reconnect
          </Button>
        )}
      </div>
    </TooltipProvider>
  );
};
