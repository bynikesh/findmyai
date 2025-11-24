import React from 'react';
import { LightBulbIcon } from '@heroicons/react/24/outline';

interface UseCasesSectionProps {
    useCases: string[];
}

const UseCasesSection: React.FC<UseCasesSectionProps> = ({ useCases }) => {
    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900">Use Cases</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {useCases.map((useCase, idx) => (
                    <div key={idx} className="flex items-start rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                        <LightBulbIcon className="h-6 w-6 flex-shrink-0 text-yellow-500" />
                        <span className="ml-3 text-gray-700">{useCase}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UseCasesSection;
