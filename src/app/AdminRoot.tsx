import { Outlet } from 'react-router-dom';
import { AdminProvider } from './context/AdminContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui/sonner';

/**
 * AdminRoot – standalone layout for /admin routes.
 * Provides its own AuthProvider + AdminProvider so the admin dashboard
 * is fully independent of the user-facing Root layout.
 */
export default function AdminRoot() {
    return (
        <AuthProvider>
            <AdminProvider>
                <Outlet />
                <Toaster position="top-right" />
            </AdminProvider>
        </AuthProvider>
    );
}
