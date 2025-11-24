import React from 'react';
import { Link } from 'react-router-dom';

interface Alternative {
    id: string;
    name: string;
    slug: string;
    logo: string;
}

interface AlternativesSectionProps {
    alternatives: Alternative[];
}

const AlternativesSection: React.FC<AlternativesSectionProps> = ({ alternatives }) => {
    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900">Alternatives</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {alternatives.map((alt) => (
                    <Link
                        key={alt.id}
                        to={`/tools/${alt.slug}`}
                        className="group flex items-center rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-blue-300"
                    >
                        <img
                            src={alt.logo}
                            alt={alt.name}
                            className="h-12 w-12 rounded-lg object-cover"
                        />
                        <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">{alt.name}</h3>
                            <p className="text-sm text-gray-500">View Details &rarr;</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default AlternativesSection;
