import { useState, useEffect } from 'react';

export interface ToolDetailData {
    id: number;
    name: string;
    slug: string;
    logo: string;
    badges: string[];
    shortDescription: string;
    longDescription: string;
    pros: string[];
    cons: string[];
    useCases: string[];
    pricing: {
        plan: string;
        price: string;
        features: string[];
    }[];
    pricingString?: string; // Added to handle simple string pricing from backend
    gallery: string[];
    alternatives: {
        id: string;
        name: string;
        slug: string;
        logo: string;
    }[];
    faq: {
        q: string;
        a: string;
    }[];
    website: string;
}

export const useToolDetail = (slug: string | undefined) => {
    const [tool, setTool] = useState<ToolDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;

        const fetchTool = async () => {
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:3000/api/tools/${slug}`);
                if (!res.ok) {
                    if (res.status === 404) throw new Error('Tool not found');
                    throw new Error('Failed to fetch tool data');
                }
                const data = await res.json();

                // Map backend data to frontend structure
                const mappedTool: ToolDetailData = {
                    id: data.id,
                    name: data.name,
                    slug: data.slug,
                    logo: data.logo_url || 'https://via.placeholder.com/150',
                    badges: data.categories ? data.categories.map((c: any) => c.name) : [],
                    shortDescription: data.description, // You might want to truncate this for shortDescription
                    longDescription: data.description,
                    pros: [], // Not in DB yet
                    cons: [], // Not in DB yet
                    useCases: [], // Not in DB yet
                    pricing: [], // Not in DB structured format
                    pricingString: data.pricing,
                    gallery: data.screenshots || [],
                    alternatives: [], // Not in DB yet
                    faq: [], // Not in DB yet
                    website: data.website,
                };

                setTool(mappedTool);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchTool();
    }, [slug]);

    return { tool, loading, error };
};
