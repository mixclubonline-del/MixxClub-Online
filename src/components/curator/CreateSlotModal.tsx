import { useState } from 'react';
import { useCuratorSlots } from '@/hooks/useCuratorSlots';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Coins, Crown, Sparkles } from 'lucide-react';

interface CreateSlotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const CreateSlotModal = ({ open, onOpenChange }: CreateSlotModalProps) => {
  const { createSlot, isCreating } = useCuratorSlots();
  const [formData, setFormData] = useState({
    slot_name: '',
    description: '',
    price_coinz: 100,
    slot_type: 'standard' as 'standard' | 'featured' | 'exclusive',
    time_window: '',
    available_days: [] as string[],
  });

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      available_days: prev.available_days.includes(day)
        ? prev.available_days.filter(d => d !== day)
        : [...prev.available_days, day],
    }));
  };

  const handleSubmit = async () => {
    await createSlot(formData);
    onOpenChange(false);
    setFormData({
      slot_name: '',
      description: '',
      price_coinz: 100,
      slot_type: 'standard',
      time_window: '',
      available_days: [],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Create Premiere Slot
          </DialogTitle>
          <DialogDescription>
            Set up a new time slot for artists to book premieres
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="slot_name">Slot Name</Label>
            <Input
              id="slot_name"
              placeholder="Friday Night Premiere, Weekend Feature, etc."
              value={formData.slot_name}
              onChange={(e) => setFormData(prev => ({ ...prev, slot_name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe what makes this slot special..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price_coinz">Price (MixxCoinz)</Label>
              <div className="relative">
                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                <Input
                  id="price_coinz"
                  type="number"
                  min={10}
                  className="pl-10"
                  value={formData.price_coinz}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    price_coinz: parseInt(e.target.value) || 100 
                  }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Slot Type</Label>
              <Select
                value={formData.slot_type}
                onValueChange={(value: 'standard' | 'featured' | 'exclusive') => 
                  setFormData(prev => ({ ...prev, slot_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Standard
                    </div>
                  </SelectItem>
                  <SelectItem value="featured">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      Featured
                    </div>
                  </SelectItem>
                  <SelectItem value="exclusive">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-400" />
                      Exclusive
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time_window">Time Window (optional)</Label>
            <Input
              id="time_window"
              placeholder="e.g., 8PM-10PM EST"
              value={formData.time_window}
              onChange={(e) => setFormData(prev => ({ ...prev, time_window: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Available Days</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <Badge
                  key={day}
                  variant={formData.available_days.includes(day) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleDay(day)}
                >
                  {day.slice(0, 3)}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!formData.slot_name.trim() || formData.price_coinz < 10 || isCreating}
            className="flex-1"
          >
            {isCreating ? 'Creating...' : 'Create Slot'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
