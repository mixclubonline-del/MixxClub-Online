import React from 'react';
import { cn } from '@/lib/utils';
import { useDeviceContext } from '@/hooks/useDeviceContext';

type ContainerVariant = 'narrow' | 'content' | 'wide' | 'full';

interface AdaptiveContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Container width variant */
  variant?: ContainerVariant;
  /** Center content on large screens with padding */
  centerOnLarge?: boolean;
  /** Add horizontal padding */
  padded?: boolean;
  /** HTML element to render as */
  as?: 'div' | 'section' | 'main' | 'article';
}

const variantMaxWidths: Record<ContainerVariant, string> = {
  narrow: 'max-w-2xl',      // 672px - focused reading/forms
  content: 'max-w-4xl',     // 896px - standard content
  wide: 'max-w-6xl',        // 1152px - dashboards, grids
  full: 'max-w-none',       // No max - but with smart padding
};

export const AdaptiveContainer: React.FC<AdaptiveContainerProps> = ({
  children,
  className,
  variant = 'content',
  centerOnLarge = true,
  padded = true,
  as: Component = 'div',
}) => {
  const { breakpoint, isUltrawide, isDesktop } = useDeviceContext();

  // Dynamic padding based on screen size
  const getPadding = () => {
    if (!padded) return '';
    
    switch (breakpoint) {
      case 'phone':
        return 'px-4';
      case 'tablet':
        return 'px-6';
      case 'laptop':
        return 'px-8';
      case 'desktop':
        return 'px-10';
      case 'ultrawide':
        return 'px-16';
      default:
        return 'px-4';
    }
  };

  return (
    <Component
      className={cn(
        'w-full',
        variantMaxWidths[variant],
        getPadding(),
        // Center on large screens
        centerOnLarge && (isDesktop || isUltrawide) && 'mx-auto',
        // Extra breathing room on ultrawide
        isUltrawide && variant !== 'full' && 'xl:px-8 3xl:px-12',
        className
      )}
    >
      {children}
    </Component>
  );
};
