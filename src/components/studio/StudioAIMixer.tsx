export const StudioAIMixer = () => {
  const KnobControl = ({ label, value = 50 }: { label: string; value?: number }) => (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-16">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="4"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            strokeDasharray={`${value * 2.83} 283`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-primary" />
        </div>
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );

  return (
    <div className="absolute left-8 top-44 w-80 h-[calc(100vh-300px)] bg-background/40 backdrop-blur-md rounded-lg border border-border/50 p-6 overflow-y-auto">
      <div className="space-y-8">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Recently Suggested</h3>
          <div className="flex gap-4">
            <KnobControl label="Opensits" value={65} />
            <KnobControl label="Dynamics" value={45} />
            <KnobControl label="EQ" value={70} />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-4">MixxPort</h3>
          <div className="flex gap-4">
            <KnobControl label="Compression" value={55} />
            <KnobControl label="Width" value={60} />
            <KnobControl label="Delay" value={40} />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-4">AI Mixer</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <KnobControl label="Trunanis" value={50} />
              <KnobControl label="Gisen" value={50} />
              <KnobControl label="Compostion" value={50} />
            </div>
            <div className="flex gap-4">
              <KnobControl label="Mix" value={75} />
              <KnobControl label="Space" value={45} />
            </div>
            <div className="flex gap-4">
              <KnobControl label="Delay" value={30} />
              <KnobControl label="FX" value={55} />
              <KnobControl label="Fule" value={65} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
