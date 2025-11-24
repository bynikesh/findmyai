import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface AdminGuardProps {
    children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdmin = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                // Decode JWT to check role (basic client-side check)
                const payload = JSON.parse(atob(token.split('.')[1]));
                setIsAdmin(payload.role === 'ADMIN');
            } catch (error) {
                console.error('Failed to decode token:', error);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        checkAdmin();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-gray-500">Loading...</div>
            </div>
        );
    }

    if (!isAdmin) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
