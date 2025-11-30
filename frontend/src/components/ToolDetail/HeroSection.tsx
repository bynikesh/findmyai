import { CheckBadgeIcon, FireIcon, SparklesIcon, TrophyIcon } from '@heroicons/react/24/solid';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface HeroSectionProps {
    name: string;
    tagline?: string;
    logo_url?: string;
    short_description?: string;
    website: string;
    verified: boolean;
    featured: boolean;
    trending: boolean;
    editors_choice: boolean;
    brand_color_primary?: string;
}

export default function HeroSection({
    name,
    tagline,
    logo_url,
    short_description,
    website,
    verified,
    featured,
    trending,
    editors_choice,
    brand_color_primary,
}: HeroSectionProps) {
    const handleVisitWebsite = () => {
        // TODO: Add click tracking
        window.open(website, '_blank', 'noopener,noreferrer');
    };

    const gradientStyle = brand_color_primary
        ? { background: `linear-gradient(135deg, ${brand_color_primary}15 0%, ${brand_color_primary}05 100%)` }
        : { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };

    return (
        <div className="relative overflow-hidden" style={gradientStyle}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Breadcrumb */}
                <nav className="flex mb-8" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2 text-sm">
                        <li>
                            <a href="/" className="text-gray-600 hover:text-gray-900">
                                Home
                            </a>
                        </li>
                        <li>
                            <span className="text-gray-400">/</span>
                        </li>
                        <li>
                            <a href="/tools" className="text-gray-600 hover:text-gray-900">
                                Tools
                            </a>
                        </li>
                        <li>
                            <span className="text-gray-400">/</span>
                        </li>
                        <li className="text-gray-900 font-medium">{name}</li>
                    </ol>
                </nav>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white shadow-lg p-4 flex items-center justify-center">
                            {logo_url ? (
                                <img
                                    src={logo_url}
                                    alt={`${name} logo`}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-3xl font-bold">
                                    {name.charAt(0)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {verified && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckBadgeIcon className="h-4 w-4" />
                                    Verified
                                </span>
                            )}
                            {featured && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    <SparklesIcon className="h-4 w-4" />
                                    Featured
                                </span>
                            )}
                            {trending && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    <FireIcon className="h-4 w-4" />
                                    Trending
                                </span>
                            )}
                            {editors_choice && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    <TrophyIcon className="h-4 w-4" />
                                    Editor's Choice
                                </span>
                            )}
                        </div>

                        {/* Title & Tagline */}
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                            {name}
                        </h1>
                        {tagline && (
                            <p className="text-xl text-gray-700 mb-4">{tagline}</p>
                        )}
                        {short_description && (
                            <p className="text-gray-600 mb-6 max-w-3xl">{short_description}</p>
                        )}

                        {/* CTA Button */}
                        <button
                            onClick={handleVisitWebsite}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                        >
                            Visit Website
                            <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
