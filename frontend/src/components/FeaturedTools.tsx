import { Link } from 'react-router-dom';
import { StarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/solid';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface Tool {
    id: number;
    name: string;
    slug: string;
    description: string;
    logo_url: string;
    categories: string[];
    pricing: string;
    average_rating: number;
    review_count: number;
    is_trending: boolean;
}

// Dummy data - replace with API call
const featuredTools: Tool[] = [
    {
        id: 1,
        name: 'ChatGPT',
        slug: 'chatgpt',
        description: 'Advanced AI chatbot for conversations, writing, coding, and more',
        logo_url: 'https://via.placeholder.com/80?text=GPT',
        categories: ['Writing', 'Chat'],
        pricing: 'Freemium',
        average_rating: 4.8,
        review_count: 1250,
        is_trending: true,
    },
    {
        id: 2,
        name: 'Midjourney',
        slug: 'midjourney',
        description: 'Create stunning AI-generated images from text descriptions',
        logo_url: 'https://via.placeholder.com/80?text=MJ',
        categories: ['Images'],
        pricing: 'Paid',
        average_rating: 4.9,
        review_count: 890,
        is_trending: true,
    },
    {
        id: 3,
        name: 'GitHub Copilot',
        slug: 'github-copilot',
        description: 'AI pair programmer that helps you write code faster',
        logo_url: 'https://via.placeholder.com/80?text=GH',
        categories: ['Code'],
        pricing: 'Paid',
        average_rating: 4.7,
        review_count: 650,
        is_trending: false,
    },
    {
        id: 4,
        name: 'Runway ML',
        slug: 'runway-ml',
        description: 'AI-powered video editing and generation platform',
        logo_url: 'https://via.placeholder.com/80?text=RW',
        categories: ['Video'],
        pricing: 'Freemium',
        average_rating: 4.6,
        review_count: 420,
        is_trending: true,
    },
];

export default function FeaturedTools() {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                        Featured AI Tools
                    </h2>
                    <p className="text-lg text-gray-600">
                        Hand-picked tools that are making waves
                    </p>
                </div>
                <Link
                    to="/tools"
                    className="hidden sm:inline-flex items-center gap-2 text-purple-600 font-semibold hover:gap-3 transition-all"
                >
                    View all
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredTools.map((tool) => (
                    <div
                        key={tool.id}
                        className="group bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 relative overflow-hidden"
                    >
                        {/* Trending Badge */}
                        {tool.is_trending && (
                            <div className="absolute top-3 right-3 flex items-center gap-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                <ArrowTrendingUpIcon className="w-3 h-3" />
                                Trending
                            </div>
                        )}

                        {/* Logo */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden mb-4 bg-gray-100 flex items-center justify-center">
                            <img
                                src={tool.logo_url}
                                alt={tool.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Content */}
                        <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                            {tool.name}
                        </h3>

                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {tool.description}
                        </p>

                        {/* Categories */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {tool.categories.slice(0, 2).map((category) => (
                                <span
                                    key={category}
                                    className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium"
                                >
                                    {category}
                                </span>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-1">
                                <StarIcon className="w-4 h-4 text-yellow-400" />
                                <span className="text-sm font-semibold text-gray-900">
                                    {tool.average_rating}
                                </span>
                                <span className="text-sm text-gray-500">
                                    ({tool.review_count})
                                </span>
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                                {tool.pricing}
                            </span>
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
                    to="/tools"
                    className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:gap-3 transition-all"
                >
                    View all tools
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </Link>
            </div>
        </section>
    );
}
