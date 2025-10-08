import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SendSectionProps {
  trackId: string;
  sends: { [busId: string]: { amount: number; preFader: boolean } };
  onSendChange: (busId: string, amount: number) => void;
  onSendModeToggle: (busId: string) => void;
}

export const SendSection = ({ trackId, sends, onSendChange, onSendModeToggle }: SendSectionProps) => {
  const [draggingSend, setDraggingSend] = useState<string | null>(null);
  
  const sendBuses = ['S1', 'S2', 'S3', 'S4'];

  const handleSendMouseDown = (busId: string, e: React.MouseEvent<HTMLDivElement>) => {
    setDraggingSend(busId);
    updateSend(busId, e);
  };

  const handleSendMouseMove = (busId: string, e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingSend !== busId) return;
    updateSend(busId, e);
  };

  const updateSend = (busId: string, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const dx = e.clientX - (rect.left + centerX);
    const dy = e.clientY - (rect.top + centerY);
    const angle = Math.atan2(dy, dx);
    const normalized = ((angle + Math.PI) / (2 * Math.PI));
    const amount = Math.max(0, Math.min(1, normalized));
    onSendChange(busId, amount);
  };

  return (
    <div className="flex gap-1 w-full justify-center">
      {sendBuses.map((busId) => {
        const sendData = sends[busId] || { amount: 0, preFader: false };
        return (
          <div key={busId} className="flex flex-col items-center gap-0.5">
            <div
              className="relative w-6 h-6 rounded-full cursor-pointer"
              style={{
                background: 'var(--knob-gradient)',
                boxShadow: 'var(--shadow-recessed), inset 0 1px 1px hsl(0 0% 30% / 0.3)',
                border: '1px solid hsl(0 0% 0% / 0.5)',
              }}
              onMouseDown={(e) => handleSendMouseDown(busId, e)}
              onMouseMove={(e) => handleSendMouseMove(busId, e)}
              onMouseUp={() => setDraggingSend(null)}
              onMouseLeave={() => setDraggingSend(null)}
              onContextMenu={(e) => {
                e.preventDefault();
                onSendModeToggle(busId);
              }}
            >
              <div
                className="absolute top-1/2 left-1/2 w-0.5 h-2 rounded-full origin-bottom"
                style={{
                  transform: `translate(-50%, -50%) rotate(${sendData.amount * 270}deg)`,
                  background: sendData.preFader 
                    ? 'linear-gradient(180deg, hsl(var(--led-yellow)), hsl(var(--led-yellow)/0.5))' 
                    : 'linear-gradient(180deg, hsl(var(--led-green)), hsl(var(--led-green)/0.5))',
                  boxShadow: sendData.preFader 
                    ? '0 0 4px hsl(var(--led-yellow))' 
                    : '0 0 4px hsl(var(--led-green))',
                }}
              />
            </div>
            <span className="text-[7px] font-mono text-[hsl(var(--studio-text-dim))]">
              {busId}
            </span>
          </div>
        );
      })}
    </div>
  );
};
