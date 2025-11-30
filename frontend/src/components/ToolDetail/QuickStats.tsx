import { StarIcon } from '@heroicons/react/20/solid';
import { EyeIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

interface QuickStatsProps {
    average_rating?: number;
    review_count: number;
    pricing_type?: string;
    primary_model?: string;
    view_count: number;
}

export default function QuickStats({
    average_rating,
    review_count,
    pricing_type,
    primary_model,
    view_count,
}: QuickStatsProps) {
    return (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-y border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-8">
                    {/* Rating */}
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <StarIcon
                                    key={i}
                                    className={`h-5 w-5 ${i < Math.floor(average_rating || 0)
                                            ? 'text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                            {average_rating?.toFixed(1) || 'N/A'}
                        </span>
                    </div>

                    {/* Reviews */}
                    <div className="flex items-center space-x-2">
                        <ChatBubbleLeftIcon className="h-5 w-5 text-gray-400" />
                        <div>
                            <p className="text-sm font-medium text-gray-900">{review_count}</p>
                            <p className="text-xs text-gray-500">Reviews</p>
                        </div>
                    </div>

                    {/* Pricing Type */}
                    {pricing_type && (
                        <div className="flex items-center space-x-2">
                            <div className="flex-shrink-0">
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${pricing_type === 'Free'
                                            ? 'bg-green-100 text-green-800'
                                            : pricing_type === 'Freemium'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-purple-100 text-purple-800'
                                        }`}
                                >
                                    {pricing_type}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* AI Model */}
                    {primary_model && (
                        <div className="flex items-center space-x-2">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">{primary_model}</p>
                                <p className="text-xs text-gray-500">AI Model</p>
                            </div>
                        </div>
                    )}

                    {/* Views */}
                    <div className="flex items-center space-x-2">
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                {view_count.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">Views</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
