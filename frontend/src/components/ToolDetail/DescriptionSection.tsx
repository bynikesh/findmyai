import React from 'react';

interface DescriptionSectionProps {
    description: string;
}

const DescriptionSection: React.FC<DescriptionSectionProps> = ({ description }) => {
    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900">About</h2>
            <div
                className="mt-4 prose prose-blue max-w-none text-gray-500"
                dangerouslySetInnerHTML={{ __html: description }}
            />
        </div>
    );
};

export default DescriptionSection;
