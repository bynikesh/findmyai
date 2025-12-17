import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BriefcaseIcon, MagnifyingGlassIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import { apiUrl } from 'lib/constants';

interface Job {
    id: number;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    featured: boolean;
    _count?: { tools: number };
}

// Loading Skeleton Component
function JobCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
    );
}

export default function JobsList() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [sortBy, setSortBy] = useState<'name' | 'tools'>(
        (searchParams.get('sort') as 'name' | 'tools') || 'name'
    );

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${apiUrl}/api/jobs`);
                if (res.ok) {
                    const data = await res.json();
                    setJobs(data.jobs || []);
                }
            } catch (error) {
                console.error('Error fetching jobs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    // Update URL params
    useEffect(() => {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (sortBy !== 'name') params.set('sort', sortBy);
        setSearchParams(params);
    }, [searchQuery, sortBy, setSearchParams]);

    // Filter and sort jobs
    const filteredJobs = jobs
        .filter(job =>
            job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'tools') {
                return (b._count?.tools || 0) - (a._count?.tools || 0);
            }
            return a.name.localeCompare(b.name);
        });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-6">
                            <BriefcaseIcon className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">AI Tools by Job Role</h1>
                        <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
                            Find the perfect AI tools for your profession. Browse tools curated for specific job roles and industries.
                        </p>
                    </div>
                </div>
            </div>

            {/* Search and Sort Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Search Bar */}
                        <div className="flex-1 w-full max-w-xl">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search job roles..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2">
                            <ArrowsUpDownIcon className="w-5 h-5 text-gray-500" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'name' | 'tools')}
                                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="name">Sort by Name</option>
                                <option value="tools">Sort by Tool Count</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Jobs Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {!loading && (
                    <div className="mb-4 text-sm text-gray-600">
                        Showing {filteredJobs.length} job roles
                    </div>
                )}

                {filteredJobs.length === 0 && !loading ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <BriefcaseIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No job roles found</h3>
                        <p className="text-gray-600 mb-4">
                            Try adjusting your search query.
                        </p>
                        <button
                            onClick={() => setSearchQuery('')}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                        >
                            Clear search
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {loading ? (
                            [...Array(8)].map((_, i) => <JobCardSkeleton key={i} />)
                        ) : (
                            filteredJobs.map((job) => (
                                <Link
                                    key={job.id}
                                    to={`/jobs/${job.slug}`}
                                    className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-emerald-200 transition-all duration-200"
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl text-white">
                                            {job.icon ? (
                                                <span className="text-2xl">{job.icon}</span>
                                            ) : (
                                                <BriefcaseIcon className="w-6 h-6" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors truncate">
                                                {job.name}
                                            </h3>
                                            {job._count && (
                                                <p className="text-sm text-gray-500">
                                                    {job._count.tools} {job._count.tools === 1 ? 'tool' : 'tools'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {job.description && (
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {job.description}
                                        </p>
                                    )}
                                    {job.featured && (
                                        <span className="inline-block mt-3 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                                            Featured
                                        </span>
                                    )}
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
