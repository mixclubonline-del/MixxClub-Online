import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Music, Wand2, Info } from 'lucide-react';
import { GrooveEngine, GrooveTemplate } from '@/audio/analysis/GrooveEngine';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { toast } from 'sonner';

/**
 * Groove Templates Selector
 * Apply musical feel and swing to regions
 */
export const GrooveTemplates: React.FC = () => {
  const { tracks, bpm, selectedRegions, updateRegion } = useAIStudioStore();
  const [selectedTemplate, setSelectedTemplate] = useState<GrooveTemplate>(
    GrooveEngine.TEMPLATES['straight']
  );
  const [grooveStrength, setGrooveStrength] = useState(100);
  const [showInfo, setShowInfo] = useState(false);

  const templates = Object.values(GrooveEngine.TEMPLATES);
  const selectedCount = selectedRegions.size;

  const handleApplyGroove = () => {
    if (selectedCount === 0) {
      toast.error('No regions selected');
      return;
    }

    // Collect selected regions with their times
    const regionsToGroove = tracks
      .flatMap(track => track.regions)
      .filter(region => selectedRegions.has(region.id))
      .map(region => ({
        id: region.id,
        startTime: region.startTime,
      }));

    // Apply groove quantization
    const grooved = GrooveEngine.quantizeToGroove(
      regionsToGroove,
      bpm,
      selectedTemplate,
      grooveStrength
    );

    // Update regions with new times
    grooved.forEach(({ id, newStartTime }) => {
      updateRegion(id, { startTime: newStartTime });
    });

    toast.success(
      `Applied "${selectedTemplate.name}" groove to ${selectedCount} region(s)`,
      {
        description: `${grooveStrength}% strength, ${selectedTemplate.swingAmount}% swing`,
      }
    );
  };

  const handleDetectGroove = () => {
    if (selectedCount === 0) {
      toast.error('No regions selected');
      return;
    }

    const regionTimes = tracks
      .flatMap(track => track.regions)
      .filter(region => selectedRegions.has(region.id))
      .map(region => region.startTime);

    const { template, confidence } = GrooveEngine.detectGroove(regionTimes, bpm);
    
    setSelectedTemplate(template);
    
    toast.success(`Detected groove: ${template.name}`, {
      description: `${confidence.toFixed(0)}% confidence`,
    });
  };

  return (
    <div className="flex items-center gap-2">
      {/* Template Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 min-w-[140px] justify-between"
          >
            <Music className="w-4 h-4" />
            <span className="text-xs">{selectedTemplate.name}</span>
            {selectedTemplate.swingAmount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1">
                {selectedTemplate.swingAmount}%
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          {templates.map((template) => (
            <DropdownMenuItem
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className="flex flex-col items-start gap-1"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-medium">{template.name}</span>
                {template.swingAmount > 0 && (
                  <Badge variant="secondary" className="text-[10px]">
                    {template.swingAmount}% swing
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {template.description}
              </span>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleDetectGroove}>
            <Wand2 className="w-4 h-4 mr-2" />
            Detect Groove from Selection
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Strength Slider */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <span className="text-xs">Strength</span>
            <Badge variant="secondary" className="text-[10px]">
              {grooveStrength}%
            </Badge>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Groove Strength</label>
              <span className="text-xs text-muted-foreground">
                {grooveStrength}%
              </span>
            </div>
            <Slider
              value={[grooveStrength]}
              onValueChange={(values) => setGrooveStrength(values[0])}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              How much to apply the groove feel. 100% = full groove, 0% = no change
            </p>
          </div>
        </PopoverContent>
      </Popover>

      {/* Apply Button */}
      <Button
        onClick={handleApplyGroove}
        disabled={selectedCount === 0}
        size="sm"
        className="gap-2"
      >
        <Wand2 className="w-4 h-4" />
        Apply Groove
        {selectedCount > 0 && (
          <Badge variant="secondary" className="text-[10px]">
            {selectedCount}
          </Badge>
        )}
      </Button>

      {/* Info Button */}
      <Popover open={showInfo} onOpenChange={setShowInfo}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Info className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-3">
            <h4 className="font-semibold">Groove Templates</h4>
            <p className="text-sm text-muted-foreground">
              Add human feel to perfectly quantized regions. Each template applies
              timing offsets based on classic production styles:
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li><strong>J Dilla:</strong> Off-grid MPC swing (23%)</li>
              <li><strong>Trap 808:</strong> Snappy hi-hat feel (16%)</li>
              <li><strong>Boom Bap:</strong> 90s hip-hop pocket (12%)</li>
              <li><strong>Shuffle:</strong> Triplet-based feel (33%)</li>
            </ul>
            <p className="text-xs text-muted-foreground">
              Select regions and click "Apply Groove" to quantize with feel.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
