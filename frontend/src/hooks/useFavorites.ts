import { useState, useEffect, useCallback } from 'react';
import { apiUrl } from '../lib/constants';
import { useAuth } from '../contexts/AuthContext';

interface Tool {
    id: number;
    name: string;
    slug: string;
    short_description: string | null;
    logo_url: string | null;
    pricing_type: string[];
    average_rating: number | null;
    categories: Array<{ id: number; name: string; slug: string }>;
}

interface Favorite {
    id: number;
    toolId: number;
    createdAt: string;
    tool: Tool;
}

export function useFavorites() {
    const { token, isAuthenticated } = useAuth();
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(false);

    // Fetch all favorites with tool details
    const fetchFavorites = useCallback(async () => {
        if (!token) return;

        setIsLoading(true);
        try {
            const res = await fetch(`${apiUrl}/api/favorites`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                setFavorites(data.favorites);
                setFavoriteIds(new Set(data.favorites.map((f: Favorite) => f.toolId)));
            }
        } catch (error) {
            console.error('Failed to fetch favorites:', error);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    // Fetch just the favorite IDs for quick lookup
    const fetchFavoriteIds = useCallback(async () => {
        if (!token) return;

        try {
            const res = await fetch(`${apiUrl}/api/favorites/ids`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                setFavoriteIds(new Set(data.favoriteIds));
            }
        } catch (error) {
            console.error('Failed to fetch favorite IDs:', error);
        }
    }, [token]);

    // Add a tool to favorites
    const addFavorite = useCallback(async (toolId: number): Promise<boolean> => {
        if (!token) return false;

        try {
            const res = await fetch(`${apiUrl}/api/favorites/${toolId}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                setFavoriteIds((prev) => new Set([...prev, toolId]));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to add favorite:', error);
            return false;
        }
    }, [token]);

    // Remove a tool from favorites
    const removeFavorite = useCallback(async (toolId: number): Promise<boolean> => {
        if (!token) return false;

        try {
            const res = await fetch(`${apiUrl}/api/favorites/${toolId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                setFavoriteIds((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(toolId);
                    return newSet;
                });
                setFavorites((prev) => prev.filter((f) => f.toolId !== toolId));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to remove favorite:', error);
            return false;
        }
    }, [token]);

    // Toggle favorite status
    const toggleFavorite = useCallback(async (toolId: number): Promise<boolean> => {
        if (favoriteIds.has(toolId)) {
            return removeFavorite(toolId);
        } else {
            return addFavorite(toolId);
        }
    }, [favoriteIds, addFavorite, removeFavorite]);

    // Check if a tool is favorited
    const isFavorited = useCallback((toolId: number): boolean => {
        return favoriteIds.has(toolId);
    }, [favoriteIds]);

    // Fetch favorite IDs when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchFavoriteIds();
        } else {
            setFavorites([]);
            setFavoriteIds(new Set());
        }
    }, [isAuthenticated, fetchFavoriteIds]);

    return {
        favorites,
        favoriteIds,
        isLoading,
        fetchFavorites,
        fetchFavoriteIds,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorited,
    };
}
