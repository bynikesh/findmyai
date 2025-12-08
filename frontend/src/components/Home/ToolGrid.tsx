import { useState, useEffect } from 'react';
import ToolCard from '../ToolCard';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { apiUrl } from 'lib/constants';

interface Tool {
    id: number;
    name: string;
    slug: string;
    description: string;
    short_description?: string;
    logo_url?: string | null;
    pricing?: string;
    pricing_type?: string;
    verified?: boolean;
    categories: { name: string; slug: string }[];
}

// Skeleton for loading state (matches Bento card design)
function ToolCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
            <div className="flex justify-between mb-4">
                <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
            <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            </div>
        </div>
    );
}

export default function ToolGrid() {
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchTools = async (pageNum: number) => {
        try {
            setLoading(true);
            const res = await fetch(`${apiUrl}/api/tools?page=${pageNum}&perPage=12&sort=popular`);
            if (!res.ok) throw new Error('Failed to fetch tools');
            const json = await res.json();

            const mapped: Tool[] = json.data.map((t: any) => ({
                id: t.id,
                name: t.name,
                slug: t.slug,
                description: t.description || '',
                short_description: t.short_description,
                logo_url: t.logo_url,
                pricing: t.pricing || 'Free',
                pricing_type: t.pricing_type,
                verified: t.verified || false,
                categories: t.categories || [],
            }));

            if (pageNum === 1) {
                setTools(mapped);
            } else {
                setTools(prev => [...prev, ...mapped]);
            }

            setHasMore(json.meta.page < json.meta.totalPages);
        } catch (error) {
            console.error('Error fetching tools:', error);
            setTools([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTools(1);
    }, []);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchTools(nextPage);
    };

    if (loading && tools.length === 0) {
        return (
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {[...Array(8)].map((_, i) => (
                        <ToolCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {tools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                ))}
            </div>

            {hasMore && (
                <div className="mt-12 text-center">
                    <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="bg-white border border-gray-300 text-gray-700 font-medium px-8 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm flex items-center gap-2 mx-auto disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            'Load More Tools'
                        )}
                    </button>
                </div>
            )}
        </section>
    );
}
