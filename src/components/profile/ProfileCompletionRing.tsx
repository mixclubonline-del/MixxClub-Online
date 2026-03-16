import { useState } from 'react';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { ProfileEditSheet } from './ProfileEditSheet';
import { User } from 'lucide-react';

export function ProfileCompletionRing() {
  const { percentage, missingFields, isComplete, isLoading } = useProfileCompletion();
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading || isComplete) return null;

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <>
      <button
        onClick={() => setEditOpen(true)}
        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-accent/10 transition-colors text-left group"
      >
        <div className="relative w-10 h-10 shrink-0">
          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
            <circle
              cx="20" cy="20" r={radius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="3"
            />
            <circle
              cx="20" cy="20" r={radius}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-bold text-primary">{percentage}%</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Complete Profile</p>
          <p className="text-xs text-muted-foreground truncate">
            {missingFields.length === 1
              ? `Add your ${missingFields[0].label.toLowerCase()}`
              : `${missingFields.length} items remaining`}
          </p>
        </div>

        <User className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
      </button>

      <ProfileEditSheet open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
