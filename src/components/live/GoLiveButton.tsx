import React, { useState } from 'react';
import { Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GoLiveModal } from './GoLiveModal';

interface GoLiveButtonProps {
  className?: string;
  variant?: 'floating' | 'inline';
}

export const GoLiveButton: React.FC<GoLiveButtonProps> = ({ 
  className,
  variant = 'inline' 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (variant === 'floating') {
    return (
      <>
        <Button
          onClick={() => setIsModalOpen(true)}
          className={cn(
            "fixed bottom-24 right-6 z-40 h-14 w-14 rounded-full shadow-lg",
            "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
            "animate-pulse hover:animate-none",
            className
          )}
          size="icon"
        >
          <Video className="h-6 w-6" />
        </Button>
        <GoLiveModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      </>
    );
  }

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className={cn(
          "gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground",
          className
        )}
      >
        <Video className="h-4 w-4" />
        Go Live
      </Button>
      <GoLiveModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
};
