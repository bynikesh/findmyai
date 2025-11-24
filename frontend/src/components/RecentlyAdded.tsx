import { Link } from 'react-router-dom';
import { ClockIcon, StarIcon } from '@heroicons/react/24/solid';

interface Tool {
    id: number;
    name: string;
    slug: string;
    description: string;
    logo_url: string;
    categories: string[];
    pricing: string;
    average_rating: number | null;
    createdAt: string;
}

// Dummy data - replace with API call
const recentTools: Tool[] = [
    {
        id: 5,
        name: 'Claude 3',
        slug: 'claude-3',
        description: 'Next-generation AI assistant with advanced reasoning capabilities',
        logo_url: 'https://via.placeholder.com/60?text=C3',
        categories: ['Chat', 'Writing'],
        pricing: 'Freemium',
        average_rating: 4.9,
        createdAt: '2024-03-01',
    },
    {
        id: 6,
        name: 'Sora',
        slug: 'sora',
        description: 'Text-to-video AI model that creates realistic videos',
        logo_url: 'https://via.placeholder.com/60?text=SR',
        categories: ['Video'],
        pricing: 'Coming Soon',
        average_rating: null,
        createdAt: '2024-02-25',
    },
    {
        id: 7,
        name: 'Gemini Ultra',
        slug: 'gemini-ultra',
        description: 'Google\'s most capable multimodal AI model',
        logo_url: 'https://via.placeholder.com/60?text=GM',
        categories: ['Chat', 'Code'],
        pricing: 'Paid',
        average_rating: 4.7,
        createdAt: '2024-02-20',
    },
    {
        id: 8,
        name: 'ElevenLabs',
        slug: 'elevenlabs',
        description: 'Advanced AI voice synthesis and cloning',
        logo_url: 'https://via.placeholder.com/60?text=11',
        categories: ['Audio'],
        pricing: 'Freemium',
        average_rating: 4.8,
        createdAt: '2024-02-15',
    },
    {
        id: 9,
        name: 'Perplexity Pro',
        slug: 'perplexity-pro',
        description: 'AI-powered search engine with citations',
        logo_url: 'https://via.placeholder.com/60?text=PX',
        categories: ['Chat', 'Analytics'],
        pricing: 'Paid',
        average_rating: 4.6,
        createdAt: '2024-02-10',
    },
    {
        id: 10,
        name: 'Stable Diffusion 3',
        slug: 'stable-diffusion-3',
        description: 'Latest version of the popular image generation model',
        logo_url: 'https://via.placeholder.com/60?text=SD',
        categories: ['Images'],
        pricing: 'Free',
        average_rating: 4.5,
        createdAt: '2024-02-05',
    },
];

export default function RecentlyAdded() {
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
                    {recentTools.map((tool) => (
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
                                    />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors truncate">
                                        {tool.name}
                                    </h3>

                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                        {tool.description}
                                    </p>

                                    {/* Categories */}
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {tool.categories.slice(0, 2).map((category) => (
                                            <span
                                                key={category}
                                                className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full"
                                            >
                                                {category}
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
                                        <span className="ml-auto font-medium text-gray-700">
                                            {tool.pricing}
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
