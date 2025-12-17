import { useEffect, useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon, BriefcaseIcon, ClipboardDocumentListIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import ToolCard from '../components/ToolCard';
import { useSearchParams, Link } from 'react-router-dom';
import { trackCategoryView } from '../lib/analytics';
import { apiUrl } from 'lib/constants';

interface Tool {
    id: number;
    name: string;
    slug: string;
    description: string;
    short_description?: string;
    pricing: string;
    pricing_type?: string[];
    categories: { name: string; slug: string }[];
    logo_url?: string | null;
    verified?: boolean;
}

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Job {
    id: number;
    name: string;
    slug: string;
    _count?: { tools: number };
}

interface Task {
    id: number;
    name: string;
    slug: string;
    _count?: { tools: number };
}

// Loading Skeleton Component
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

export default function ToolList() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [tools, setTools] = useState<Tool[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState<any>(null);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Filter states
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [selectedJob, setSelectedJob] = useState(searchParams.get('job') || '');
    const [selectedTask, setSelectedTask] = useState(searchParams.get('task') || '');
    const [selectedPricing, setSelectedPricing] = useState<string[]>(
        searchParams.get('pricing')?.split(',').filter(Boolean) || []
    );
    const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get('verified') === 'true');
    const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'newest');
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch categories, jobs, and tasks
    useEffect(() => {
        // Fetch categories
        fetch(`${apiUrl}/api/categories`)
            .then(res => (res.ok ? res.json() : []))
            .then(data => setCategories(data || []))
            .catch(() => setCategories([]));

        // Fetch jobs
        fetch(`${apiUrl}/api/jobs`)
            .then(res => (res.ok ? res.json() : { jobs: [] }))
            .then(data => setJobs(data.jobs || []))
            .catch(() => setJobs([]));

        // Fetch tasks
        fetch(`${apiUrl}/api/tasks`)
            .then(res => (res.ok ? res.json() : { tasks: [] }))
            .then(data => setTasks(data.tasks || []))
            .catch(() => setTasks([]));
    }, []);

    // Category info for header
    const [categoryInfo, setCategoryInfo] = useState<{ name: string; seo_description?: string | null } | null>(null);
    useEffect(() => {
        if (!selectedCategory) {
            setCategoryInfo(null);
            return;
        }
        fetch(`${apiUrl}/api/categories`)
            .then(res => (res.ok ? res.json() : []))
            .then((cats: any[]) => {
                const match = cats.find(c => c.slug === selectedCategory);
                if (match) {
                    setCategoryInfo({ name: match.name, seo_description: match.seo_description });
                    trackCategoryView(match.id);
                } else {
                    setCategoryInfo(null);
                }
            })
            .catch(() => setCategoryInfo(null));
    }, [selectedCategory]);

    // Fetch tools
    useEffect(() => {
        const fetchTools = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (searchQuery) params.set('search', searchQuery);
                if (selectedCategory) params.set('category', selectedCategory);
                if (selectedPricing.length === 1) params.set('pricing', selectedPricing[0]);
                if (selectedSort) params.set('sort', selectedSort);
                params.set('page', currentPage.toString());
                params.set('perPage', '24');

                const res = await fetch(`${apiUrl}/api/tools?${params}`);
                if (!res.ok) throw new Error('Failed to fetch tools');
                const data = await res.json();

                let filteredTools = data.data || [];

                // Client-side filter for verified (if backend doesn't support it)
                if (verifiedOnly) {
                    filteredTools = filteredTools.filter((t: Tool) => t.verified);
                }

                // Client-side filter for multiple pricing types
                // Note: Ideally backend should handle this, but for now we filter what's returned
                if (selectedPricing.length > 0) {
                    filteredTools = filteredTools.filter((t: Tool) => {
                        const toolTypes = t.pricing_type?.map(p => p.toLowerCase()) ||
                            (t.pricing ? [t.pricing.toLowerCase()] : []);

                        // If tool has no type info, only show if filtered for 'free' and tool has no price info (assuming free)
                        if (toolTypes.length === 0) return selectedPricing.includes('free');

                        return toolTypes.some(type =>
                            selectedPricing.some(p => type.includes(p))
                        );
                    });
                }

                setTools(prev => currentPage === 1 ? filteredTools : [...prev, ...filteredTools]);
                setMeta(data.meta);
            } catch (error) {
                console.error('Error fetching tools:', error);
                setTools([]);
                setMeta(null);
            } finally {
                setLoading(false);
            }
        };

        fetchTools();
    }, [searchQuery, selectedCategory, selectedPricing, verifiedOnly, selectedSort, currentPage]);

    // Update URL params
    useEffect(() => {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (selectedCategory) params.set('category', selectedCategory);
        if (selectedJob) params.set('job', selectedJob);
        if (selectedTask) params.set('task', selectedTask);
        if (selectedPricing.length) params.set('pricing', selectedPricing.join(','));
        if (verifiedOnly) params.set('verified', 'true');
        if (selectedSort && selectedSort !== 'newest') params.set('sort', selectedSort);
        setSearchParams(params);
    }, [searchQuery, selectedCategory, selectedJob, selectedTask, selectedPricing, verifiedOnly, selectedSort, setSearchParams]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    const handlePricingChange = (value: string) => {
        setCurrentPage(1);
        setSelectedPricing(prev =>
            prev.includes(value) ? prev.filter(p => p !== value) : [...prev, value]
        );
    };

    const handleCategoryClick = (slug: string) => {
        setCurrentPage(1);
        setSelectedCategory(slug === selectedCategory ? '' : slug);
    };

    const clearAllFilters = () => {
        setSearchQuery('');
        setSelectedCategory('');
        setSelectedJob('');
        setSelectedTask('');
        setSelectedPricing([]);
        setVerifiedOnly(false);
        setSelectedSort('newest');
        setCurrentPage(1);
    };

    const hasActiveFilters = searchQuery || selectedCategory || selectedJob || selectedTask || selectedPricing.length > 0 || verifiedOnly;

    // Sidebar Filter Component
    const FilterSidebar = ({ mobile = false }: { mobile?: boolean }) => (
        <div className={mobile ? '' : 'sticky top-24'}>
            {/* Pricing Filter */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Pricing</h3>
                <div className="space-y-2">
                    {['Free', 'Paid', 'Freemium', 'Trial', 'API', 'Lifetime'].map((pricing) => (
                        <label key={pricing} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={selectedPricing.includes(pricing.toLowerCase())}
                                onChange={() => handlePricingChange(pricing.toLowerCase())}
                                className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-sm text-gray-700 group-hover:text-gray-900">{pricing}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Verified Toggle */}
            <div className="mb-6">
                <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-semibold text-gray-900">Verified Only</span>
                    <button
                        role="switch"
                        aria-checked={verifiedOnly}
                        onClick={() => { setVerifiedOnly(!verifiedOnly); setCurrentPage(1); }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${verifiedOnly ? 'bg-emerald-500' : 'bg-gray-200'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${verifiedOnly ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </label>
                <p className="text-xs text-gray-500 mt-1">Show only verified tools</p>
            </div>

            {/* Categories */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">Categories</h3>
                    <Link to="/categories" className="text-xs text-emerald-600 hover:text-emerald-700">
                        See all
                    </Link>
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                    {categories.slice(0, 10).map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat.slug)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat.slug
                                ? 'bg-emerald-100 text-emerald-700 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Job Roles */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <BriefcaseIcon className="w-4 h-4 text-emerald-600" />
                        By Job Role
                    </h3>
                    <Link to="/jobs" className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                        See all <ChevronRightIcon className="w-3 h-3" />
                    </Link>
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                    {jobs.slice(0, 8).map((job) => (
                        <button
                            key={job.id}
                            onClick={() => { setSelectedJob(job.slug === selectedJob ? '' : job.slug); setCurrentPage(1); }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${selectedJob === job.slug
                                ? 'bg-emerald-100 text-emerald-700 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <span className="truncate">{job.name}</span>
                            {job._count && (
                                <span className="text-xs text-gray-400 ml-2">{job._count.tools}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tasks */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <ClipboardDocumentListIcon className="w-4 h-4 text-purple-600" />
                        By Task
                    </h3>
                    <Link to="/tasks" className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1">
                        See all <ChevronRightIcon className="w-3 h-3" />
                    </Link>
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                    {tasks.slice(0, 8).map((task) => (
                        <button
                            key={task.id}
                            onClick={() => { setSelectedTask(task.slug === selectedTask ? '' : task.slug); setCurrentPage(1); }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${selectedTask === task.slug
                                ? 'bg-purple-100 text-purple-700 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <span className="truncate">{task.name}</span>
                            {task._count && (
                                <span className="text-xs text-gray-400 ml-2">{task._count.tools}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
                <button
                    onClick={clearAllFilters}
                    className="w-full py-2 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                    Clear all filters
                </button>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Category Header */}
            {categoryInfo && (
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold mb-2">{categoryInfo.name}</h1>
                        {categoryInfo.seo_description && (
                            <p className="text-emerald-100 text-lg">{categoryInfo.seo_description}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Page Header with Search */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        {/* Mobile Filter Toggle */}
                        <button
                            onClick={() => setShowMobileFilters(true)}
                            className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            <FunnelIcon className="w-5 h-5" />
                            Filters
                            {hasActiveFilters && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            )}
                        </button>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search AI tools..."
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                    className="w-full pl-12 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>
                        </form>

                        {/* Sort Dropdown */}
                        <select
                            value={selectedSort}
                            onChange={(e) => { setSelectedSort(e.target.value); setCurrentPage(1); }}
                            className="hidden sm:block px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="newest">Newest</option>
                            <option value="popular">Popular</option>
                        </select>
                    </div>

                    {/* Active Filters Pills */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                            {selectedCategory && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                    {categoryInfo?.name || selectedCategory}
                                    <button onClick={() => setSelectedCategory('')}>
                                        <XMarkIcon className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                            {selectedJob && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                                    <BriefcaseIcon className="w-3 h-3" />
                                    {jobs.find(j => j.slug === selectedJob)?.name || selectedJob}
                                    <button onClick={() => setSelectedJob('')}>
                                        <XMarkIcon className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                            {selectedTask && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                                    <ClipboardDocumentListIcon className="w-3 h-3" />
                                    {tasks.find(t => t.slug === selectedTask)?.name || selectedTask}
                                    <button onClick={() => setSelectedTask('')}>
                                        <XMarkIcon className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                            {selectedPricing.map(p => (
                                <span key={p} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                                    {p}
                                    <button onClick={() => handlePricingChange(p)}>
                                        <XMarkIcon className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                            {verifiedOnly && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                    Verified
                                    <button onClick={() => setVerifiedOnly(false)}>
                                        <XMarkIcon className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content with Sidebar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-8">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl border border-gray-200 p-5">
                            <FilterSidebar />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        {/* Results Count */}
                        {!loading && meta && (
                            <div className="mb-4 text-sm text-gray-600">
                                Showing {tools.length} of {meta.total} tools
                            </div>
                        )}

                        {/* Tools Grid */}
                        {tools.length === 0 && !loading ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                    <FunnelIcon className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No tools found</h3>
                                <p className="text-gray-600 mb-4">
                                    Try adjusting your filters or search query.
                                </p>
                                <button
                                    onClick={clearAllFilters}
                                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                                >
                                    Clear filters
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {tools.map((tool) => (
                                        <ToolCard key={tool.id} tool={tool} />
                                    ))}
                                    {loading && [...Array(6)].map((_, i) => (
                                        <ToolCardSkeleton key={i} />
                                    ))}
                                </div>

                                {/* Load More */}
                                {!loading && meta && currentPage < meta.totalPages && (
                                    <div className="mt-10 text-center">
                                        <button
                                            onClick={() => setCurrentPage(prev => prev + 1)}
                                            className="px-8 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
                                        >
                                            Load More Tools
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Drawer */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
                    <div className="fixed inset-y-0 left-0 w-80 max-w-full bg-white shadow-xl">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                            <button
                                onClick={() => setShowMobileFilters(false)}
                                className="p-2 rounded-lg hover:bg-gray-100"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto h-full pb-24">
                            <FilterSidebar mobile />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
