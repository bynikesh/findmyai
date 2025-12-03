import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderIcon } from '@heroicons/react/24/outline';
import { apiUrl } from '../../../lib/constants';

interface FeaturedCategory {
    id: number;
    name: string;
    slug: string;
    _count: {
        tools: number;
    };
}

export default function FeaturedCategories() {
    const [categories, setCategories] = useState<FeaturedCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeaturedCategories();
    }, []);

    const fetchFeaturedCategories = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/categories/featured`);
            const data = await res.json();
            setCategories(data || []);
        } catch (error) {
            console.error('Failed to fetch featured categories:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || categories.length === 0) {
        return null;
    }

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Featured Categories</h2>
                    <p className="mt-2 text-lg text-gray-600">
                        Explore our most popular AI tool categories
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            to={`/tools?category=${category.slug}`}
                            className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 hover:border-blue-500"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                    <FolderIcon className="h-6 w-6 text-blue-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-500">
                                    {category._count.tools} {category._count.tools === 1 ? 'tool' : 'tools'}
                                </span>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {category.name}
                            </h3>

                            <div className="mt-4 flex items-center text-sm text-blue-600 font-medium">
                                Explore
                                <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
