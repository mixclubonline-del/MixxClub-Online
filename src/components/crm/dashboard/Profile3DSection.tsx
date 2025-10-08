import { Suspense, lazy } from 'react';
import { Card } from '@/components/ui/card';
import { User } from 'lucide-react';

const ProfileAvatar3D = lazy(() => import('@/components/3d/r3f/ProfileAvatar3D').then(m => ({ default: m.ProfileAvatar3D })));
const Stats3DChart = lazy(() => import('@/components/3d/r3f/Stats3DChart').then(m => ({ default: m.Stats3DChart })));

interface Profile3DSectionProps {
  userName: string;
  stats?: Array<{
    label: string;
    value: number;
    color: string;
  }>;
}

export const Profile3DSection = ({ userName, stats }: Profile3DSectionProps) => {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* 3D Avatar */}
      <Card className="p-6 bg-gradient-to-br from-card/50 to-card border-primary/30">
        <h3 className="text-lg font-bold mb-4">Your 3D Avatar</h3>
        <div className="h-[300px] rounded-lg overflow-hidden border border-primary/20">
          <Suspense fallback={
            <div className="w-full h-full bg-gradient-to-b from-background to-muted animate-pulse flex items-center justify-center">
              <User className="w-12 h-12 text-muted-foreground animate-pulse" />
            </div>
          }>
            <ProfileAvatar3D userName={userName} className="w-full h-full" />
          </Suspense>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Your unique holographic identity
        </p>
      </Card>

      {/* 3D Stats */}
      {stats && stats.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-card/50 to-card border-accent-blue/30">
          <h3 className="text-lg font-bold mb-4">Performance Stats</h3>
          <div className="h-[300px] rounded-lg overflow-hidden border border-accent-blue/20">
            <Suspense fallback={
              <div className="w-full h-full bg-gradient-to-b from-background to-muted animate-pulse" />
            }>
              <Stats3DChart 
                data={stats}
                className="w-full h-full" 
              />
            </Suspense>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Drag to rotate • Scroll to zoom
          </p>
        </Card>
      )}
    </div>
  );
};
