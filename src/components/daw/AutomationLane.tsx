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
      
      // Background
      ctx.fillStyle = 'hsl(220, 20%, 10%)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Grid lines
      ctx.strokeStyle = 'hsl(220, 20%, 15%)';
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
      ctx.strokeStyle = 'hsl(0, 80%, 60%)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, canvas.height);
      ctx.stroke();
      
      // Automation curve
      if (points.length > 0) {
        ctx.strokeStyle = 'hsl(180, 70%, 50%)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const sortedPoints = [...points].sort((a, b) => a.time - b.time);
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
          
          ctx.fillStyle = selectedPoint === index 
            ? 'hsl(50, 100%, 50%)' 
            : 'hsl(180, 70%, 50%)';
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();
          
          // Point border
          ctx.strokeStyle = 'hsl(220, 20%, 10%)';
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
      className="flex flex-col border-t"
      style={{
        background: 'hsl(220, 20%, 12%)',
        borderColor: 'hsl(220, 20%, 20%)',
        height: '120px',
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-3 py-1 border-b"
        style={{ borderColor: 'hsl(220, 20%, 20%)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: 'hsl(180, 70%, 50%)' }}>
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
