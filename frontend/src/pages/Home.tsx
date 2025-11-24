import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    SparklesIcon,
    MagnifyingGlassIcon,
    PencilSquareIcon,
    PhotoIcon,
    VideoCameraIcon,
    CodeBracketIcon,
    ChartBarIcon,
    ChatBubbleLeftRightIcon,
    CubeTransparentIcon,
    MusicalNoteIcon
} from '@heroicons/react/24/outline';

interface Category {
    id: string;
    name: string;
    icon: typeof SparklesIcon;
    count: number;
    gradient: string;
}

const categories: Category[] = [
    { id: 'writing', name: 'Writing', icon: PencilSquareIcon, count: 42, gradient: 'from-blue-500 to-cyan-500' },
    { id: 'images', name: 'Images', icon: PhotoIcon, count: 38, gradient: 'from-purple-500 to-pink-500' },
    { id: 'video', name: 'Video', icon: VideoCameraIcon, count: 25, gradient: 'from-orange-500 to-red-500' },
    { id: 'code', name: 'Code', icon: CodeBracketIcon, count: 31, gradient: 'from-green-500 to-emerald-500' },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon, count: 19, gradient: 'from-indigo-500 to-blue-500' },
    { id: 'chat', name: 'Chat', icon: ChatBubbleLeftRightIcon, count: 28, gradient: 'from-pink-500 to-rose-500' },
    { id: '3d', name: '3D & Design', icon: CubeTransparentIcon, count: 15, gradient: 'from-violet-500 to-purple-500' },
    { id: 'audio', name: 'Audio', icon: MusicalNoteIcon, count: 22, gradient: 'from-yellow-500 to-orange-500' },
];

export default function Home() {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/tools?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                        backgroundSize: '40px 40px'
                    }} />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
                    <div className="text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
                            <SparklesIcon className="w-5 h-5 text-yellow-300" />
                            <span className="text-sm font-medium">Discover 200+ AI Tools</span>
                        </div>

                        {/* Heading */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
                            Find the Perfect
                            <br />
                            <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                                AI Tool for Your Needs
                            </span>
                        </h1>

                        <p className="text-lg sm:text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
                            Browse, compare, and discover the best AI tools. From writing assistants to image generators.
                        </p>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search AI tools... (e.g., 'writing assistant', 'image generator')"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-14 pr-4 py-4 sm:py-5 text-lg rounded-2xl border-2 border-white/20 bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-transparent shadow-xl transition"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 sm:py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105"
                                >
                                    Search
                                </button>
                            </div>
                        </form>

                        {/* Quick Links */}
                        <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
                            <span className="text-purple-200">Popular:</span>
                            {['ChatGPT', 'Midjourney', 'Notion AI', 'Copilot'].map((tool) => (
                                <Link
                                    key={tool}
                                    to={`/tools?search=${tool}`}
                                    className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full transition backdrop-blur-sm border border-white/20"
                                >
                                    {tool}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg className="w-full h-12 sm:h-20 fill-current text-slate-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
                    </svg>
                </div>
            </section>

            {/* Categories Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        Browse by Category
                    </h2>
                    <p className="text-lg text-gray-600">
                        Explore AI tools organized by their primary function
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                            <Link
                                key={category.id}
                                to={`/tools?category=${category.id}`}
                                className="group relative bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1"
                            >
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">
                                    {category.name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {category.count} tools
                                </p>
                            </Link>
                        );
                    })}
                </div>

                <div className="text-center mt-8">
                    <Link
                        to="/tools"
                        className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:gap-3 transition-all"
                    >
                        View all categories
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </div>
            </section>
        </div>
    );
}
