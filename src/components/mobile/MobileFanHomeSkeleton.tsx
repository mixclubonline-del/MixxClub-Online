import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export function MobileFanHomeSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 py-5 space-y-6">
        {/* Greeting */}
        <div>
          <Skeleton className="h-6 w-56 mb-2" />
          <div className="flex gap-2 mt-2">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>

        {/* Live Now strip */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-10" />
          </div>
          <div className="flex gap-3 overflow-hidden -mx-4 px-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="min-w-[150px] h-[120px] rounded-2xl flex-shrink-0" />
            ))}
          </div>
        </div>

        {/* Active Challenges */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-10" />
          </div>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <Card key={i} className="p-3 border-border/20">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-1.5" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-5 w-14 rounded-full ml-2" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Trending marketplace */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-10" />
          </div>
          <div className="flex gap-3 overflow-hidden -mx-4 px-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="min-w-[140px] h-[100px] rounded-2xl flex-shrink-0" />
            ))}
          </div>
        </div>

        {/* Missions card */}
        <Card className="p-4 border-border/20">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-2xl" />
            <div className="flex-1">
              <Skeleton className="h-4 w-28 mb-1.5" />
              <Skeleton className="h-3 w-44" />
            </div>
            <Skeleton className="w-5 h-5 rounded" />
          </div>
        </Card>
      </div>
    </div>
  );
}
