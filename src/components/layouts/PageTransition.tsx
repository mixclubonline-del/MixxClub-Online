import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

// Safety-first: route content should never be hidden by transition state.
export const PageTransition = ({ children }: PageTransitionProps) => {
  return <div className="h-full">{children}</div>;
};
