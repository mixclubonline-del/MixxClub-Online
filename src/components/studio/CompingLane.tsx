import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Layers, Plus, Check, Eye, EyeOff, Disc, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AudioRegion } from '@/stores/aiStudioStore';

interface Take {
  id: string;
  name: string;
  regions: AudioRegion[];
  color: string;
  active: boolean;
  visible: boolean;
}

interface CompingLaneProps {
  trackId: string;
  trackName: string;
  takes: Take[];
  onAddTake: () => void;
  onSelectTake: (takeId: string) => void;
  onToggleVisibility: (takeId: string) => void;
  onDeleteTake: (takeId: string) => void;
  onFlattenComp: () => void;
}

/**
 * Comping Lane - Multiple takes stacked vertically
 * Click regions to make them active, flatten to create final comp
 */
export const CompingLane: React.FC<CompingLaneProps> = ({
  trackId,
  trackName,
  takes,
  onAddTake,
  onSelectTake,
  onToggleVisibility,
  onDeleteTake,
  onFlattenComp,
}) => {
  const [expandedHeight, setExpandedHeight] = useState(true);
  const activeTake = takes.find(t => t.active);
  const laneHeight = expandedHeight ? takes.length * 60 : 60;

  const takeColors = [
    'hsl(210, 100%, 60%)',
    'hsl(150, 100%, 50%)',
    'hsl(45, 100%, 60%)',
    'hsl(330, 90%, 60%)',
    'hsl(270, 90%, 65%)',
  ];

  return (
    <div
      className="border-b"
      style={{
        background: 'hsl(220, 18%, 14%)',
        borderColor: 'hsl(220, 14%, 28%)',
      }}
    >
      {/* Comping Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[hsl(220,14%,28%)]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[hsl(var(--studio-accent))]" />
          <span className="text-sm font-medium text-[hsl(var(--studio-text))]">
            {trackName} - Comping
          </span>
          <Badge variant="secondary" className="text-[10px]">
            {takes.length} takes
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpandedHeight(!expandedHeight)}
            className="h-7 text-xs"
          >
            {expandedHeight ? 'Collapse' : 'Expand'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onAddTake}
            className="h-7 gap-1"
          >
            <Plus className="w-3 h-3" />
            New Take
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={onFlattenComp}
            disabled={!activeTake}
            className="h-7 gap-1"
          >
            <Disc className="w-3 h-3" />
            Flatten Comp
          </Button>
        </div>
      </div>

      {/* Takes Stack */}
      <div
        className="relative"
        style={{ height: laneHeight, transition: 'height 0.2s' }}
      >
        {takes.map((take, index) => (
          <div
            key={take.id}
            className={cn(
              'absolute left-0 right-0 border-b border-[hsl(220,14%,28%)] px-3 py-2',
              'hover:bg-[hsl(220,18%,18%)] transition-colors',
              take.active && 'bg-[hsl(220,20%,20%)]'
            )}
            style={{
              top: expandedHeight ? index * 60 : 0,
              height: 60,
              opacity: take.visible ? 1 : 0.4,
            }}
          >
            <div className="flex items-center justify-between">
              {/* Take Info */}
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: take.color }}
                />
                <span className="text-xs text-[hsl(var(--studio-text))]">
                  {take.name}
                </span>
                {take.active && (
                  <Badge variant="default" className="text-[10px] h-4">
                    <Check className="w-2 h-2 mr-1" />
                    Active
                  </Badge>
                )}
              </div>

              {/* Take Actions */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleVisibility(take.id)}
                  className="h-6 w-6 p-0"
                >
                  {take.visible ? (
                    <Eye className="w-3 h-3" />
                  ) : (
                    <EyeOff className="w-3 h-3" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectTake(take.id)}
                  className="h-6 px-2 text-[10px]"
                >
                  {take.active ? 'Active' : 'Activate'}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      •••
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onSelectTake(take.id)}>
                      Set as Active
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleVisibility(take.id)}>
                      {take.visible ? 'Hide' : 'Show'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteTake(take.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-3 h-3 mr-2" />
                      Delete Take
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Region Preview (simplified) */}
            <div className="mt-1 h-6 bg-[hsl(220,20%,12%)] rounded relative overflow-hidden">
              {take.regions.map(region => (
                <div
                  key={region.id}
                  className={cn(
                    'absolute h-full',
                    take.active ? 'opacity-100' : 'opacity-60'
                  )}
                  style={{
                    left: `${(region.startTime / 180) * 100}%`,
                    width: `${(region.duration / 180) * 100}%`,
                    background: take.color,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
