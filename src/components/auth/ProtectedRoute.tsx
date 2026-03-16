import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [suspended, setSuspended] = useState<{ is: boolean; reason?: string } | null>(null);

  useEffect(() => {
    if (!user) return;

    const checkSuspension = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('is_suspended, suspension_reason')
        .eq('id', user.id)
        .single();

      if (data?.is_suspended) {
        setSuspended({ is: true, reason: data.suspension_reason || undefined });
      } else {
        setSuspended({ is: false });
      }
    };

    checkSuspension();
  }, [user]);

  if (loading || (user && suspended === null)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (suspended?.is) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background p-6">
        <div className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <ShieldOff className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Account Suspended</h1>
          <p className="text-muted-foreground">
            Your account has been suspended by a platform administrator.
          </p>
          {suspended.reason && (
            <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <p className="text-sm text-foreground">
                <span className="font-medium">Reason:</span> {suspended.reason}
              </p>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            If you believe this is a mistake, please contact support.
          </p>
          <Button
            variant="outline"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/';
            }}
          >
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
