import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  connectionType?: 'realtime' | 'websocket' | 'presence';
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  isConnected, 
  connectionType = 'realtime' 
}) => {
  if (isConnected) {
    return (
      <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-500 border-green-500/20">
        <Wifi className="w-3 h-3" />
        <span className="text-xs">Connected</span>
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1 bg-red-500/10 text-red-500 border-red-500/20">
      <WifiOff className="w-3 h-3" />
      <span className="text-xs">Disconnected</span>
    </Badge>
  );
};
