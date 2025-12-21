import { useState } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { apiUrl } from '../lib/constants';

interface FavoriteButtonProps {
    toolId: number;
    initialFavorited?: boolean;
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
    className?: string;
    onToggle?: (isFavorited: boolean) => void;
}

export default function FavoriteButton({
    toolId,
    initialFavorited = false,
    size = 'md',
    showText = false,
    className = '',
    onToggle,
}: FavoriteButtonProps) {
    const { token, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isFavorited, setIsFavorited] = useState(initialFavorited);
    const [isLoading, setIsLoading] = useState(false);

    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
    };

    const buttonPadding = {
        sm: 'p-1',
        md: 'p-1.5',
        lg: 'p-2',
    };

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (isLoading) return;

        setIsLoading(true);
        try {
            const method = isFavorited ? 'DELETE' : 'POST';
            const res = await fetch(`${apiUrl}/api/favorites/${toolId}`, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                setIsFavorited(!isFavorited);
                onToggle?.(!isFavorited);
            }
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const IconComponent = isFavorited ? HeartIconSolid : HeartIcon;

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className={clsx(
                'inline-flex items-center gap-1.5 rounded-lg transition-all duration-200',
                buttonPadding[size],
                isFavorited
                    ? 'text-red-500 hover:text-red-600'
                    : 'text-gray-400 hover:text-red-500',
                isLoading && 'opacity-50 cursor-not-allowed',
                className
            )}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
            <IconComponent
                className={clsx(
                    sizeClasses[size],
                    'transition-transform duration-200',
                    !isLoading && 'hover:scale-110',
                    isLoading && 'animate-pulse'
                )}
            />
            {showText && (
                <span className="text-sm font-medium">
                    {isFavorited ? 'Saved' : 'Save'}
                </span>
            )}
        </button>
    );
}
