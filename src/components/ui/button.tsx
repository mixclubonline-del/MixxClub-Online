import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-glow-sm hover:scale-105 active:scale-95",
        destructive: "bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground hover:shadow-[0_0_20px_hsl(var(--destructive)/0.4)] hover:scale-105 active:scale-95",
        outline: "border-2 border-primary/30 bg-background/50 hover:bg-primary/10 hover:border-primary/50 hover:shadow-glass backdrop-blur-sm",
        secondary: "bg-secondary/80 text-secondary-foreground hover:bg-secondary backdrop-blur-sm hover:shadow-glass",
        ghost: "hover:bg-primary/10 hover:text-primary hover:shadow-glow-sm",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-glow",
        glass: "bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-lg border border-border/30 hover:border-primary/40 hover:shadow-glass text-foreground",
        glow: "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-glow-sm hover:shadow-glow hover:scale-105 active:scale-95",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
