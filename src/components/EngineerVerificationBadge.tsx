import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, Award } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EngineerVerificationBadgeProps {
  verified?: boolean;
  experience?: string;
  completedProjects?: number;
  rating?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const EngineerVerificationBadge = ({
  verified = false,
  experience,
  completedProjects = 0,
  rating = 0,
  size = 'md'
}: EngineerVerificationBadgeProps) => {
  const badgeSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }[size];

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }[size];

  if (!verified) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-2">
        <Tooltip>
          <TooltipTrigger>
            <Badge className={`${badgeSize} bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 hover:bg-green-500/20 flex items-center gap-1`}>
              <Shield className={iconSize} />
              Verified Engineer
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">Identity & Skills Verified</p>
            <p className="text-xs text-muted-foreground">
              Background checked and portfolio reviewed
            </p>
          </TooltipContent>
        </Tooltip>

        {experience && (
          <Tooltip>
            <TooltipTrigger>
              <Badge className={`${badgeSize} bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 flex items-center gap-1`}>
                <Award className={iconSize} />
                {experience}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Years of professional experience</p>
            </TooltipContent>
          </Tooltip>
        )}

        {completedProjects > 50 && (
          <Tooltip>
            <TooltipTrigger>
              <Badge className={`${badgeSize} bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20 flex items-center gap-1`}>
                <CheckCircle className={iconSize} />
                {completedProjects}+ Projects
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Successfully completed projects on Mixxclub</p>
            </TooltipContent>
          </Tooltip>
        )}

        {rating >= 4.8 && (
          <Tooltip>
            <TooltipTrigger>
              <Badge className={`${badgeSize} bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20 flex items-center gap-1`}>
                ⭐ {rating.toFixed(1)}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Top-rated engineer</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};
