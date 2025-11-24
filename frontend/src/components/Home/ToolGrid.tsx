import { useState, useEffect } from 'react';
import ToolCard, { Tool } from './ToolCard';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export default function ToolGrid() {
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchTools = async (pageNum: number) => {
        try {
            const res = await fetch(`/api/tools?page=${pageNum}&perPage=12&sort=popular`);
            if (!res.ok) throw new Error('Failed to fetch tools');
            const json = await res.json();
            const mapped = json.data.map((t: any) => ({
                id: t.id,
                name: t.name,
                slug: t.slug,
                description: t.description,
                logo_url: t.logo_url || '',
                image_url: t.screenshots && t.screenshots.length > 0 ? t.screenshots[0] : undefined,
                categories: t.categories ? t.categories.map((c: any) => c.name) : [],
                likes: Math.floor(Math.random() * 1000) + 50,
                views: `${Math.floor(Math.random() * 50) + 1}k`,
                author: {
                    name: t.author?.name || t.name,
                    avatar: t.logo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.id}`,
                    pro: false,
                },
            }));
            if (pageNum === 1) {
                setTools(mapped);
            } else {
                setTools(prev => [...prev, ...mapped]);
            }

            setHasMore(json.meta.page < json.meta.totalPages);
        } catch (error) {
            console.error('Error fetching tools:', error);
            setTools([]); // Clear tools on error
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 aspect-[4/3] rounded-lg mb-3"></div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                                    <div className="w-24 h-4 bg-gray-200 rounded"></div>
                                </div>
                                <div className="w-12 h-4 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-10">
                {tools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                ))}
            </div>

            {hasMore && (
                <div className="mt-16 text-center">
                    <button
                        onClick={handleLoadMore}
                        className="bg-white border border-gray-200 text-gray-700 font-medium px-8 py-3 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow flex items-center gap-2 mx-auto"
                    >
                        {loading ? (
                            <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        ) : (
                            'Load more shots'
                        )}
                    </button>
                </div>
            )}
        </section>
    );
}
