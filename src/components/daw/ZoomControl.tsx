import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface ZoomControlProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showButtons?: boolean;
  showReset?: boolean;
}

export const ZoomControl = ({
  zoom,
  onZoomChange,
  min = 0.5,
  max = 4,
  step = 0.1,
  showButtons = true,
  showReset = true,
}: ZoomControlProps) => {
  const handleZoomIn = () => {
    const newZoom = Math.min(max, zoom + step);
    onZoomChange(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(min, zoom - step);
    onZoomChange(newZoom);
  };

  const handleReset = () => {
    onZoomChange(1);
  };

  const percentage = Math.round(zoom * 100);

  return (
    <div className="flex items-center gap-2 bg-card border rounded-lg px-3 py-2">
      {showButtons && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleZoomOut}
          disabled={zoom <= min}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
      )}
      
      <div className="flex items-center gap-2 min-w-[120px]">
        <Slider
          value={[zoom]}
          min={min}
          max={max}
          step={step}
          onValueChange={(v) => onZoomChange(v[0])}
          className="flex-1"
        />
        <span className="text-xs font-medium w-12 text-right text-muted-foreground">
          {percentage}%
        </span>
      </div>

      {showButtons && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleZoomIn}
          disabled={zoom >= max}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
      )}

      {showReset && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleReset}
          title="Reset to 100%"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
