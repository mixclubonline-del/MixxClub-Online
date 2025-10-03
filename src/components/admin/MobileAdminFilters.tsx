import { ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter } from 'lucide-react';
import { useMobileDetect } from '@/hooks/useMobileDetect';
import { Badge } from '@/components/ui/badge';

interface MobileAdminFiltersProps {
  children: ReactNode;
  activeFiltersCount?: number;
}

export const MobileAdminFilters = ({ children, activeFiltersCount = 0 }: MobileAdminFiltersProps) => {
  const { isMobile } = useMobileDetect();
  const [open, setOpen] = useState(false);

  if (!isMobile) {
    return <div className="flex gap-4 flex-wrap">{children}</div>;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full touch-manipulation h-12 relative">
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="default" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 pt-4">
          {children}
          <Button 
            onClick={() => setOpen(false)} 
            className="w-full touch-manipulation h-12"
          >
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
