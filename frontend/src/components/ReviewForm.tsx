import { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

interface ReviewFormProps {
    toolId: number;
    onSuccess?: () => void;
}

export default function ReviewForm({ toolId, onSuccess }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please log in to submit a review');
                return;
            }

            const res = await fetch(`/api/tools/${toolId}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    rating,
                    title: title || undefined,
                    body: body || undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to submit review');
            }

            // Reset form
            setRating(0);
            setTitle('');
            setBody('');

            alert('Review submitted successfully!');

            if (onSuccess) {
                onSuccess();
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-lg bg-white shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>

            {error && (
                <div className="mb-4 rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Rating */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating *
                    </label>
                    <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((value) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setRating(value)}
                                onMouseEnter={() => setHoverRating(value)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                            >
                                {value <= (hoverRating || rating) ? (
                                    <StarIcon className="h-8 w-8 text-yellow-400" />
                                ) : (
                                    <StarOutlineIcon className="h-8 w-8 text-gray-300" />
                                )}
                            </button>
                        ))}
                        <span className="ml-2 text-sm text-gray-500">
                            {rating > 0 ? `${rating} / 5` : 'Select rating'}
                        </span>
                    </div>
                </div>

                {/* Title */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Review Title (optional)
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={200}
                        placeholder="Summarize your experience"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">{title.length}/200</p>
                </div>

                {/* Body */}
                <div>
                    <label htmlFor="body" className="block text-sm font-medium text-gray-700">
                        Review (optional)
                    </label>
                    <textarea
                        id="body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        maxLength={2000}
                        rows={4}
                        placeholder="Share your thoughts about this tool"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">{body.length}/2000</p>
                </div>

                {/* Submit */}
                <div>
                    <button
                        type="submit"
                        disabled={loading || rating === 0}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            </form>
        </div>
    );
}
