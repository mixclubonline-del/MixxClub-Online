import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AutomationPoint {
  time: number; // in seconds
  value: number; // 0 to 1
  curve: 'linear' | 'exponential' | 'logarithmic';
}

interface AutomationLaneProps {
  trackId: string;
  trackName: string;
  parameter: 'volume' | 'pan' | string; // 'string' for effect parameters
  points: AutomationPoint[];
  duration: number;
  pixelsPerSecond: number;
  onAddPoint: (point: AutomationPoint) => void;
  onUpdatePoint: (index: number, point: AutomationPoint) => void;
  onDeletePoint: (index: number) => void;
  onChangeParameter: (parameter: string) => void;
  onDelete: () => void;
}

/**
 * Automation lane for drawing parameter automation curves
 */
export const AutomationLane = ({
  trackId,
  trackName,
  parameter,
  points,
  duration,
  pixelsPerSecond,
  onAddPoint,
  onUpdatePoint,
  onDeletePoint,
  onChangeParameter,
  onDelete,
}: AutomationLaneProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [draggingPoint, setDraggingPoint] = useState<number | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const height = 80;

  // Draw automation curve
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = 'hsl(220, 18%, 16%)';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw grid
    ctx.strokeStyle = 'hsl(220, 14%, 24%)';
    ctx.lineWidth = 1;
    
    // Horizontal center line
    ctx.beginPath();
    ctx.moveTo(0, rect.height / 2);
    ctx.lineTo(rect.width, rect.height / 2);
    ctx.stroke();

    // Draw automation curve
    if (points.length > 0) {
      ctx.strokeStyle = 'hsl(var(--studio-accent))';
      ctx.lineWidth = 2;
      ctx.beginPath();

      // Sort points by time
      const sortedPoints = [...points].sort((a, b) => a.time - b.time);

      sortedPoints.forEach((point, i) => {
        const x = point.time * pixelsPerSecond;
        const y = rect.height - (point.value * rect.height);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          // Draw curve based on previous point's curve type
          const prevPoint = sortedPoints[i - 1];
          const prevX = prevPoint.time * pixelsPerSecond;
          const prevY = rect.height - (prevPoint.value * rect.height);

          if (prevPoint.curve === 'exponential') {
            // Exponential curve
            ctx.quadraticCurveTo(
              prevX + (x - prevX) * 0.7,
              prevY,
              x,
              y
            );
          } else if (prevPoint.curve === 'logarithmic') {
            // Logarithmic curve
            ctx.quadraticCurveTo(
              prevX,
              prevY + (y - prevY) * 0.7,
              x,
              y
            );
          } else {
            // Linear
            ctx.lineTo(x, y);
          }
        }
      });

      ctx.stroke();

      // Draw automation points
      sortedPoints.forEach((point, i) => {
        const x = point.time * pixelsPerSecond;
        const y = rect.height - (point.value * rect.height);

        ctx.beginPath();
        ctx.arc(x, y, hoveredPoint === i || draggingPoint === i ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = hoveredPoint === i || draggingPoint === i 
          ? 'hsl(var(--studio-accent))'
          : 'hsl(var(--studio-text))';
        ctx.fill();
        ctx.strokeStyle = 'hsl(220, 18%, 10%)';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }
  }, [points, pixelsPerSecond, duration, height, hoveredPoint, draggingPoint]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (draggingPoint !== null) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const time = x / pixelsPerSecond;
    const value = 1 - (y / rect.height);

    // Check if clicking near existing point
    const clickedPoint = points.findIndex(p => {
      const px = p.time * pixelsPerSecond;
      const py = rect.height - (p.value * rect.height);
      return Math.abs(px - x) < 10 && Math.abs(py - y) < 10;
    });

    if (clickedPoint !== -1) {
      // Delete point on click
      onDeletePoint(clickedPoint);
    } else {
      // Add new point
      onAddPoint({
        time: Math.max(0, Math.min(duration, time)),
        value: Math.max(0, Math.min(1, value)),
        curve: 'linear',
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on a point
    const pointIndex = points.findIndex(p => {
      const px = p.time * pixelsPerSecond;
      const py = rect.height - (p.value * rect.height);
      return Math.abs(px - x) < 10 && Math.abs(py - y) < 10;
    });

    if (pointIndex !== -1) {
      setDraggingPoint(pointIndex);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (draggingPoint !== null) {
      // Update dragged point
      const time = Math.max(0, Math.min(duration, x / pixelsPerSecond));
      const value = Math.max(0, Math.min(1, 1 - (y / rect.height)));

      onUpdatePoint(draggingPoint, {
        ...points[draggingPoint],
        time,
        value,
      });
    } else {
      // Check hover
      const hoverIndex = points.findIndex(p => {
        const px = p.time * pixelsPerSecond;
        const py = rect.height - (p.value * rect.height);
        return Math.abs(px - x) < 10 && Math.abs(py - y) < 10;
      });
      setHoveredPoint(hoverIndex);
    }
  };

  const handleMouseUp = () => {
    setDraggingPoint(null);
  };

  const getParameterLabel = (param: string): string => {
    const labels: Record<string, string> = {
      volume: 'Volume',
      pan: 'Pan',
    };
    return labels[param] || param;
  };

  return (
    <div
      className="flex gap-2 border-b"
      style={{
        background: 'hsl(220, 18%, 14%)',
        borderColor: 'hsl(220, 14%, 28%)',
      }}
    >
      {/* Lane header */}
      <div className="w-48 p-2 border-r border-[hsl(var(--studio-border))] flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-[hsl(var(--studio-text))]">
            {trackName}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-5 px-1 text-[10px]">
                {getParameterLabel(parameter)}
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onChangeParameter('volume')}>
                Volume
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChangeParameter('pan')}>
                Pan
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-6 w-6 p-0"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      {/* Automation canvas */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="w-full cursor-crosshair"
          style={{ height }}
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        <Badge
          variant="secondary"
          className="absolute top-2 right-2 text-[10px] px-2 py-0.5"
        >
          {points.length} points
        </Badge>
      </div>
    </div>
  );
};
