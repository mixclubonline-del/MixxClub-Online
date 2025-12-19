import React from 'react';
import { Crown, Edit, Eye } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SessionRole } from '@/hooks/useSessionPermissions';

interface RoleSelectorProps {
  currentRole: SessionRole;
  onRoleChange: (role: SessionRole) => void;
  disabled?: boolean;
  isHost?: boolean;
}

const roleConfig = {
  host: { label: 'Host', icon: Crown, color: 'text-yellow-500' },
  editor: { label: 'Editor', icon: Edit, color: 'text-blue-500' },
  viewer: { label: 'Viewer', icon: Eye, color: 'text-muted-foreground' },
};

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  currentRole,
  onRoleChange,
  disabled = false,
  isHost = false,
}) => {
  const config = roleConfig[currentRole];
  const Icon = config.icon;

  if (isHost) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-yellow-500/10 border border-yellow-500/20">
        <Crown className="h-3.5 w-3.5 text-yellow-500" />
        <span className="text-xs font-medium text-yellow-500">Host</span>
      </div>
    );
  }

  return (
    <Select
      value={currentRole}
      onValueChange={(value) => onRoleChange(value as SessionRole)}
      disabled={disabled}
    >
      <SelectTrigger className="h-7 w-24 text-xs">
        <SelectValue>
          <div className="flex items-center gap-1.5">
            <Icon className={`h-3 w-3 ${config.color}`} />
            <span>{config.label}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="editor">
          <div className="flex items-center gap-2">
            <Edit className="h-3.5 w-3.5 text-blue-500" />
            <span>Editor</span>
          </div>
        </SelectItem>
        <SelectItem value="viewer">
          <div className="flex items-center gap-2">
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Viewer</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
