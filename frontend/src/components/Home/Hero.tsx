import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const POPULAR_TAGS = ['Writing', 'Image Generator', 'Video', 'Code Assistant', 'Marketing'];

export default function Hero() {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/tools?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <section className="relative bg-white text-center pt-16 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Badge/Pill */}
                <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 px-4 py-1.5 rounded-full text-sm font-medium mb-8 animate-fade-in-up">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                    </span>
                    Over 200+ AI Tools Available
                </div>

                {/* Headline */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-tight mb-6 font-display">
                    Discover the World’s Top <br className="hidden sm:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-600">
                        AI Tools & Resources
                    </span>
                </h1>

                {/* Subheadline */}
                <p className="text-lg sm:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Explore work from the most talented and accomplished AI developers ready to take on your next project.
                </p>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-8">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-14 pr-5 py-4 bg-white border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all shadow-sm hover:shadow-md text-lg"
                            placeholder="What are you looking for?"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </form>

                {/* Popular Tags */}
                <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                    <span>Trending Searches:</span>
                    {POPULAR_TAGS.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => navigate(`/tools?search=${encodeURIComponent(tag)}`)}
                            className="text-gray-600 hover:text-pink-600 border border-gray-200 hover:border-pink-200 px-3 py-1 rounded-full transition-colors bg-white"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
