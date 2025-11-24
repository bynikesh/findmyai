import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline';

interface CompareButtonProps {
    toolId: string;
}

const CompareButton: React.FC<CompareButtonProps> = ({ toolId }) => {
    return (
        <div className="fixed bottom-8 right-8 z-50">
            <Link
                to={`/compare?tool=${toolId}`}
                className="flex items-center justify-center rounded-full bg-blue-600 p-4 text-white shadow-lg transition hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                title="Compare with other tools"
            >
                <ArrowsRightLeftIcon className="h-6 w-6" />
                <span className="ml-2 hidden font-medium sm:block">Compare</span>
            </Link>
        </div>
    );
};

export default CompareButton;
