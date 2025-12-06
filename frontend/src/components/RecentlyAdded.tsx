import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClockIcon, StarIcon } from '@heroicons/react/24/solid';
import { apiUrl } from '../lib/constants';

interface Tool {
    id: number;
    name: string;
    slug: string;
    description: string;
    logo_url: string;
    categories: { name: string }[];
    pricing_type: string;
    average_rating: number | null;
    createdAt: string;
}

export default function RecentlyAdded() {
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const res = await fetch(`${apiUrl}/api/tools?sort=newest&perPage=6`);
                if (res.ok) {
                    const data = await res.json();
                    setTools(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch recent tools:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecent();
    }, []);

    if (loading) {
        return (
            <section className="bg-gradient-to-b from-white to-slate-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse space-y-8">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (tools.length === 0) return null;

    return (
        <section className="bg-gradient-to-b from-white to-slate-50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                            Recently Added
                        </h2>
                        <p className="text-lg text-gray-600">
                            Discover the latest AI tools in our directory
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tools.map((tool) => (
                        <Link
                            key={tool.id}
                            to={`/tools/${tool.slug}`}
                            className="group bg-white rounded-xl p-5 hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-purple-300"
                        >
                            <div className="flex items-start gap-4">
                                {/* Logo */}
                                <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-gray-100">
                                    <img
                                        src={tool.logo_url}
                                        alt={tool.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/default/tool.png';
                                        }}
                                    />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors truncate">
                                        {tool.name}
                                    </h3>

                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 h-10">
                                        {tool.description}
                                    </p>

                                    {/* Categories */}
                                    <div className="flex flex-wrap gap-1.5 mb-3 h-5 overflow-hidden">
                                        {tool.categories.slice(0, 2).map((category) => (
                                            <span
                                                key={category.name}
                                                className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full"
                                            >
                                                {category.name}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <ClockIcon className="w-3.5 h-3.5" />
                                            <span>{new Date(tool.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                        </div>
                                        {tool.average_rating && (
                                            <div className="flex items-center gap-1">
                                                <StarIcon className="w-3.5 h-3.5 text-yellow-400" />
                                                <span className="font-medium text-gray-900">{tool.average_rating}</span>
                                            </div>
                                        )}
                                        <span className="ml-auto font-medium text-gray-700 capitalize">
                                            {tool.pricing_type}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="text-center mt-8">
                    <Link
                        to="/tools?sort=newest"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105"
                    >
                        Explore All New Tools
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}
