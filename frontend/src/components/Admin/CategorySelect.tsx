import React from 'react';

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface CategorySelectProps {
    label: string;
    categories: Category[];
    selectedIds: number[];
    onChange: (ids: number[]) => void;
    helperText?: string;
}

const CategorySelect: React.FC<CategorySelectProps> = ({
    label,
    categories,
    selectedIds,
    onChange,
    helperText,
}) => {
    const handleToggle = (categoryId: number) => {
        if (selectedIds.includes(categoryId)) {
            onChange(selectedIds.filter(id => id !== categoryId));
        } else {
            onChange([...selectedIds, categoryId]);
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium leading-6 text-gray-900">
                {label}
            </label>
            <div className="mt-2 space-y-2">
                {categories.map((category) => (
                    <label
                        key={category.id}
                        className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                        <input
                            type="checkbox"
                            checked={selectedIds.includes(category.id)}
                            onChange={() => handleToggle(category.id)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                        />
                        <span className="ml-3 text-sm text-gray-700">{category.name}</span>
                    </label>
                ))}
            </div>
            {helperText && (
                <p className="mt-2 text-sm text-gray-500">{helperText}</p>
            )}
        </div>
    );
};

export default CategorySelect;
