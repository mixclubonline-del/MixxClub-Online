import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Trash2, Pencil, TrendingUp, Zap, Activity, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AutomationCurveType = 
  | 'linear' 
  | 'exponential' 
  | 'logarithmic' 
  | 's-curve' 
  | 'step' 
  | 'bezier';

export interface AutomationPoint {
  time: number; // in seconds
  value: number; // 0 to 1
  curve: AutomationCurveType;
  // Bezier control points (optional, used for bezier curves)
  controlPoint1?: { x: number; y: number };
  controlPoint2?: { x: number; y: number };
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
 * Enhanced Automation Lane with Week 3 features:
 * - Advanced curves: S-Curve, Step, Bezier
 * - Draw mode for freehand automation
 * - Curve type selector per segment
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
  const [drawMode, setDrawMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const height = 80;

  // Draw mode - freehand automation
  const handleDrawStart = (e: React.MouseEvent) => {
    if (!drawMode) return;
    setIsDrawing(true);
  };

  const handleDrawMove = (e: React.MouseEvent) => {
    if (!drawMode || !isDrawing) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const time = x / pixelsPerSecond;
    const value = 1 - (y / rect.height);

    // Add point while drawing (throttled)
    onAddPoint({
      time: Math.max(0, Math.min(duration, time)),
      value: Math.max(0, Math.min(1, value)),
      curve: 'linear',
    });
  };

  const handleDrawEnd = () => {
    setIsDrawing(false);
  };

  // Draw automation curve with advanced curve types
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
    
    // Horizontal lines (25%, 50%, 75%)
    [0.25, 0.5, 0.75].forEach(fraction => {
      ctx.beginPath();
      ctx.moveTo(0, rect.height * fraction);
      ctx.lineTo(rect.width, rect.height * fraction);
      ctx.stroke();
    });

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
          const prevPoint = sortedPoints[i - 1];
          const prevX = prevPoint.time * pixelsPerSecond;
          const prevY = rect.height - (prevPoint.value * rect.height);

          // Draw curve based on curve type
          switch (prevPoint.curve) {
            case 'exponential':
              // Exponential: fast at start, slow at end
              ctx.quadraticCurveTo(
                prevX + (x - prevX) * 0.7,
                prevY,
                x,
                y
              );
              break;

            case 'logarithmic':
              // Logarithmic: slow at start, fast at end
              ctx.quadraticCurveTo(
                prevX,
                prevY + (y - prevY) * 0.7,
                x,
                y
              );
              break;

            case 's-curve':
              // S-Curve: ease in and out
              const midX = prevX + (x - prevX) / 2;
              const midY = prevY + (y - prevY) / 2;
              ctx.bezierCurveTo(
                prevX + (x - prevX) * 0.2,
                prevY,
                prevX + (x - prevX) * 0.8,
                y,
                x,
                y
              );
              break;

            case 'step':
              // Step: instant change
              ctx.lineTo(x, prevY);
              ctx.lineTo(x, y);
              break;

            case 'bezier':
              // Bezier: custom curve with control points
              if (prevPoint.controlPoint1 && prevPoint.controlPoint2) {
                ctx.bezierCurveTo(
                  prevPoint.controlPoint1.x,
                  prevPoint.controlPoint1.y,
                  prevPoint.controlPoint2.x,
                  prevPoint.controlPoint2.y,
                  x,
                  y
                );
              } else {
                ctx.lineTo(x, y);
              }
              break;

            case 'linear':
            default:
              // Linear: straight line
              ctx.lineTo(x, y);
              break;
          }
        }
      });

      ctx.stroke();

      // Draw automation points
      sortedPoints.forEach((point, i) => {
        const x = point.time * pixelsPerSecond;
        const y = rect.height - (point.value * rect.height);

        // Point circle
        ctx.beginPath();
        ctx.arc(x, y, hoveredPoint === i || draggingPoint === i ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = hoveredPoint === i || draggingPoint === i 
          ? 'hsl(var(--studio-accent))'
          : 'hsl(var(--studio-text))';
        ctx.fill();
        ctx.strokeStyle = 'hsl(220, 18%, 10%)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Curve type indicator (small icon)
        if (hoveredPoint === i && i < sortedPoints.length - 1) {
          ctx.fillStyle = 'hsla(var(--studio-accent), 0.8)';
          ctx.font = '8px monospace';
          ctx.fillText(point.curve[0].toUpperCase(), x + 8, y - 8);
        }
      });
    }
  }, [points, pixelsPerSecond, duration, height, hoveredPoint, draggingPoint]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (draggingPoint !== null || drawMode) return;

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
    if (drawMode) {
      handleDrawStart(e);
      return;
    }

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
    if (drawMode && isDrawing) {
      handleDrawMove(e);
      return;
    }

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
    if (drawMode) {
      handleDrawEnd();
    }
  };

  const handleChangeCurveType = (curveType: AutomationCurveType) => {
    if (hoveredPoint !== null && hoveredPoint < points.length) {
      onUpdatePoint(hoveredPoint, {
        ...points[hoveredPoint],
        curve: curveType,
      });
    }
  };

  const getParameterLabel = (param: string): string => {
    const labels: Record<string, string> = {
      volume: 'Volume',
      pan: 'Pan',
    };
    return labels[param] || param;
  };

  const curveTypes: Array<{ type: AutomationCurveType; label: string; icon: React.ReactNode }> = [
    { type: 'linear', label: 'Linear', icon: <Minus className="w-3 h-3" /> },
    { type: 'exponential', label: 'Exponential', icon: <TrendingUp className="w-3 h-3" /> },
    { type: 'logarithmic', label: 'Logarithmic', icon: <TrendingUp className="w-3 h-3 rotate-180" /> },
    { type: 's-curve', label: 'S-Curve', icon: <Activity className="w-3 h-3" /> },
    { type: 'step', label: 'Step', icon: <Zap className="w-3 h-3" /> },
  ];

  return (
    <div
      className="flex gap-2 border-b"
      style={{
        background: 'hsl(220, 18%, 14%)',
        borderColor: 'hsl(220, 14%, 28%)',
      }}
    >
      {/* Lane header */}
      <div className="w-48 p-2 border-r border-[hsl(var(--studio-border))] flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex-1">
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

        {/* Curve Type Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-[10px] gap-1"
              disabled={hoveredPoint === null}
            >
              {hoveredPoint !== null && points[hoveredPoint] ? (
                <>
                  {curveTypes.find(c => c.type === points[hoveredPoint].curve)?.icon}
                  {curveTypes.find(c => c.type === points[hoveredPoint].curve)?.label}
                </>
              ) : (
                'Curve Type'
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {curveTypes.map(({ type, label, icon }) => (
              <DropdownMenuItem
                key={type}
                onClick={() => handleChangeCurveType(type)}
                className="gap-2"
              >
                {icon}
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Draw Mode Toggle */}
        <Button
          variant={drawMode ? 'default' : 'outline'}
          size="sm"
          onClick={() => setDrawMode(!drawMode)}
          className="h-6 text-[10px] gap-1"
        >
          <Pencil className="w-3 h-3" />
          {drawMode ? 'Draw Mode' : 'Edit Mode'}
        </Button>
      </div>

      {/* Automation canvas */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className={cn(
            'w-full',
            drawMode ? 'cursor-crosshair' : 'cursor-pointer'
          )}
          style={{ height }}
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <Badge
            variant="secondary"
            className="text-[10px] px-2 py-0.5"
          >
            {points.length} points
          </Badge>
          {drawMode && (
            <Badge
              variant="default"
              className="text-[10px] px-2 py-0.5 bg-red-600"
            >
              Draw Mode
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
