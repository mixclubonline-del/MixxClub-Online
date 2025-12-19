import React from 'react';
import { Crown, Edit, Eye, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SessionRole, SessionPermissions } from '@/hooks/useSessionPermissions';
import { cn } from '@/lib/utils';

interface PermissionsBadgeProps {
  role: SessionRole;
  permissions: SessionPermissions;
  showDetails?: boolean;
}

const roleStyles: Record<SessionRole, { icon: React.ElementType; bg: string; text: string }> = {
  host: { icon: Crown, bg: 'bg-yellow-500/10 border-yellow-500/20', text: 'text-yellow-500' },
  editor: { icon: Edit, bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-500' },
  viewer: { icon: Eye, bg: 'bg-muted border-border', text: 'text-muted-foreground' },
};

export const PermissionsBadge: React.FC<PermissionsBadgeProps> = ({
  role,
  permissions,
  showDetails = false,
}) => {
  const style = roleStyles[role];
  const Icon = style.icon;

  const permissionsList = [
    { key: 'canEditTracks', label: 'Edit tracks' },
    { key: 'canAddTracks', label: 'Add tracks' },
    { key: 'canDeleteTracks', label: 'Delete tracks' },
    { key: 'canEditEffects', label: 'Edit effects' },
    { key: 'canLockTracks', label: 'Lock tracks' },
    { key: 'canExport', label: 'Export project' },
    { key: 'canInvite', label: 'Invite users' },
    { key: 'canKick', label: 'Remove users' },
    { key: 'canChangeRoles', label: 'Change roles' },
  ];

  const activePermissions = permissionsList.filter(
    (p) => permissions[p.key as keyof SessionPermissions]
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              'gap-1.5 cursor-default',
              style.bg,
              style.text
            )}
          >
            <Icon className="h-3 w-3" />
            <span className="capitalize">{role}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="w-48">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-medium">
              <Shield className="h-3.5 w-3.5" />
              <span>Your Permissions</span>
            </div>
            <div className="space-y-1">
              {activePermissions.map((p) => (
                <div
                  key={p.key}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <div className="h-1 w-1 rounded-full bg-green-500" />
                  <span>{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
