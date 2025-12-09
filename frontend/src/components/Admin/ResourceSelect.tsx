import React from 'react';

interface Resource {
    id: number;
    name: string;
    slug: string;
}

interface ResourceSelectProps {
    label: string;
    resources: Resource[];
    selectedIds: number[];
    onChange: (ids: number[]) => void;
    helperText?: string;
    placeholder?: string;
}

const ResourceSelect: React.FC<ResourceSelectProps> = ({
    label,
    resources,
    selectedIds,
    onChange,
    helperText,
    placeholder = "Search..."
}) => {
    const [searchTerm, setSearchTerm] = React.useState('');

    const handleToggle = (resourceId: number) => {
        if (selectedIds.includes(resourceId)) {
            onChange(selectedIds.filter(id => id !== resourceId));
        } else {
            onChange([...selectedIds, resourceId]);
        }
    };

    const filteredResources = resources.filter(resource =>
        resource.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                {label}
            </label>
            <input
                type="text"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm mb-2"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2">
                {filteredResources.length > 0 ? (
                    filteredResources.map((resource) => (
                        <label
                            key={resource.id}
                            className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(resource.id)}
                                onChange={() => handleToggle(resource.id)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                            />
                            <span className="ml-3 text-sm text-gray-700">{resource.name}</span>
                        </label>
                    ))
                ) : (
                    <p className="text-sm text-gray-500 text-center py-2">No items found</p>
                )}
            </div>
            {helperText && (
                <p className="mt-2 text-sm text-gray-500">{helperText}</p>
            )}
        </div>
    );
};

export default ResourceSelect;
