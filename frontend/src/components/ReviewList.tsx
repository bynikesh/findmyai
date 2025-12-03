import { useEffect, useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { apiUrl } from 'lib/constants';

interface Review {
    id: number;
    rating: number;
    title?: string;
    body?: string;
    createdAt: string;
    user: {
        name: string;
        avatar_url?: string;
    };
}

interface ReviewListProps {
    toolId: number;
}

export default function ReviewList({ toolId }: ReviewListProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${apiUrl}/api/tools/${toolId}/reviews?page=${page}&perPage=5`);
                if (!res.ok) throw new Error('Failed to fetch reviews');

                const data = await res.json();
                setReviews(data.data || []);
                setTotalPages(data.meta?.totalPages || 1);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [toolId, page]);

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>No reviews yet. Be the first to review this tool!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                {review.user.avatar_url ? (
                                    <img
                                        src={review.user.avatar_url}
                                        alt={review.user.name}
                                        className="h-10 w-10 rounded-full"
                                    />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-sm font-medium text-gray-600">
                                            {review.user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">{review.user.name}</p>
                                <p className="text-xs text-gray-500">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <StarIcon
                                    key={i}
                                    className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {review.title && (
                        <h4 className="mt-3 text-sm font-semibold text-gray-900">{review.title}</h4>
                    )}

                    {review.body && (
                        <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{review.body}</p>
                    )}
                </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 pt-4">
                    <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-700">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
