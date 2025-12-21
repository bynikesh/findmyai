import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { apiUrl } from '../lib/constants';

interface User {
    id: number;
    email: string;
    name: string | null;
    role: string;
    avatar_url: string | null;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!user;
    const isAdmin = user?.role === 'ADMIN';

    const login = useCallback((newToken: string, newUser: User) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(newUser);
        window.dispatchEvent(new Event('auth-change'));
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        window.dispatchEvent(new Event('auth-change'));
    }, []);

    const refreshUser = useCallback(async () => {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
            setUser(null);
            setToken(null);
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch(`${apiUrl}/api/auth/me`, {
                headers: {
                    Authorization: `Bearer ${storedToken}`,
                },
            });

            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
                setToken(storedToken);
            } else {
                // Token invalid, clear it
                localStorage.removeItem('token');
                setUser(null);
                setToken(null);
            }
        } catch (error) {
            console.error('Failed to refresh user:', error);
            localStorage.removeItem('token');
            setUser(null);
            setToken(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initialize auth state on mount
    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    // Listen for auth-change events from other components
    useEffect(() => {
        const handleAuthChange = () => {
            refreshUser();
        };

        window.addEventListener('auth-change', handleAuthChange);
        return () => window.removeEventListener('auth-change', handleAuthChange);
    }, [refreshUser]);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated,
                isAdmin,
                isLoading,
                login,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
