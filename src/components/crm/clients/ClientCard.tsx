import React from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  Building2, 
  MoreVertical, 
  MessageSquare, 
  DollarSign,
  Calendar,
  Tag
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ClientCardProps {
  client: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    client_type: string;
    avatar_url: string | null;
    status: string | null;
    total_value: number | null;
    deals_count: number | null;
    notes_count: number | null;
    last_interaction_at: string | null;
    created_at: string;
  };
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  inactive: 'bg-muted text-muted-foreground border-border',
  prospect: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  vip: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const typeLabels: Record<string, string> = {
  artist: 'Artist',
  engineer: 'Engineer',
  label: 'Label',
  manager: 'Manager',
  other: 'Other',
};

export const ClientCard: React.FC<ClientCardProps> = ({
  client,
  onSelect,
  onEdit,
  onDelete,
  isSelected,
}) => {
  const initials = client.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      onClick={() => onSelect(client.id)}
      className={cn(
        'group relative p-4 rounded-xl border cursor-pointer transition-all',
        'bg-card hover:bg-accent/50',
        isSelected && 'ring-2 ring-primary border-primary'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-border">
            <AvatarImage src={client.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {client.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline" className="text-xs">
                {typeLabels[client.client_type] || client.client_type}
              </Badge>
              {client.status && (
                <Badge 
                  variant="outline" 
                  className={cn('text-xs', statusColors[client.status])}
                >
                  {client.status}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(client.id)}>
              Edit Client
            </DropdownMenuItem>
            <DropdownMenuItem>Send Message</DropdownMenuItem>
            <DropdownMenuItem>Add Note</DropdownMenuItem>
            <DropdownMenuItem>Create Deal</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => onDelete(client.id)}
            >
              Delete Client
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Contact Info */}
      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
        {client.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5" />
            <span className="truncate">{client.email}</span>
          </div>
        )}
        {client.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5" />
            <span>{client.phone}</span>
          </div>
        )}
        {client.company && (
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5" />
            <span>{client.company}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          {client.total_value !== null && client.total_value > 0 && (
            <div className="flex items-center gap-1 text-emerald-400">
              <DollarSign className="h-3.5 w-3.5" />
              <span>${client.total_value.toLocaleString()}</span>
            </div>
          )}
          {client.deals_count !== null && client.deals_count > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Tag className="h-3.5 w-3.5" />
              <span>{client.deals_count} deals</span>
            </div>
          )}
          {client.notes_count !== null && client.notes_count > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{client.notes_count}</span>
            </div>
          )}
        </div>
        {client.last_interaction_at && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDistanceToNow(new Date(client.last_interaction_at), { addSuffix: true })}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
