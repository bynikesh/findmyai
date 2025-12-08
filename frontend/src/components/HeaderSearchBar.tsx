import { useState, useEffect, Fragment } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { MagnifyingGlassIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from 'lib/constants';

interface Suggestion {
    id: number;
    name: string;
    category?: string;
    slug: string;
}

export default function HeaderSearchBar() {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.length < 2) {
                setSuggestions([]);
                return;
            }

            setLoading(true);
            try {
                // Using existing tools endpoint for search
                // In a real app, you might want a dedicated lightweight suggestion endpoint
                const res = await fetch(`${apiUrl}/api/tools?search=${encodeURIComponent(query)}&perPage=5`);
                if (res.ok) {
                    const data = await res.json();
                    setSuggestions(data.data.map((tool: any) => ({
                        id: tool.id,
                        name: tool.name,
                        category: tool.category, // Assuming category structure, might need adjustment
                        slug: tool.slug
                    })));
                }
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounceTimer);
    }, [query]);

    const handleSelect = (item: Suggestion) => {
        if (item) {
            navigate(`/tools/${item.slug}`);
            setQuery('');
        }
    };

    const handleEnter = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            navigate(`/tools?search=${encodeURIComponent(query)}`);
            setQuery('');
        }
    }

    return (
        <div className="w-full max-w-lg lg:max-w-xs">
            <Combobox value={null} onChange={handleSelect}>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <Combobox.Input
                        className="block w-full rounded-md border-0 bg-gray-100 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        placeholder="Search AI tools..."
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={handleEnter}
                    />

                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        afterLeave={() => setQuery('')}
                    >
                        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {loading ? (
                                <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                                    Loading...
                                </div>
                            ) : query.length > 0 && suggestions.length === 0 ? (
                                <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                                    No results found.
                                </div>
                            ) : (
                                suggestions.map((item) => (
                                    <Combobox.Option
                                        key={item.id}
                                        className={({ active }) =>
                                            `relative cursor-default select-none py-2 pl-3 pr-9 ${active ? 'bg-blue-600 text-white' : 'text-gray-900'
                                            }`
                                        }
                                        value={item}
                                    >
                                        {({ active }) => (
                                            <>
                                                <div className="flex">
                                                    <span className={`truncate ${active ? 'font-semibold' : 'font-normal'}`}>
                                                        {item.name}
                                                    </span>
                                                    {item.category && (
                                                        <span className={`ml-2 truncate text-gray-500 ${active ? 'text-blue-200' : ''}`}>
                                                            - {item.category}
                                                        </span>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </Combobox.Option>
                                ))
                            )}
                        </Combobox.Options>
                    </Transition>
                </div>
            </Combobox>
        </div>
    );
}
