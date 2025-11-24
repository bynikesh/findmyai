import React, { useState } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ArrayInputProps {
    label: string;
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    helperText?: string;
    maxItems?: number;
}

const ArrayInput: React.FC<ArrayInputProps> = ({
    label,
    value,
    onChange,
    placeholder = 'Add item...',
    helperText,
    maxItems = 20,
}) => {
    const [inputValue, setInputValue] = useState('');

    const handleAdd = () => {
        if (inputValue.trim() && value.length < maxItems) {
            onChange([...value, inputValue.trim()]);
            setInputValue('');
        }
    };

    const handleRemove = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium leading-6 text-gray-900">
                {label}
            </label>

            {/* Input field */}
            <div className="mt-2 flex gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                />
                <button
                    type="button"
                    onClick={handleAdd}
                    disabled={!inputValue.trim() || value.length >= maxItems}
                    className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <PlusIcon className="h-5 w-5" />
                </button>
            </div>

            {/* List of items */}
            {value.length > 0 && (
                <ul className="mt-3 space-y-2">
                    {value.map((item, index) => (
                        <li
                            key={index}
                            className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2 text-sm"
                        >
                            <span className="text-gray-900">{item}</span>
                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                className="text-red-600 hover:text-red-800"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {/* Helper text */}
            {helperText && (
                <p className="mt-2 text-sm text-gray-500">{helperText}</p>
            )}

            {/* Counter */}
            <p className="mt-1 text-xs text-gray-500">
                {value.length} / {maxItems} items
            </p>
        </div>
    );
};

export default ArrayInput;
