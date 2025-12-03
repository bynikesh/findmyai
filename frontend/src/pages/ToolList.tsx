import { useEffect, useState } from 'react'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import ToolCard from '../components/ToolCard'
import { useSearchParams } from 'react-router-dom'
import { trackCategoryView } from '../lib/analytics'
import { apiUrl } from 'lib/constants';

interface Tool {
    id: number
    name: string
    slug: string
    description: string
    pricing: string
    categories: { name: string }[]
    logo_url?: string | null
}

interface Category {
    id: number
    name: string
    slug: string
}

// Loading Skeleton Component
function ToolCardSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
    )
}

export default function ToolList() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [tools, setTools] = useState<Tool[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [meta, setMeta] = useState<any>(null)

    // Filter states
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
    const [selectedPricing, setSelectedPricing] = useState(searchParams.get('pricing') || '')
    const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || '')
    const [currentPage, setCurrentPage] = useState(1)

    // Fetch categories (used for filter dropdown)
    useEffect(() => {
        fetch(`${apiUrl}/api/categories`)
            .then(res => (res.ok ? res.json() : []))
            .then(data => setCategories(data || []))
            .catch(() => setCategories([]));
    }, []);

    // Fetch selected category description (if any)
    const [categoryInfo, setCategoryInfo] = useState<{ name: string; seo_description?: string | null } | null>(null);
    useEffect(() => {
        if (!selectedCategory) {
            setCategoryInfo(null);
            return;
        }
        // Backend does not have a single-category endpoint, so fetch all and find the match
        fetch(`${apiUrl}/api/categories`)
            .then(res => (res.ok ? res.json() : []))
            .then((cats: any[]) => {
                const match = cats.find(c => c.slug === selectedCategory);
                if (match) {
                    setCategoryInfo({ name: match.name, seo_description: match.seo_description });
                    trackCategoryView(match.id);
                }
                else setCategoryInfo(null);
            })
            .catch(() => setCategoryInfo(null));
    }, [selectedCategory]);

    // Fetch tools
    useEffect(() => {
        const fetchTools = async () => {
            setLoading(true)
            try {
                const params = new URLSearchParams()

                if (searchQuery) params.set('search', searchQuery)
                if (selectedCategory) params.set('category', selectedCategory)
                if (selectedPricing) params.set('pricing', selectedPricing)
                if (selectedSort) params.set('sort', selectedSort)
                params.set('page', currentPage.toString())
                params.set('perPage', '20')

                const res = await fetch(`${apiUrl}/api/tools?${params}`)
                if (!res.ok) throw new Error('Failed to fetch tools')
                const data = await res.json()

                // Ensure we always set the data, even if it's empty
                if (Array.isArray(data.data)) {
                    setTools(prev => currentPage === 1 ? data.data : [...prev, ...data.data])
                    setMeta(data.meta)
                } else {
                    console.error('Invalid data format received:', data)
                    setTools([])
                    setMeta(null)
                }
            } catch (error) {
                console.error('Error fetching tools:', error)
                // Don't set empty array on error - keep existing tools or show error state
                setTools([])
                setMeta(null)
            } finally {
                setLoading(false)
            }
        }

        fetchTools()
    }, [searchQuery, selectedCategory, selectedPricing, selectedSort, currentPage])

    // Update URL params
    useEffect(() => {
        const params = new URLSearchParams()
        if (searchQuery) params.set('search', searchQuery)
        if (selectedCategory) params.set('category', selectedCategory)
        if (selectedPricing) params.set('pricing', selectedPricing)
        if (selectedSort) params.set('sort', selectedSort)
        setSearchParams(params)
    }, [searchQuery, selectedCategory, selectedPricing, selectedSort, setSearchParams])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setCurrentPage(1)
    }

    const handleFilterChange = () => {
        setCurrentPage(1)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Category Header (if a category is selected) */}
            {categoryInfo && (
                <div className="bg-white border-b border-gray-200 py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{categoryInfo.name}</h1>
                        {categoryInfo.seo_description && (
                            <p className="text-lg text-gray-600">{categoryInfo.seo_description}</p>
                        )}
                    </div>
                </div>
            )}
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">
                            Explore AI Tools
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Discover the best AI tools to supercharge your workflow. Filter by category, pricing, and more.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-8">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search for AI tools..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm"
                            />
                        </div>
                    </form>

                    {/* Filters Row */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Category Filter */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => { setSelectedCategory(e.target.value); handleFilterChange(); }}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-sm"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.slug}>{cat.name}</option>
                            ))}
                        </select>

                        {/* Pricing Filter */}
                        <select
                            value={selectedPricing}
                            onChange={(e) => { setSelectedPricing(e.target.value); handleFilterChange(); }}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-sm"
                        >
                            <option value="">All Pricing</option>
                            <option value="free">Free</option>
                            <option value="freemium">Freemium</option>
                            <option value="paid">Paid</option>
                        </select>

                        {/* Sort Dropdown - Right Aligned */}
                        <select
                            value={selectedSort}
                            onChange={(e) => { setSelectedSort(e.target.value); handleFilterChange(); }}
                            className="ml-auto px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-sm"
                        >
                            <option value="">Default</option>
                            <option value="popular">Popular</option>
                            <option value="newest">Newest</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Results Count */}
                {!loading && meta && (
                    <div className="mb-6 text-sm text-gray-600">
                        Showing {tools.length} of {meta.total} tools
                    </div>
                )}

                {/* Tools Grid & Empty State */}
                {tools.length === 0 && !loading ? (
                    /* Empty State */
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                            <FunnelIcon className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No tools found</h3>
                        <p className="text-gray-600 mb-6">
                            Try adjusting your filters or search query to find what you're looking for.
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery('')
                                setSelectedCategory('')
                                setSelectedPricing('')
                                setSelectedSort('')
                                setCurrentPage(1)
                            }}
                            className="px-6 py-2.5 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors shadow-sm"
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {tools.map((tool) => (
                                <ToolCard key={tool.id} tool={tool} />
                            ))}
                            {loading && [...Array(8)].map((_, i) => (
                                <ToolCardSkeleton key={i} />
                            ))}
                        </div>

                        {/* Load More Button */}
                        {!loading && meta && currentPage < meta.totalPages && (
                            <div className="mt-12 text-center">
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
    )
}
