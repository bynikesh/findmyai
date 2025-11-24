import { useSearchParams } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'

export interface SearchFilters {
    query: string
    category: string[]
    pricing: string[]
    platform: string[]
    model: string[]
    sort: 'newest' | 'popular'
    page: number
}

export function useSearchFilters() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [debouncedQuery, setDebouncedQuery] = useState(searchParams.get('query') || '')

    // Debounce query update
    useEffect(() => {
        const handler = setTimeout(() => {
            const currentQuery = searchParams.get('query') || ''
            if (debouncedQuery === currentQuery) return

            const current = new URLSearchParams(searchParams)
            if (debouncedQuery) {
                current.set('query', debouncedQuery)
            } else {
                current.delete('query')
            }
            // Reset page on search
            current.set('page', '1')
            setSearchParams(current)
        }, 300)

        return () => clearTimeout(handler)
    }, [debouncedQuery, searchParams, setSearchParams])

    const filters: SearchFilters = {
        query: debouncedQuery,
        category: searchParams.getAll('category'),
        pricing: searchParams.getAll('pricing'),
        platform: searchParams.getAll('platform'),
        model: searchParams.getAll('model'),
        sort: (searchParams.get('sort') as 'newest' | 'popular') || 'newest',
        page: parseInt(searchParams.get('page') || '1', 10),
    }

    const setQuery = (query: string) => {
        setDebouncedQuery(query)
    }

    const toggleFilter = useCallback((key: keyof Pick<SearchFilters, 'category' | 'pricing' | 'platform' | 'model'>, value: string) => {
        const current = new URLSearchParams(searchParams)
        const values = current.getAll(key)

        current.delete(key)
        if (values.includes(value)) {
            values.filter(v => v !== value).forEach(v => current.append(key, v))
        } else {
            [...values, value].forEach(v => current.append(key, v))
        }

        current.set('page', '1')
        setSearchParams(current)
    }, [searchParams, setSearchParams])

    const setSort = (sort: 'newest' | 'popular') => {
        const current = new URLSearchParams(searchParams)
        current.set('sort', sort)
        current.set('page', '1')
        setSearchParams(current)
    }

    const setPage = (page: number) => {
        const current = new URLSearchParams(searchParams)
        current.set('page', page.toString())
        setSearchParams(current)
    }

    const getQueryString = () => searchParams.toString()

    return {
        filters,
        setQuery,
        toggleFilter,
        setSort,
        setPage,
        getQueryString,
    }
}
