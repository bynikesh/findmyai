import {
    CurrencyDollarIcon,
    CodeBracketIcon,
    BuildingOfficeIcon,
    CalendarIcon,
    LinkIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

interface QuickInfoSidebarProps {
    pricing_type?: string;
    pricing?: string;
    price_range?: string;
    free_trial: boolean;
    open_source: boolean;
    company_name?: string;
    company_size?: string;
    release_year?: number;
    website: string;
    api_docs_url?: string;
    repo_url?: string;
    onVisitWebsite?: () => void;
}

export default function QuickInfoSidebar({
    pricing_type,
    pricing,
    price_range,
    free_trial,
    open_source,
    company_name,
    company_size,
    release_year,
    website,
    api_docs_url,
    repo_url,
    onVisitWebsite,
}: QuickInfoSidebarProps) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
            {/* Try Now CTA */}
            <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onVisitWebsite?.()}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 text-white font-bold text-lg rounded-xl shadow-md hover:shadow-lg transition-all duration-200 mb-6"
            >
                🚀 Try Now
            </a>

            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>

            <div className="space-y-4">
                {/* Pricing */}
                {(pricing_type || pricing || price_range) && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <CurrencyDollarIcon className="h-5 w-5 text-indigo-600" />
                            <h4 className="font-medium text-gray-900">Pricing</h4>
                        </div>
                        <div className="ml-7 space-y-1">
                            {pricing_type && (
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Type:</span> {pricing_type}
                                </p>
                            )}
                            {price_range && (
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Range:</span> {price_range}
                                </p>
                            )}
                            {pricing && (
                                <p className="text-sm text-gray-600">{pricing}</p>
                            )}
                            {free_trial && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                                    <CheckCircleIcon className="h-3 w-3" />
                                    Free Trial Available
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Open Source */}
                {open_source && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <CodeBracketIcon className="h-5 w-5 text-indigo-600" />
                            <h4 className="font-medium text-gray-900">Open Source</h4>
                        </div>
                        <div className="ml-7">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                                <CheckCircleIcon className="h-3 w-3" />
                                Open Source Project
                            </span>
                        </div>
                    </div>
                )}

                {/* Company Info */}
                {(company_name || company_size) && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <BuildingOfficeIcon className="h-5 w-5 text-indigo-600" />
                            <h4 className="font-medium text-gray-900">Company</h4>
                        </div>
                        <div className="ml-7 space-y-1">
                            {company_name && (
                                <p className="text-sm text-gray-600">{company_name}</p>
                            )}
                            {company_size && (
                                <p className="text-sm text-gray-500">{company_size}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Release Year */}
                {release_year && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <CalendarIcon className="h-5 w-5 text-indigo-600" />
                            <h4 className="font-medium text-gray-900">Released</h4>
                        </div>
                        <div className="ml-7">
                            <p className="text-sm text-gray-600">{release_year}</p>
                        </div>
                    </div>
                )}

                {/* Links */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <LinkIcon className="h-5 w-5 text-indigo-600" />
                        <h4 className="font-medium text-gray-900">Links</h4>
                    </div>
                    <div className="ml-7 space-y-2">
                        <a
                            href={website}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => onVisitWebsite?.()}
                            className="block text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                        >
                            Official Website →
                        </a>
                        {api_docs_url && (
                            <a
                                href={api_docs_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                            >
                                API Documentation →
                            </a>
                        )}
                        {repo_url && (
                            <a
                                href={repo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                            >
                                Source Code →
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
