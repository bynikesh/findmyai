import React from 'react';

interface HeroSectionProps {
    name: string;
    logo: string;
    badges: string[];
    shortDescription: string;
    website?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ name, logo, badges, shortDescription, website }) => {
    return (
        <div className="bg-white pb-8 pt-6 sm:pb-12 sm:pt-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
                    <img
                        src={logo}
                        alt={`${name} logo`}
                        className="h-24 w-24 rounded-xl object-cover shadow-md sm:h-32 sm:w-32"
                    />
                    <div className="mt-4 sm:ml-8 sm:mt-0">
                        <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                            {badges.map((badge) => (
                                <span
                                    key={badge}
                                    className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                                >
                                    {badge}
                                </span>
                            ))}
                        </div>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{name}</h1>
                        <p className="mt-2 max-w-2xl text-lg text-gray-500">{shortDescription}</p>
                        {website && (
                            <div className="mt-4">
                                <a
                                    href={website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Visit Website
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
