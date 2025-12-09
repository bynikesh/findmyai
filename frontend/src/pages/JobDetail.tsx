import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ToolCard from '../components/ToolCard';
import { apiUrl } from 'lib/constants';

interface Tool {
    id: number;
    name: string;
    slug: string;
    description: string;
    short_description?: string;
    logo_url?: string | null;
    pricing?: string;
    pricing_type?: string[];
    verified?: boolean;
    categories: { name: string; slug: string }[];
}

interface JobDetail {
    id: number;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
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

export default function JobDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const [job, setJob] = useState<JobDetail | null>(null);
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            if (!slug) return;
            setLoading(true);
            try {
                const res = await fetch(`${apiUrl}/api/jobs/${slug}?page=${page}&perPage=12`);
                if (res.ok) {
                    const data = await res.json();
                    setJob(data.job);
                    // Map tools to include required fields
                    const mappedTools: Tool[] = (data.tools || []).map((t: any) => ({
                        id: t.id,
                        name: t.name,
                        slug: t.slug,
                        description: t.short_description || t.description || '',
                        short_description: t.short_description,
                        logo_url: t.logo_url,
                        pricing: t.pricing || t.pricing_type || 'Free',
                        pricing_type: t.pricing_type,
                        verified: t.verified || false,
                        categories: t.categories || [],
                    }));
                    setTools(mappedTools);
                    setTotalPages(data.meta?.totalPages || 1);
                }
            } catch (error) {
                console.error('Error fetching job:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug, page]);

    if (loading && !job) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center animate-pulse">
                            <div className="h-4 bg-emerald-400/50 rounded w-24 mx-auto mb-4"></div>
                            <div className="h-12 bg-emerald-400/50 rounded w-64 mx-auto mb-4"></div>
                            <div className="h-6 bg-emerald-400/50 rounded w-96 mx-auto"></div>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {[...Array(8)].map((_, i) => (
                            <ToolCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h1>
                    <p className="text-gray-600 mb-4">This job role doesn't exist.</p>
                    <Link to="/tools" className="text-emerald-600 hover:underline">
                        Browse all tools →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <p className="text-emerald-200 font-medium mb-2">AI Tools For</p>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">{job.name}</h1>
                        {job.description && (
                            <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
                                {job.description}
                            </p>
                        )}
                        <p className="mt-4 text-emerald-200">
                            {tools.length} tools available
                        </p>
                    </div>
                </div>
            </div>

            {/* Tools Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {tools.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No tools found for this job role yet.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {tools.map((tool) => (
                                <ToolCard key={tool.id} tool={tool} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-10 flex justify-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-6 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-all"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2.5 text-gray-600">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-6 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
