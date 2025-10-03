import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useMobileDetect } from '@/hooks/useMobileDetect';
import { Menu } from 'lucide-react';

interface MobileAdminHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export const MobileAdminHeader = ({ title, description, actions }: MobileAdminHeaderProps) => {
  const { isMobile } = useMobileDetect();

  return (
    <div className={`space-y-4 ${isMobile ? 'sticky top-20 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-4 -mx-6 px-6' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isMobile && <SidebarTrigger />}
            <h1 className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'} truncate`}>
              {title}
            </h1>
          </div>
          {description && (
            <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-base'}`}>
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className={`flex gap-2 ${isMobile ? 'flex-col min-w-fit' : ''}`}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
