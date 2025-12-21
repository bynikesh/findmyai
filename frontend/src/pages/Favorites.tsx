import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import { HeartIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, TrashIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';

export default function Favorites() {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { favorites, isLoading, fetchFavorites, removeFavorite } = useFavorites();
    const [removingId, setRemovingId] = useState<number | null>(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [authLoading, isAuthenticated, navigate]);

    // Fetch favorites on mount
    useEffect(() => {
        if (isAuthenticated) {
            fetchFavorites();
        }
    }, [isAuthenticated, fetchFavorites]);

    const handleRemove = async (toolId: number) => {
        setRemovingId(toolId);
        await removeFavorite(toolId);
        setRemovingId(null);
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                            <HeartIconSolid className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">
                                My Favorites
                            </h1>
                            <p className="mt-1 text-lg text-white/80">
                                Your bookmarked AI tools collection
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {favorites.length === 0 ? (
                    <div className="text-center py-16">
                        <HeartIcon className="mx-auto h-16 w-16 text-gray-300" />
                        <h3 className="mt-4 text-xl font-semibold text-gray-900">
                            No favorites yet
                        </h3>
                        <p className="mt-2 text-gray-500 max-w-md mx-auto">
                            Start exploring AI tools and click the heart icon to save your favorites here.
                        </p>
                        <Link
                            to="/tools"
                            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            Explore AI Tools
                            <ArrowRightIcon className="h-4 w-4" />
                        </Link>
                    </div>
                ) : (
                    <>
                        <p className="text-gray-600 mb-8">
                            You have {favorites.length} saved tool{favorites.length !== 1 ? 's' : ''}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {favorites.map((favorite) => (
                                <div
                                    key={favorite.id}
                                    className={clsx(
                                        'group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300',
                                        removingId === favorite.toolId && 'opacity-50 scale-95'
                                    )}
                                >
                                    {/* Remove Button */}
                                    <button
                                        onClick={() => handleRemove(favorite.toolId)}
                                        disabled={removingId === favorite.toolId}
                                        className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                                        aria-label="Remove from favorites"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>

                                    <Link to={`/tools/${favorite.tool.slug}`} className="block p-6">
                                        <div className="flex items-start gap-4">
                                            {/* Logo */}
                                            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center overflow-hidden">
                                                {favorite.tool.logo_url ? (
                                                    <img
                                                        src={favorite.tool.logo_url}
                                                        alt={favorite.tool.name}
                                                        className="w-10 h-10 object-contain"
                                                    />
                                                ) : (
                                                    <span className="text-2xl font-bold text-gray-400">
                                                        {favorite.tool.name.charAt(0)}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                                                    {favorite.tool.name}
                                                </h3>
                                                {favorite.tool.categories.length > 0 && (
                                                    <p className="text-sm text-indigo-600 font-medium">
                                                        {favorite.tool.categories[0].name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {favorite.tool.short_description && (
                                            <p className="mt-4 text-sm text-gray-600 line-clamp-2">
                                                {favorite.tool.short_description}
                                            </p>
                                        )}

                                        {/* Footer */}
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex flex-wrap gap-1.5">
                                                {favorite.tool.pricing_type.slice(0, 2).map((type) => (
                                                    <span
                                                        key={type}
                                                        className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600"
                                                    >
                                                        {type}
                                                    </span>
                                                ))}
                                            </div>
                                            {favorite.tool.average_rating && favorite.tool.average_rating > 0 && (
                                                <div className="flex items-center gap-1 text-sm text-amber-600">
                                                    <span>★</span>
                                                    <span className="font-medium">
                                                        {favorite.tool.average_rating.toFixed(1)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
