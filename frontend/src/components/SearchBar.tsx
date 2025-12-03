import { Fragment, useState, useEffect } from 'react'
import { Combobox, Transition } from '@headlessui/react'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { useNavigate } from 'react-router-dom'

interface Tool {
    id: number
    name: string
    slug: string
}

export default function SearchBar() {
    const [selected, setSelected] = useState<Tool | null>(null)
    const [query, setQuery] = useState('')
    const [tools, setTools] = useState<Tool[]>([])
    const navigate = useNavigate()

    useEffect(() => {
        const fetchTools = async () => {
            if (query.length < 2) {
                setTools([])
                return
            }
            try {
                const res = await fetch(`/api/tools?query=${query}&perPage=5`)
                if (!res.ok) throw new Error('Failed to search tools')
                const data = await res.json()
                setTools(data.data || [])
            } catch (error) {
                console.error('Error fetching tools:', error)
                setTools([])
            }
        }

        const timeoutId = setTimeout(fetchTools, 300)
        return () => clearTimeout(timeoutId)
    }, [query])

    const handleSelect = (tool: Tool | null) => {
        if (!tool) return
        setSelected(tool)
        navigate(`/tools/${tool.slug}`)
    }

    return (
        <div className="w-full max-w-lg lg:max-w-xs">
            <label htmlFor="search" className="sr-only">
                Search
            </label>
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <Combobox value={selected} onChange={handleSelect}>
                    <div className="relative mt-1">
                        <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                            <Combobox.Input
                                className="w-full border-none py-2 pl-10 pr-3 text-sm leading-5 text-gray-900 focus:ring-0"
                                displayValue={(tool: Tool) => tool?.name}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search AI tools..."
                            />
                        </div>
                        <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                            afterLeave={() => setQuery('')}
                        >
                            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-10">
                                {tools.length === 0 && query !== '' ? (
                                    <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                                        Nothing found.
                                    </div>
                                ) : (
                                    tools.map((tool) => (
                                        <Combobox.Option
                                            key={tool.id}
                                            className={({ active }) =>
                                                `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-600 text-white' : 'text-gray-900'
                                                }`
                                            }
                                            value={tool}
                                        >
                                            {({ selected }) => (
                                                <>
                                                    <span
                                                        className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                                                            }`}
                                                    >
                                                        {tool.name}
                                                    </span>
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
        </div>
    )
}
