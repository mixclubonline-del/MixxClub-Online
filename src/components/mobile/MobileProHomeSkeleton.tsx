import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export function MobileProHomeSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 py-5 space-y-5">
        {/* Greeting */}
        <div>
          <Skeleton className="h-6 w-52 mb-2" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>

        {/* Earnings card */}
        <Card className="p-4 border-border/20">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-8 w-28" />
            </div>
            <Skeleton className="w-12 h-12 rounded-2xl" />
          </div>
          <div className="flex gap-4 mt-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </Card>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 border-border/20 flex flex-col items-center gap-2">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="h-3 w-14" />
            </Card>
          ))}
        </div>

        {/* Session feed header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-14" />
        </div>

        {/* Session cards */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 border-border/20">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
