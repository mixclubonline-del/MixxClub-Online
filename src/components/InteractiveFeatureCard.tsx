import { useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  isAI?: boolean;
}

export const InteractiveFeatureCard = ({ icon: Icon, title, description, isAI = false }: FeatureCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={cn(
        "relative px-4 py-3 rounded-full border transition-all duration-300 cursor-pointer group",
        isExpanded 
          ? "bg-card border-primary/40 shadow-lg scale-105" 
          : "bg-primary/10 border-primary/20 hover:border-primary/40 hover:scale-105"
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex items-center gap-2">
        <Icon className={cn("w-4 h-4", isAI ? "text-primary animate-pulse-glow" : "text-primary")} />
        <span className="text-sm font-medium text-foreground whitespace-nowrap">{title}</span>
      </div>
      
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-card border border-primary/20 rounded-lg shadow-xl z-10 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      )}
    </div>
  );
};
