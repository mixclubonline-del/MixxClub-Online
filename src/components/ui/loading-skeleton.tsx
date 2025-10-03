import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export const ProjectCardSkeleton = () => (
  <Card className="p-6 space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-2 w-full" />
    <div className="flex gap-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-20" />
    </div>
  </Card>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>
    
    <div className="grid md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-6 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </Card>
      ))}
    </div>

    <div className="grid lg:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export const AudioWaveformSkeleton = () => (
  <div className="space-y-2">
    <div className="flex gap-1 items-end h-24">
      {Array.from({ length: 50 }).map((_, i) => (
        <Skeleton 
          key={i} 
          className="flex-1 animate-pulse" 
          style={{ 
            height: `${Math.random() * 100}%`,
            animationDelay: `${i * 20}ms` 
          }} 
        />
      ))}
    </div>
  </div>
);

export const ChatMessageSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex gap-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);
