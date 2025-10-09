import { useAIStudioStore } from '@/stores/aiStudioStore';

interface TimeSelectionProps {
  pixelsPerSecond: number;
  height: number;
}

export const TimeSelection = ({ pixelsPerSecond, height }: TimeSelectionProps) => {
  const timeSelection = useAIStudioStore((state) => state.timeSelection);

  if (!timeSelection) return null;

  const startX = timeSelection.start * pixelsPerSecond;
  const width = (timeSelection.end - timeSelection.start) * pixelsPerSecond;

  return (
    <div
      className="absolute top-0 pointer-events-none"
      style={{
        left: startX,
        width,
        height,
        background: 'rgba(255, 204, 0, 0.15)',
        border: '1px solid rgba(255, 204, 0, 0.5)',
        boxShadow: '0 0 10px rgba(255, 204, 0, 0.3)',
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-[hsl(45,100%,50%)]" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[hsl(45,100%,50%)]" />
    </div>
  );
};
