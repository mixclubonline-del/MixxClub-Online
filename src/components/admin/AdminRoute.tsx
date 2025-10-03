import React, { Suspense } from 'react';
import { AdminErrorBoundary } from './AdminErrorBoundary';
import { AdminPageSkeleton } from './AdminPageSkeleton';

interface AdminRouteProps {
  children: React.ReactNode;
  section?: string;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children, section }) => {
  return (
    <AdminErrorBoundary section={section}>
      <Suspense fallback={<AdminPageSkeleton />}>
        {children}
      </Suspense>
    </AdminErrorBoundary>
  );
};