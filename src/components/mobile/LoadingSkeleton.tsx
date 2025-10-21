import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'avatar' | 'button' | 'list';
  count?: number;
}

export const LoadingSkeleton = ({ 
  className, 
  variant = 'text',
  count = 1 
}: LoadingSkeletonProps) => {
  const baseClass = 'animate-pulse bg-muted rounded';
  
  const variants = {
    text: 'h-4 w-full',
    card: 'h-32 w-full',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 w-full',
    list: 'h-16 w-full'
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(baseClass, variants[variant], className)}
        />
      ))}
    </>
  );
};

export const CardSkeleton = () => (
  <div className="space-y-3 p-4 border rounded-lg">
    <LoadingSkeleton variant="text" className="w-3/4" />
    <LoadingSkeleton variant="text" className="w-1/2" />
    <LoadingSkeleton variant="button" />
  </div>
);

export const ListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-4 border rounded-lg">
        <LoadingSkeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <LoadingSkeleton variant="text" className="w-3/4" />
          <LoadingSkeleton variant="text" className="w-1/2" />
        </div>
      </div>
    ))}
  </div>
);
