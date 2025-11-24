import { useState } from 'react';
import { AdjustmentsHorizontalIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const CATEGORIES = [
    'Discover',
    'Animation',
    'Branding',
    'Illustration',
    'Mobile',
    'Print',
    'Product Design',
    'Typography',
    'Web Design',
    'Writing',
    'Coding',
    'Audio'
];

export default function FilterBar() {
    const [activeCategory, setActiveCategory] = useState('Discover');

    return (
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left: Dropdown (Mobile/Desktop) */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <button className="flex items-center gap-2 text-gray-700 font-medium border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
                            Popular
                            <ChevronDownIcon className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Middle: Scrollable Categories (Desktop) */}
                    <div className="hidden lg:flex items-center gap-1 overflow-x-auto no-scrollbar py-2 mask-linear-fade">
                        <button className="flex items-center gap-2 text-gray-700 font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors mr-4">
                            Popular
                            <ChevronDownIcon className="w-4 h-4" />
                        </button>

                        <div className="h-6 w-px bg-gray-200 mx-2"></div>

                        {CATEGORIES.map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeCategory === category
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Right: Filters Button */}
                    <div className="flex items-center gap-3 ml-auto pl-4">
                        <button className="flex items-center gap-2 text-gray-700 font-medium border border-gray-200 rounded-full px-4 py-2 hover:bg-gray-50 transition-colors text-sm">
                            <AdjustmentsHorizontalIcon className="w-4 h-4" />
                            Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
