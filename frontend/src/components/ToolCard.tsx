import { Link } from 'react-router-dom'

interface Tool {
    id: number
    name: string
    slug: string
    description: string
    pricing: string
    categories: { name: string }[]
    logo_url?: string | null
}

export default function ToolCard({ tool }: { tool: Tool }) {
    return (
        <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="aspect-h-4 aspect-w-3 bg-gray-200 sm:aspect-none group-hover:opacity-75 sm:h-48">
                {tool.logo_url ? (
                    <img
                        src={tool.logo_url}
                        alt={tool.name}
                        className="h-full w-full object-cover object-center sm:h-full sm:w-full"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                        <span className="text-2xl font-bold text-gray-300">{tool.name[0]}</span>
                    </div>
                )}
            </div>
            <div className="flex flex-1 flex-col space-y-2 p-4">
                <h3 className="text-sm font-medium text-gray-900">
                    <Link to={`/tools/${tool.slug}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {tool.name}
                    </Link>
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2">{tool.description}</p>
                <div className="flex flex-1 flex-col justify-end">
                    <p className="text-sm italic text-gray-500">{tool.categories[0]?.name}</p>
                    <p className="text-base font-medium text-gray-900">{tool.pricing}</p>
                </div>
            </div>
        </div>
    )
}
