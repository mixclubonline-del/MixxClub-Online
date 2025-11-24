import { ReactNode } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useSearchParams } from 'react-router-dom';

export const CRMLayout = ({ children }: { children: ReactNode }) => {
  return <div className="min-h-screen bg-background">{children}</div>;
};
