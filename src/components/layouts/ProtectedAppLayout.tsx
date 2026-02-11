import { Outlet } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayout } from './AppLayout';

/**
 * Layout route wrapper that combines ProtectedRoute + AppLayout.
 * Used as a parent <Route element={...}> so all child routes
 * automatically get auth protection, sidebar, header, wallet, and notifications.
 */
export function ProtectedAppLayout() {
    return (
        <ProtectedRoute>
            <AppLayout>
                <Outlet />
            </AppLayout>
        </ProtectedRoute>
    );
}
