import { Link } from 'react-router-dom';
import { BookmarkIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

interface Tool {
    id: number;
    name: string;
    slug: string;
    description: string;
    short_description?: string;
    pricing: string;
    pricing_type?: string;
    categories: { name: string; slug: string }[];
    logo_url?: string | null;
    verified?: boolean;
}

interface ToolCardProps {
    tool: Tool;
}

// Get pricing badge color based on type
const getPricingBadge = (pricingType?: string, pricing?: string) => {
    const type = pricingType?.toLowerCase() || pricing?.toLowerCase() || 'free';

    if (type.includes('free') && !type.includes('freemium')) {
        return { label: 'Free', className: 'bg-emerald-100 text-emerald-700' };
    }
    if (type.includes('freemium')) {
        return { label: 'Freemium', className: 'bg-blue-100 text-blue-700' };
    }
    if (type.includes('paid') || type.includes('$')) {
        return { label: 'Paid', className: 'bg-purple-100 text-purple-700' };
    }
    if (type.includes('open source')) {
        return { label: 'Open Source', className: 'bg-orange-100 text-orange-700' };
    }
    return { label: pricing || 'Free', className: 'bg-gray-100 text-gray-700' };
};

export default function ToolCard({ tool }: ToolCardProps) {
    const [isSaved, setIsSaved] = useState(false);
    const pricingBadge = getPricingBadge(tool.pricing_type, tool.pricing);
    const displayDescription = tool.short_description || tool.description;

    const handleSaveClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsSaved(!isSaved);
        // TODO: Persist to backend/localStorage
    };

    return (
        <div className="group relative bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 overflow-hidden">
            <Link to={`/tools/${tool.slug}`} className="block p-5">
                {/* Top Row: Logo + Save Button */}
                <div className="flex items-start justify-between mb-4">
                    {/* Logo */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm">
                        {tool.logo_url ? (
                            <img
                                src={tool.logo_url}
                                alt={tool.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/default/tool.png';
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-bold text-xl">
                                {tool.name[0]?.toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* Save/Bookmark Button */}
                    <button
                        onClick={handleSaveClick}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label={isSaved ? 'Remove from saved' : 'Save tool'}
                    >
                        {isSaved ? (
                            <BookmarkSolidIcon className="w-5 h-5 text-emerald-500" />
                        ) : (
                            <BookmarkIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                        )}
                    </button>
                </div>

                {/* Tool Name + Verified Badge */}
                <div className="mb-2">
                    <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-gray-900 text-base group-hover:text-emerald-600 transition-colors truncate">
                            {tool.name}
                        </h3>
                        {tool.verified && (
                            <CheckBadgeIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        )}
                    </div>
                </div>

                {/* Description - 2 lines truncated */}
                <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed min-h-[2.5rem]">
                    {displayDescription}
                </p>

                {/* Footer: Pricing Badge + Category Badge */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Pricing Badge */}
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${pricingBadge.className}`}>
                        {pricingBadge.label}
                    </span>

                    {/* Category Badge */}
                    {tool.categories?.[0] && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            {tool.categories[0].name}
                        </span>
                    )}
                </div>
            </Link>
        </div>
    );
}
