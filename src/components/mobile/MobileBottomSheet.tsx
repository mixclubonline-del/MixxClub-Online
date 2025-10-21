import { ReactNode } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';

interface MobileBottomSheetProps {
  trigger: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const MobileBottomSheet = ({
  trigger,
  title,
  description,
  children,
  open,
  onOpenChange,
}: MobileBottomSheetProps) => {
  const { triggerHaptic } = useMobileOptimization({ enableHaptics: true });

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      triggerHaptic('light');
    }
    onOpenChange?.(newOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent 
        side="bottom" 
        className="h-[85vh] rounded-t-2xl"
      >
        <SheetHeader className="text-left pb-4">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="overflow-y-auto h-[calc(85vh-80px)] pb-safe">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
};
