import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import { useAIStudioStore } from '@/stores/aiStudioStore';

interface AutomationPoint {
  time: number;
  value: number;
}

interface AutomationLaneProps {
  trackId: string;
  parameter: 'volume' | 'pan' | 'effect';
  onClose?: () => void;
}

export const AutomationLane = ({ trackId, parameter, onClose }: AutomationLaneProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<AutomationPoint[]>([
    { time: 0, value: 0.8 },
    { time: 2, value: 0.5 },
    { time: 4, value: 1.0 },
  ]);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const duration = useAIStudioStore((state) => state.duration);
  const currentTime = useAIStudioStore((state) => state.currentTime);

  const getParameterLabel = () => {
    switch (parameter) {
      case 'volume': return 'Volume';
      case 'pan': return 'Pan';
      case 'effect': return 'Effect';
      default: return 'Parameter';
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Background with subtle gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'hsl(220, 20%, 12%)');
      gradient.addColorStop(1, 'hsl(220, 20%, 8%)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Grid lines
      ctx.strokeStyle = 'hsl(220, 20%, 18%)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = (canvas.height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // Current time indicator
      const playheadX = (currentTime / duration) * canvas.width;
      const playheadGradient = ctx.createLinearGradient(playheadX - 1, 0, playheadX + 1, 0);
      playheadGradient.addColorStop(0, 'hsla(0, 80%, 60%, 0)');
      playheadGradient.addColorStop(0.5, 'hsl(0, 80%, 60%)');
      playheadGradient.addColorStop(1, 'hsla(0, 80%, 60%, 0)');
      ctx.strokeStyle = playheadGradient;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, canvas.height);
      ctx.stroke();
      
      // Automation curve
      if (points.length > 0) {
        const sortedPoints = [...points].sort((a, b) => a.time - b.time);
        
        // Fill area under curve
        ctx.fillStyle = 'hsla(180, 70%, 50%, 0.1)';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        sortedPoints.forEach((point) => {
          const x = (point.time / duration) * canvas.width;
          const y = canvas.height - (point.value * canvas.height);
          ctx.lineTo(x, y);
        });
        ctx.lineTo((sortedPoints[sortedPoints.length - 1].time / duration) * canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();
        
        // Draw curve line
        ctx.strokeStyle = 'hsl(180, 70%, 50%)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        
        sortedPoints.forEach((point, index) => {
          const x = (point.time / duration) * canvas.width;
          const y = canvas.height - (point.value * canvas.height);
          
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
        
        // Draw points
        sortedPoints.forEach((point, index) => {
          const x = (point.time / duration) * canvas.width;
          const y = canvas.height - (point.value * canvas.height);
          
          // Point glow
          if (selectedPoint === index) {
            const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 12);
            glowGradient.addColorStop(0, 'hsla(50, 100%, 50%, 0.3)');
            glowGradient.addColorStop(1, 'hsla(50, 100%, 50%, 0)');
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(x, y, 12, 0, Math.PI * 2);
            ctx.fill();
          }
          
          // Point
          ctx.fillStyle = selectedPoint === index 
            ? 'hsl(50, 100%, 55%)' 
            : 'hsl(180, 70%, 50%)';
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fill();
          
          // Point border
          ctx.strokeStyle = 'hsl(220, 20%, 8%)';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      }
    };

    draw();
  }, [points, selectedPoint, currentTime, duration]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const time = (x / canvas.width) * duration;
    const value = 1 - (y / canvas.height);
    
    // Check if clicking near existing point
    const clickedPointIndex = points.findIndex(point => {
      const pointX = (point.time / duration) * canvas.width;
      const pointY = canvas.height - (point.value * canvas.height);
      const distance = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2));
      return distance < 10;
    });
    
    if (clickedPointIndex >= 0) {
      setSelectedPoint(clickedPointIndex);
      setIsDragging(true);
    } else {
      // Add new point
      const newPoints = [...points, { time, value }];
      setPoints(newPoints.sort((a, b) => a.time - b.time));
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || selectedPoint === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const time = Math.max(0, Math.min((x / canvas.width) * duration, duration));
    const value = Math.max(0, Math.min(1 - (y / canvas.height), 1));
    
    const newPoints = [...points];
    newPoints[selectedPoint] = { time, value };
    setPoints(newPoints);
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const handleDeletePoint = () => {
    if (selectedPoint !== null) {
      const newPoints = points.filter((_, index) => index !== selectedPoint);
      setPoints(newPoints);
      setSelectedPoint(null);
    }
  };

  return (
    <div 
      className="flex flex-col border-t bg-card/50"
      style={{
        height: '120px',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-primary rounded-full" />
          <span className="text-xs font-semibold text-primary">
            {getParameterLabel()} Automation
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedPoint !== null && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleDeletePoint}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onClose}
          >
            <ChevronDown className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Automation Canvas */}
      <canvas
        ref={canvasRef}
        width={1200}
        height={90}
        className="w-full cursor-crosshair"
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
      />
    </div>
  );
};
