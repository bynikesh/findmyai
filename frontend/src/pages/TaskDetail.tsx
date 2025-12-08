import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiUrl } from 'lib/constants';

interface Tool {
    id: number;
    name: string;
    slug: string;
    short_description?: string;
    logo_url?: string;
    pricing_type?: string;
    categories: Array<{ id: number; name: string; slug: string }>;
}

interface TaskDetail {
    id: number;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
}

export default function TaskDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const [task, setTask] = useState<TaskDetail | null>(null);
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            if (!slug) return;
            setLoading(true);
            try {
                const res = await fetch(`${apiUrl}/api/tasks/${slug}?page=${page}&perPage=12`);
                if (res.ok) {
                    const data = await res.json();
                    setTask(data.task);
                    setTools(data.tools);
                    setTotalPages(data.meta?.totalPages || 1);
                }
            } catch (error) {
                console.error('Error fetching task:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug, page]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Task Not Found</h1>
                    <p className="text-gray-600 mb-4">This task doesn't exist.</p>
                    <Link to="/tools" className="text-purple-600 hover:underline">
                        Browse all tools →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <p className="text-purple-200 font-medium mb-2">AI Tools To</p>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">{task.name}</h1>
                        {task.description && (
                            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
                                {task.description}
                            </p>
                        )}
                        <p className="mt-4 text-purple-200">
                            {tools.length} tools available
                        </p>
                    </div>
                </div>
            </div>

            {/* Tools Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {tools.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No tools found for this task yet.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tools.map((tool) => (
                                <Link
                                    key={tool.id}
                                    to={`/tools/${tool.slug}`}
                                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100"
                                >
                                    <div className="flex items-start gap-4">
                                        <img
                                            src={tool.logo_url || '/default/tool.png'}
                                            alt={tool.name}
                                            className="w-12 h-12 rounded-lg object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/default/tool.png';
                                            }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 truncate">
                                                {tool.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                                                {tool.short_description || 'AI-powered tool'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                            {tool.pricing_type || 'Free'}
                                        </span>
                                        {tool.categories?.[0] && (
                                            <span className="text-xs text-gray-500">
                                                {tool.categories[0].name}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 text-gray-600">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
