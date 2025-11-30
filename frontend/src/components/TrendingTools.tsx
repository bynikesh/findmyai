import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/solid';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

interface Category {
    name: string;
    slug: string;
}

interface Tool {
    id: number;
    name: string;
    slug: string;
    description: string;
    logo_url: string | null;
    average_rating: number | null;
    review_count: number;
    trending_score: number | null;
    categories: Category[];
}

export default function TrendingTools() {
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTrendingTools = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                const response = await axios.get(`${apiUrl}/api/tools/trending`);

                if (Array.isArray(response.data)) {
                    setTools(response.data);
                } else {
                    console.error('Received invalid data format:', response.data);
                    setTools([]);
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching trending tools:', err);
                setError('Failed to load trending tools');
                setLoading(false);
            }
        };

        fetchTrendingTools();
    }, []);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error || tools.length === 0) {
        return null; // Hide section if error or no tools
    }

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-b from-white to-purple-50/30 rounded-3xl my-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <ArrowTrendingUpIcon className="w-6 h-6 text-orange-500" />
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                            Trending Now
                        </h2>
                    </div>
                    <p className="text-lg text-gray-600">
                        The hottest AI tools everyone is using right now
                    </p>
                </div>
                <Link
                    to="/tools?sort=popular"
                    className="hidden sm:inline-flex items-center gap-2 text-purple-600 font-semibold hover:gap-3 transition-all"
                >
                    View all trending
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {tools.map((tool) => (
                    <div
                        key={tool.id}
                        className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 relative overflow-hidden"
                    >
                        {/* Logo */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden mb-4 bg-gray-100 flex items-center justify-center border border-gray-100">
                            {tool.logo_url ? (
                                <img
                                    src={tool.logo_url}
                                    alt={tool.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-2xl font-bold text-gray-400">
                                    {tool.name.charAt(0)}
                                </span>
                            )}
                        </div>

                        {/* Content */}
                        <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-purple-600 transition-colors truncate">
                            {tool.name}
                        </h3>

                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 h-10">
                            {tool.description}
                        </p>

                        {/* Categories */}
                        <div className="flex flex-wrap gap-2 mb-4 h-6 overflow-hidden">
                            {tool.categories.slice(0, 2).map((category) => (
                                <span
                                    key={category.slug}
                                    className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium"
                                >
                                    {category.name}
                                </span>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-1">
                                <StarIcon className="w-4 h-4 text-yellow-400" />
                                <span className="text-sm font-semibold text-gray-900">
                                    {tool.average_rating ? tool.average_rating.toFixed(1) : 'N/A'}
                                </span>
                                <span className="text-sm text-gray-500">
                                    ({tool.review_count})
                                </span>
                            </div>
                        </div>

                        {/* Hover Overlay */}
                        <Link
                            to={`/tools/${tool.slug}`}
                            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-600/95 to-pink-600/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        >
                            <div className="text-white text-center">
                                <ArrowTopRightOnSquareIcon className="w-8 h-8 mx-auto mb-2" />
                                <span className="font-semibold">View Details</span>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            <div className="text-center mt-8 sm:hidden">
                <Link
                    to="/tools?sort=popular"
                    className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:gap-3 transition-all"
                >
                    View all trending
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </Link>
            </div>
        </section>
    );
}
