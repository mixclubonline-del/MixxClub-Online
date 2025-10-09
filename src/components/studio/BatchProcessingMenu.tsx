import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  Layers, 
  RotateCcw, 
  Volume2, 
  TrendingUp, 
  TrendingDown,
  Scissors,
  Copy,
} from 'lucide-react';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { AudioOperations } from '@/audio/processing/AudioOperations';
import { toast } from 'sonner';

/**
 * Batch processing menu for applying operations to multiple selected regions
 */
export const BatchProcessingMenu: React.FC = () => {
  const { selectedRegions, tracks, updateTrack, updateRegion } = useAIStudioStore();

  const selectedCount = selectedRegions.size;
  const isDisabled = selectedCount === 0;

  const handleReverseAll = async () => {
    if (isDisabled) return;

    toast.info(`Reversing ${selectedCount} region(s)...`);

    // Find all selected regions and their tracks
    for (const regionId of selectedRegions) {
      for (const track of tracks) {
        const region = track.regions.find(r => r.id === regionId);
        if (region && track.audioBuffer) {
          try {
            // Reverse the audio buffer
            const reversedBuffer = AudioOperations.reverse(track.audioBuffer);
            
            // Update track with reversed buffer
            updateTrack(track.id, {
              audioBuffer: reversedBuffer,
            });

            // Mark region as reversed (flip sourceStartOffset)
            updateRegion(regionId, {
              // Reverse flag or visual indicator
              color: region.color || 'hsl(280, 70%, 55%)', // Purple for reversed
            });
          } catch (error) {
            console.error('Error reversing region:', error);
            toast.error('Failed to reverse region');
          }
        }
      }
    }

    toast.success(`Reversed ${selectedCount} region(s)`);
  };

  const handleNormalizeAll = async () => {
    if (isDisabled) return;

    toast.info(`Normalizing ${selectedCount} region(s)...`);

    for (const regionId of selectedRegions) {
      for (const track of tracks) {
        const region = track.regions.find(r => r.id === regionId);
        if (region && track.audioBuffer) {
          try {
            const normalizedBuffer = AudioOperations.normalize(track.audioBuffer, 0.95);
            
            updateTrack(track.id, {
              audioBuffer: normalizedBuffer,
            });
          } catch (error) {
            console.error('Error normalizing region:', error);
            toast.error('Failed to normalize region');
          }
        }
      }
    }

    toast.success(`Normalized ${selectedCount} region(s)`);
  };

  const handleFadeInAll = () => {
    if (isDisabled) return;

    selectedRegions.forEach(regionId => {
      updateRegion(regionId, {
        fadeIn: { duration: 0.1, curve: 'exponential' },
      });
    });

    toast.success(`Applied fade in to ${selectedCount} region(s)`);
  };

  const handleFadeOutAll = () => {
    if (isDisabled) return;

    selectedRegions.forEach(regionId => {
      updateRegion(regionId, {
        fadeOut: { duration: 0.1, curve: 'exponential' },
      });
    });

    toast.success(`Applied fade out to ${selectedCount} region(s)`);
  };

  const handleGainBoost = () => {
    if (isDisabled) return;

    selectedRegions.forEach(regionId => {
      const region = tracks
        .flatMap(t => t.regions)
        .find(r => r.id === regionId);
      
      if (region) {
        updateRegion(regionId, {
          gain: Math.min(2, region.gain * 1.5), // Boost by 50%, max 2x
        });
      }
    });

    toast.success(`Boosted gain on ${selectedCount} region(s)`);
  };

  const handleGainReduce = () => {
    if (isDisabled) return;

    selectedRegions.forEach(regionId => {
      const region = tracks
        .flatMap(t => t.regions)
        .find(r => r.id === regionId);
      
      if (region) {
        updateRegion(regionId, {
          gain: Math.max(0.1, region.gain * 0.7), // Reduce by 30%, min 0.1x
        });
      }
    });

    toast.success(`Reduced gain on ${selectedCount} region(s)`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={isDisabled ? 'ghost' : 'default'}
          size="sm"
          disabled={isDisabled}
          className="gap-2"
        >
          <Layers className="w-4 h-4" />
          Batch Process {selectedCount > 0 && `(${selectedCount})`}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleReverseAll}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reverse All
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleNormalizeAll}>
          <Volume2 className="w-4 h-4 mr-2" />
          Normalize All
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleFadeInAll}>
          <TrendingUp className="w-4 h-4 mr-2" />
          Fade In All
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleFadeOutAll}>
          <TrendingDown className="w-4 h-4 mr-2" />
          Fade Out All
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleGainBoost}>
          <TrendingUp className="w-4 h-4 mr-2" />
          Boost Gain (+50%)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleGainReduce}>
          <TrendingDown className="w-4 h-4 mr-2" />
          Reduce Gain (-30%)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
