import { Link } from 'react-router-dom';
import {
    PencilSquareIcon,
    PhotoIcon,
    VideoCameraIcon,
    CodeBracketIcon,
    ChartBarIcon,
    ChatBubbleLeftRightIcon,
    CubeTransparentIcon,
    MusicalNoteIcon
} from '@heroicons/react/24/outline';
import Hero from '../components/Home/Hero';
import FeaturedTools from '../components/FeaturedTools';
import RecentlyAdded from '../components/RecentlyAdded';
import TrendingTools from '../components/TrendingTools';

interface Category {
    id: string;
    name: string;
    icon: typeof PencilSquareIcon;
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
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <Hero />

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

            {/* Trending Tools */}
            <TrendingTools />

            {/* Featured Tools */}
            <FeaturedTools />

            {/* Recently Added */}
            <RecentlyAdded />
        </div>
    );
}
