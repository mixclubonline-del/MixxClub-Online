type Props = { value: number; max: number; tierLabel?: string };

export default function XPBar({ value, max, tierLabel }: Props) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
        <span>{tierLabel ?? "Progress"}</span>
        <span>{value} / {max}</span>
      </div>
      <div className="w-full h-2 rounded-full bg-[hsl(var(--muted)/0.5)] overflow-hidden">
        <div
          className="h-full rounded-full animate-glow-pulse"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent-cyan)))",
            boxShadow: "var(--shadow-glass)"
          }}
        />
      </div>
    </div>
  );
}
