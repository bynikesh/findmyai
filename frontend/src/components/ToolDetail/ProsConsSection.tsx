import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface ProsConsSectionProps {
    pros: string[];
    cons: string[];
}

export default function ProsConsSection({ pros, cons }: ProsConsSectionProps) {
    if (!pros.length && !cons.length) return null;

    return (
        <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Pros & Cons</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pros */}
                {pros.length > 0 && (
                    <div>
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-green-700 mb-4">
                            <CheckCircleIcon className="h-6 w-6" />
                            Pros
                        </h3>
                        <ul className="space-y-3">
                            {pros.map((pro, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">{pro}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Cons */}
                {cons.length > 0 && (
                    <div>
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-red-700 mb-4">
                            <XCircleIcon className="h-6 w-6" />
                            Cons
                        </h3>
                        <ul className="space-y-3">
                            {cons.map((con, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <XCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">{con}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
