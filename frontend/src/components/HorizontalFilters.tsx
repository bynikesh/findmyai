import { useEffect, useState } from 'react';
import { useSearchFilters } from '../hooks/useSearchFilters';
import { apiUrl } from '../lib/constants';

interface Category {
    id: number;
    name: string;
    slug: string;
}

export default function HorizontalFilters() {
    const { filters, toggleFilter, setSort } = useSearchFilters();
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        fetch(`${apiUrl}/api/categories`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch categories');
                return res.json();
            })
            .then(data => setCategories(data || []))
            .catch(err => {
                console.error(err);
                setCategories([]);
            });
    }, []);

    const handleCategoryClick = (slug: string) => {
        toggleFilter('category', slug);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSort(e.target.value as 'newest' | 'popular');
    };

    return (
        <div className="border-b border-gray-200 bg-white sticky top-16 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4 py-4 overflow-x-auto">
                    {/* Sort Dropdown */}
                    <select
                        value={filters.sort}
                        onChange={handleSortChange}
                        className="px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                    >
                        <option value="popular">Popular</option>
                        <option value="newest">Newest</option>
                    </select>

                    {/* Category Pills */}
                    {categories.map((category) => {
                        const isActive = filters.category.includes(category.slug);
                        return (
                            <button
                                key={category.id}
                                onClick={() => handleCategoryClick(category.slug)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${isActive
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                                    }`}
                            >
                                {category.name}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
