import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { StarIcon } from '@heroicons/react/20/solid'
import { CheckIcon } from '@heroicons/react/24/outline'
import Loader from '../components/Loader'

interface Tool {
    id: number
    name: string
    slug: string
    description: string
    website: string
    pricing: string
    categories: { name: string }[]
    logo_url?: string | null
    screenshots?: string[]
    features?: string[] // Assuming these might exist in future or mocked
    integrations?: string[]
    reviews?: { id: number, rating: number, title?: string, body?: string, user: { name: string } }[]
}

export default function ToolDetail() {
    const { slug } = useParams<{ slug: string }>()
    const [tool, setTool] = useState<Tool | null>(null)
    const [loading, setLoading] = useState(true)
    const [summary, setSummary] = useState<string | null>(null)
    const [summaryLoading, setSummaryLoading] = useState(false)

    useEffect(() => {
        const fetchTool = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/tools/${slug}`)
                if (!res.ok) throw new Error('Tool not found')
                const data = await res.json()
                setTool(data)

                // Fetch AI Summary
                setSummaryLoading(true)
                fetch(`/api/ai/summary?toolId=${data.id}`)
                    .then(res => res.json())
                    .then(aiData => setSummary(aiData.summary))
                    .catch(err => console.error('AI Summary failed', err))
                    .finally(() => setSummaryLoading(false))

            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        if (slug) fetchTool()
    }, [slug])

    if (loading) return <Loader />
    if (!tool) return <div className="text-center py-12">Tool not found</div>

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": tool.name,
        "description": tool.description,
        "applicationCategory": tool.categories[0]?.name || "BusinessApplication",
        "operatingSystem": "Web",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
        },
        "aggregateRating": tool.reviews && tool.reviews.length > 0 ? {
            "@type": "AggregateRating",
            "ratingValue": tool.reviews.reduce((acc, r) => acc + r.rating, 0) / tool.reviews.length,
            "reviewCount": tool.reviews.length
        } : undefined
    }

    return (
        <div className="bg-white">
            <Helmet>
                <title>{`${tool.name} - FindMyAI`}</title>
                <meta name="description" content={tool.description} />
                <link rel="canonical" href={`https://findmyai.com/tools/${tool.slug}`} />

                {/* Open Graph */}
                <meta property="og:title" content={tool.name} />
                <meta property="og:description" content={tool.description} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`https://findmyai.com/tools/${tool.slug}`} />
                {tool.logo_url && <meta property="og:image" content={tool.logo_url} />}

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={tool.name} />
                <meta name="twitter:description" content={tool.description} />
                {tool.logo_url && <meta name="twitter:image" content={tool.logo_url} />}

                {/* Structured Data */}
                <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            </Helmet>

            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
                    {/* Image/Carousel */}
                    <div className="flex flex-col">
                        <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden rounded-lg bg-gray-100">
                            {tool.logo_url ? (
                                <img src={tool.logo_url} alt={tool.name} className="h-full w-full object-cover object-center" />
                            ) : (
                                <div className="flex h-full items-center justify-center text-gray-400">No Logo</div>
                            )}
                        </div>
                        {/* Placeholder for Screenshots Carousel */}
                        {tool.screenshots && tool.screenshots.length > 0 && (
                            <div className="mt-4 grid grid-cols-4 gap-2">
                                {tool.screenshots.map((src, idx) => (
                                    <img key={idx} src={src} alt={`Screenshot ${idx}`} className="h-20 w-full rounded object-cover" />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{tool.name}</h1>
                        <div className="mt-3">
                            <h2 className="sr-only">Product information</h2>
                            <p className="text-3xl tracking-tight text-gray-900">{tool.pricing}</p>
                        </div>

                        {/* Reviews */}
                        <div className="mt-3">
                            <div className="flex items-center">
                                <div className="flex items-center">
                                    {[0, 1, 2, 3, 4].map((rating) => (
                                        <StarIcon
                                            key={rating}
                                            className={
                                                (tool.reviews && tool.reviews.length > 0 && (tool.reviews.reduce((acc, r) => acc + r.rating, 0) / tool.reviews.length) > rating)
                                                    ? 'text-yellow-400 h-5 w-5 flex-shrink-0'
                                                    : 'text-gray-200 h-5 w-5 flex-shrink-0'
                                            }
                                            aria-hidden="true"
                                        />
                                    ))}
                                </div>
                                <p className="sr-only">{tool.reviews?.length || 0} reviews</p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="sr-only">Description</h3>
                            <div className="space-y-6 text-base text-gray-700" dangerouslySetInnerHTML={{ __html: tool.description }} />
                        </div>

                        <div className="mt-6">
                            <a
                                href={tool.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Visit Website
                            </a>
                        </div>
                    </div>
                </div>

                {/* AI Summary Section */}
                <div className="mt-16 border-t border-gray-200 pt-10">
                    <h2 className="text-2xl font-bold text-gray-900">AI Analysis</h2>
                    <div className="mt-4 rounded-md bg-blue-50 p-6">
                        {summaryLoading ? (
                            <div className="flex items-center space-x-2 text-blue-700">
                                <Loader />
                                <span>Generating AI summary...</span>
                            </div>
                        ) : (
                            <p className="text-blue-800">{summary || "No summary available."}</p>
                        )}
                    </div>
                </div>

                {/* Features & Integrations (Mocked for now as they aren't in DB schema explicitly as arrays yet) */}
                <div className="mt-16 border-t border-gray-200 pt-10 lg:grid lg:grid-cols-2 lg:gap-x-8">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">Features</h3>
                        <ul role="list" className="mt-4 space-y-4">
                            {['Real-time Analysis', 'Custom Models', 'API Access', 'Team Collaboration'].map((feature) => (
                                <li key={feature} className="flex items-center">
                                    <CheckIcon className="h-5 w-5 flex-shrink-0 text-green-500" aria-hidden="true" />
                                    <span className="ml-3 text-gray-500">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="mt-10 lg:mt-0">
                        <h3 className="text-lg font-medium text-gray-900">Integrations</h3>
                        <ul role="list" className="mt-4 space-y-4">
                            {['Slack', 'Discord', 'Zapier', 'GitHub'].map((integration) => (
                                <li key={integration} className="flex items-center">
                                    <CheckIcon className="h-5 w-5 flex-shrink-0 text-blue-500" aria-hidden="true" />
                                    <span className="ml-3 text-gray-500">{integration}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
