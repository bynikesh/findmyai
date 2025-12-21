import { Link } from 'react-router-dom';
import { CheckBadgeIcon } from '@heroicons/react/24/outline';
import FavoriteButton from './FavoriteButton';

interface Tool {
    id: number;
    name: string;
    slug: string;
    description: string;
    short_description?: string;
    pricing?: string;
    pricing_type?: string[];
    categories: { name: string; slug: string }[];
    logo_url?: string | null;
    verified?: boolean;
}

interface ToolCardProps {
    tool: Tool;
    isFavorited?: boolean;
    onFavoriteToggle?: (toolId: number, isFavorited: boolean) => void;
}

// Get pricing badge color based on type
const getPricingBadges = (pricingTypes?: string[], pricing?: string) => {
    // If no types, fall back to pricing text or 'Free'
    if (!pricingTypes || pricingTypes.length === 0) {
        return [{ label: pricing || 'Free', className: 'bg-gray-100 text-gray-700' }];
    }

    return pricingTypes.map(type => {
        const lowerType = type.toLowerCase();
        let className = 'bg-gray-100 text-gray-700';

        if (lowerType.includes('free') && !lowerType.includes('freemium')) {
            className = 'bg-emerald-100 text-emerald-700';
        } else if (lowerType.includes('freemium')) {
            className = 'bg-blue-100 text-blue-700';
        } else if (lowerType.includes('paid') || lowerType.includes('$')) {
            className = 'bg-purple-100 text-purple-700';
        } else if (lowerType.includes('open source')) {
            className = 'bg-orange-100 text-orange-700';
        } else if (lowerType.includes('trial')) {
            className = 'bg-teal-100 text-teal-700';
        } else if (lowerType.includes('api')) {
            className = 'bg-indigo-100 text-indigo-700';
        } else if (lowerType.includes('lifetime')) {
            className = 'bg-pink-100 text-pink-700';
        }

        return { label: type, className };
    });
};

export default function ToolCard({ tool, isFavorited = false, onFavoriteToggle }: ToolCardProps) {
    const pricingBadges = getPricingBadges(tool.pricing_type, tool.pricing);
    const displayDescription = tool.short_description || tool.description;

    const handleFavoriteToggle = (newIsFavorited: boolean) => {
        onFavoriteToggle?.(tool.id, newIsFavorited);
    };

    return (
        <div className="group relative bg-white rounded-2xl border border-gray-200 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-50 transition-all duration-200 overflow-hidden">
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

                    {/* Favorite Button */}
                    <FavoriteButton
                        toolId={tool.id}
                        initialFavorited={isFavorited}
                        size="md"
                        className="hover:bg-gray-100 rounded-lg"
                        onToggle={handleFavoriteToggle}
                    />
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
                    {/* Pricing Badges */}
                    {pricingBadges.map((badge, index) => (
                        <span key={index} className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badge.className}`}>
                            {badge.label}
                        </span>
                    ))}

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

