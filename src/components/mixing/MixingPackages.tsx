import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface MixingPaywallProps {
  onPurchaseComplete?: () => void;
}

export const MixingPackages: React.FC<MixingPaywallProps> = ({ onPurchaseComplete }) => {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Mixing Packages feature requires additional database configuration.
      </AlertDescription>
    </Alert>
  );
};