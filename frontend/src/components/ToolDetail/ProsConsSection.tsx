import React from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/20/solid';

interface ProsConsSectionProps {
    pros: string[];
    cons: string[];
}

const ProsConsSection: React.FC<ProsConsSectionProps> = ({ pros, cons }) => {
    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2">
                {/* Pros */}
                <div className="rounded-lg border border-green-100 bg-green-50 p-6">
                    <h3 className="flex items-center text-lg font-semibold text-green-900">
                        <CheckCircleIcon className="mr-2 h-5 w-5 text-green-600" />
                        Pros
                    </h3>
                    <ul className="mt-4 space-y-3">
                        {pros.map((pro, idx) => (
                            <li key={idx} className="flex items-start text-green-800">
                                <span className="mr-2">•</span>
                                {pro}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Cons */}
                <div className="rounded-lg border border-red-100 bg-red-50 p-6">
                    <h3 className="flex items-center text-lg font-semibold text-red-900">
                        <XCircleIcon className="mr-2 h-5 w-5 text-red-600" />
                        Cons
                    </h3>
                    <ul className="mt-4 space-y-3">
                        {cons.map((con, idx) => (
                            <li key={idx} className="flex items-start text-red-800">
                                <span className="mr-2">•</span>
                                {con}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ProsConsSection;
