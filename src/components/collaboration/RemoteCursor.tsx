import React, { memo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { RemoteCursorData } from '@/hooks/useRealtimeCursors';

interface RemoteCursorProps {
  cursor: RemoteCursorData;
  containerBounds?: DOMRect;
  onFollow?: (userId: string) => void;
  isBeingFollowed?: boolean;
}

const RemoteCursor = memo(({ 
  cursor, 
  containerBounds,
  onFollow,
  isBeingFollowed 
}: RemoteCursorProps) => {
  const { id, name, avatar, color, position, isIdle } = cursor;

  // Calculate position relative to container if bounds provided
  const x = containerBounds ? Math.min(Math.max(position.x, 0), containerBounds.width - 20) : position.x;
  const y = containerBounds ? Math.min(Math.max(position.y, 0), containerBounds.height - 20) : position.y;

  return (
    <div
      className={cn(
        "absolute pointer-events-none z-50 transition-all duration-75",
        isIdle && "opacity-40"
      )}
      style={{
        left: x,
        top: y,
        transform: 'translate(-2px, -2px)'
      }}
    >
      {/* Cursor arrow */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        className="drop-shadow-md"
        style={{ filter: `drop-shadow(0 1px 2px ${color}40)` }}
      >
        <path
          d="M5.5 3.21V20.79C5.5 21.72 6.59 22.27 7.34 21.72L11.47 18.61C11.78 18.39 12.17 18.29 12.55 18.33L17.88 18.91C18.85 19.02 19.53 18.02 19.06 17.17L8.42 3.42C7.89 2.48 6.5 2.62 6.16 3.67L5.5 3.21Z"
          fill={color}
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>

      {/* User label */}
      <div
        className={cn(
          "absolute left-5 top-4 flex items-center gap-1.5 px-2 py-1 rounded-full",
          "text-xs font-medium text-white whitespace-nowrap",
          "shadow-lg transition-opacity duration-200",
          isBeingFollowed && "ring-2 ring-white ring-offset-1"
        )}
        style={{ backgroundColor: color }}
      >
        {avatar && (
          <Avatar className="h-4 w-4">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="text-[8px]" style={{ backgroundColor: color }}>
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        <span className="max-w-[100px] truncate">{name}</span>
        {isIdle && (
          <span className="text-white/70 text-[10px]">idle</span>
        )}
      </div>

      {/* Follow button (pointer events enabled) */}
      {onFollow && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFollow(id);
          }}
          className="absolute left-5 top-10 pointer-events-auto opacity-0 hover:opacity-100 
                     transition-opacity text-[10px] px-1.5 py-0.5 rounded bg-black/50 text-white"
        >
          {isBeingFollowed ? 'Unfollow' : 'Follow'}
        </button>
      )}
    </div>
  );
});

RemoteCursor.displayName = 'RemoteCursor';

export default RemoteCursor;
