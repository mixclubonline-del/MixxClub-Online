import { Shield, Lock, Award, Check } from 'lucide-react';

export const TrustBadges = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 py-4">
      <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
        <Shield className="w-4 h-4 text-green-500" />
        <span className="text-xs font-medium text-green-700 dark:text-green-400">256-bit SSL Secure</span>
      </div>
      
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <Lock className="w-4 h-4 text-blue-500" />
        <span className="text-xs font-medium text-blue-700 dark:text-blue-400">PCI Compliant</span>
      </div>
      
      <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg">
        <Award className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium text-primary">Verified Engineers</span>
      </div>
      
      <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
        <Check className="w-4 h-4 text-purple-500" />
        <span className="text-xs font-medium text-purple-700 dark:text-purple-400">100% Money-Back</span>
      </div>
    </div>
  );
};
