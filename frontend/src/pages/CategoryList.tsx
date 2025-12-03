import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackCategoryView } from '../lib/analytics';

interface Category {
    id: number;
    name: string;
    slug: string;
    featured?: boolean;
    seo_description?: string | null;
    seo_content?: string | null;
}

export default function CategoryList() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        fetch(`${apiUrl}/api/categories`)
            .then(res => (res.ok ? res.json() : []))
            .then(data => {
                setCategories(data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch categories', err);
                setCategories([]);
                setLoading(false);
            });
    }, []);

    const handleCategoryClick = (slug: string, id: number) => {
        trackCategoryView(id);
        navigate(`/tools?category=${slug}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">Explore Categories</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Browse AI tools by category. Click a category to see the tools inside.
                    </p>
                </div>
            </div>

            {/* Category Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
                            >
                                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                                <div className="h-4 bg-gray-200 rounded w-5/6" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat.slug, cat.id)}
                                className="text-left bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl transition-shadow"
                            >
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">{cat.name}</h2>
                                {cat.seo_description && (
                                    <p className="text-gray-600 text-sm line-clamp-3">{cat.seo_description}</p>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
