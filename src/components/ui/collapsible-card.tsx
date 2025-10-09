import * as React from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CollapsibleCardProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
  storageKey?: string;
  onToggle?: (isOpen: boolean) => void;
  contentClassName?: string;
  headerClassName?: string;
}

export const CollapsibleCard = React.forwardRef<
  HTMLDivElement,
  CollapsibleCardProps
>(
  (
    {
      title,
      children,
      defaultOpen = true,
      icon,
      badge,
      className,
      storageKey,
      onToggle,
      contentClassName,
      headerClassName,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(() => {
      if (storageKey) {
        const stored = localStorage.getItem(storageKey);
        return stored !== null ? stored === "true" : defaultOpen;
      }
      return defaultOpen;
    });

    const handleToggle = (open: boolean) => {
      setIsOpen(open);
      if (storageKey) {
        localStorage.setItem(storageKey, String(open));
      }
      onToggle?.(open);
    };

    return (
      <Card ref={ref} className={cn("overflow-hidden", className)}>
        <Collapsible open={isOpen} onOpenChange={handleToggle}>
          <CardHeader className={cn("pb-3", headerClassName)}>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {icon}
                {title}
                {badge}
              </CardTitle>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-muted"
                  aria-label={isOpen ? "Collapse section" : "Expand section"}
                >
                  <motion.div
                    animate={{ rotate: isOpen ? 0 : -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </Button>
              </CollapsibleTrigger>
            </div>
          </CardHeader>
          
          <AnimatePresence initial={false}>
            {isOpen && (
              <CollapsibleContent forceMount asChild>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CardContent className={contentClassName}>
                    {children}
                  </CardContent>
                </motion.div>
              </CollapsibleContent>
            )}
          </AnimatePresence>
        </Collapsible>
      </Card>
    );
  }
);

CollapsibleCard.displayName = "CollapsibleCard";
