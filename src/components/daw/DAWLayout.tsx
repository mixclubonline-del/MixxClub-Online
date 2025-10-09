import { ReactNode } from 'react';

interface DAWLayoutProps {
  children: ReactNode;
}

export const DAWLayout = ({ children }: DAWLayoutProps) => {
  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
      {children}
    </div>
  );
};
