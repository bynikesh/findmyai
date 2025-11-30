import {
    DevicePhoneMobileIcon,
    CpuChipIcon,
    PuzzlePieceIcon,
    CodeBracketIcon
} from '@heroicons/react/24/outline';

interface TechnicalDetailsProps {
    platforms: string[];
    models_used: string[];
    primary_model?: string;
    integrations: string[];
    api_available: boolean;
    open_source: boolean;
}

export default function TechnicalDetails({
    platforms,
    models_used,
    primary_model,
    integrations,
    api_available,
    open_source,
}: TechnicalDetailsProps) {
    if (!platforms.length && !models_used.length && !integrations.length && !api_available && !open_source) {
        return null;
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Details</h2>

            <div className="space-y-6">
                {/* Platforms */}
                {platforms.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <DevicePhoneMobileIcon className="h-5 w-5 text-indigo-600" />
                            <h3 className="font-semibold text-gray-900">Platforms</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {platforms.map((platform, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                                >
                                    {platform}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* AI Models */}
                {models_used.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <CpuChipIcon className="h-5 w-5 text-indigo-600" />
                            <h3 className="font-semibold text-gray-900">AI Models</h3>
                        </div>
                        <div className="space-y-2">
                            {primary_model && (
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full font-medium">
                                        Primary: {primary_model}
                                    </span>
                                </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                                {models_used.map((model, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                                    >
                                        {model}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Integrations */}
                {integrations.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <PuzzlePieceIcon className="h-5 w-5 text-indigo-600" />
                            <h3 className="font-semibold text-gray-900">Integrations</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {integrations.map((integration, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                                >
                                    {integration}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* API & Open Source */}
                {(api_available || open_source) && (
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <CodeBracketIcon className="h-5 w-5 text-indigo-600" />
                            <h3 className="font-semibold text-gray-900">Developer Features</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {api_available && (
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                                    ✓ API Available
                                </span>
                            )}
                            {open_source && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                                    ✓ Open Source
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
