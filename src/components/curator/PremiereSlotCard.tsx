import { useCuratorSlots, CuratorSlot } from '@/hooks/useCuratorSlots';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Calendar, 
  Coins, 
  Clock,
  Crown,
  Sparkles,
  Trash2,
  Edit
} from 'lucide-react';

interface PremiereSlotCardProps {
  slot: CuratorSlot;
  onEdit?: (slot: CuratorSlot) => void;
}

export const PremiereSlotCard = ({ slot, onEdit }: PremiereSlotCardProps) => {
  const { toggleSlot, deleteSlot, isDeleting } = useCuratorSlots();

  const typeIcons = {
    standard: Calendar,
    featured: Sparkles,
    exclusive: Crown,
  };

  const typeColors = {
    standard: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    featured: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    exclusive: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  };

  const TypeIcon = typeIcons[slot.slot_type] || Calendar;

  return (
    <Card variant="glass" className={`relative overflow-hidden ${!slot.is_active ? 'opacity-60' : ''}`}>
      {/* Type Banner */}
      <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-medium rounded-bl-lg ${typeColors[slot.slot_type]}`}>
        <TypeIcon className="w-3 h-3 inline mr-1" />
        {slot.slot_type}
      </div>

      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">{slot.slot_name}</h3>
              {slot.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {slot.description}
                </p>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-amber-500/20 text-amber-400">
              <Coins className="w-3 h-3 mr-1" />
              {slot.price_coinz} coinz
            </Badge>
            {slot.time_window && (
              <Badge variant="outline">
                <Clock className="w-3 h-3 mr-1" />
                {slot.time_window}
              </Badge>
            )}
          </div>

          {/* Available Days */}
          {slot.available_days.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {slot.available_days.map((day) => (
                <span 
                  key={day} 
                  className="text-xs px-2 py-0.5 rounded bg-muted"
                >
                  {day}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Switch
                checked={slot.is_active}
                onCheckedChange={(checked) => toggleSlot({ id: slot.id, isActive: checked })}
              />
              <span className="text-xs text-muted-foreground">
                {slot.is_active ? 'Active' : 'Paused'}
              </span>
            </div>
            <div className="flex gap-1">
              {onEdit && (
                <Button size="icon" variant="ghost" onClick={() => onEdit(slot)}>
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => deleteSlot(slot.id)}
                disabled={isDeleting}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
