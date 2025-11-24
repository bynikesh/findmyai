import { useEffect, useState } from 'react'
import { FunnelIcon } from '@heroicons/react/20/solid'
import ToolCard from '../components/ToolCard'
import FiltersPanel from '../components/FiltersPanel'
import Pagination from '../components/Pagination'
import Loader from '../components/Loader'
import { useSearchFilters } from '../hooks/useSearchFilters'

interface Tool {
    id: number
    name: string
    slug: string
    description: string
    pricing: string
    categories: { name: string }[]
    logo_url?: string | null
}

export default function ToolList() {
    const { filters, setPage, getQueryString } = useSearchFilters()
    const [tools, setTools] = useState<Tool[]>([])
    const [loading, setLoading] = useState(true)
    const [meta, setMeta] = useState<any>(null)
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

    const queryString = getQueryString()

    useEffect(() => {
        const fetchTools = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/tools?${queryString}`)
                if (!res.ok) throw new Error('Failed to fetch tools')
                const data = await res.json()
                setTools(data.data || [])
                setMeta(data.meta)
            } catch (error) {
                console.error('Error fetching tools:', error)
                setTools([])
            } finally {
                setLoading(false)
            }
        }

        fetchTools()
    }, [queryString]) // Re-fetch only when query string changes

    const handlePageChange = (newPage: number) => {
        setPage(newPage)
        window.scrollTo(0, 0)
    }

    return (
        <div className="bg-white">
            <FiltersPanel mobileFiltersOpen={mobileFiltersOpen} setMobileFiltersOpen={setMobileFiltersOpen} />

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-24">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">AI Tools</h1>

                    <div className="flex items-center">
                        <button
                            type="button"
                            className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden"
                            onClick={() => setMobileFiltersOpen(true)}
                        >
                            <span className="sr-only">Filters</span>
                            <FunnelIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>
                </div>

                <section aria-labelledby="products-heading" className="pb-24 pt-6">
                    <h2 id="products-heading" className="sr-only">
                        Products
                    </h2>

                    <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
                        {/* Filters */}
                        <div className="hidden lg:block">
                            <FiltersPanel mobileFiltersOpen={false} setMobileFiltersOpen={() => { }} />
                        </div>

                        {/* Product grid */}
                        <div className="lg:col-span-3">
                            {loading ? (
                                <Loader />
                            ) : (
                                <>
                                    {tools.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500">No tools found matching your criteria.</div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                                            {tools.map((tool) => (
                                                <ToolCard key={tool.id} tool={tool} />
                                            ))}
                                        </div>
                                    )}

                                    {meta && (
                                        <div className="mt-8">
                                            <Pagination
                                                currentPage={filters.page}
                                                totalPages={meta.totalPages}
                                                onPageChange={handlePageChange}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}
