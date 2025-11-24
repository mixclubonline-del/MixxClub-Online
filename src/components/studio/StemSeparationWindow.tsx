interface StemSeparationWindowProps {
  onClose: () => void;
  onStemsProcessed: (stems: Array<{ stemType: string; stemName: string; filePath: string }>) => Promise<void>;
}

export const StemSeparationWindow = ({ onClose, onStemsProcessed }: StemSeparationWindowProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Stem Separation</h2>
      <p className="text-muted-foreground">Coming soon</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
};
