import { useState, useEffect } from 'react';
import { apiUrl } from 'lib/constants';

export interface ToolDetailData {
    // Basic Info
    id: number;
    name: string;
    slug: string;
    tagline?: string;
    short_description?: string;
    description: string;

    // Visual
    logo_url?: string;
    brand_color_primary?: string;
    brand_color_secondary?: string;
    screenshots: string[];

    // Detailed Information
    key_features: string[];
    pros: string[];
    cons: string[];
    ideal_for?: string;
    use_cases: string[];

    // Pricing & Access
    pricing_type?: string;
    pricing?: string;
    price_range?: string;
    free_trial: boolean;
    open_source: boolean;
    repo_url?: string;

    // Technical Info
    website: string;
    platforms: string[];
    models_used: string[];
    primary_model?: string;
    integrations: string[];
    api_available: boolean;
    api_docs_url?: string;

    // Metadata
    release_year?: number;
    company_name?: string;
    company_size?: string;

    // SEO
    seo_title?: string;
    seo_meta_description?: string;
    social_share_image?: string;

    // Admin Status
    verified: boolean;
    featured: boolean;
    trending: boolean;
    editors_choice: boolean;
    still_active: boolean;

    // Engagement
    allow_reviews: boolean;
    average_rating?: number;
    review_count: number;
    view_count: number;

    // Relations
    categories: { id: number; name: string; slug: string }[];
    tags: { id: number; name: string }[];
    reviews: any[];

    // Legacy fields for compatibility
    badges: string[];
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
                const res = await fetch(`${apiUrl}/api/tools/${slug}`);
                if (!res.ok) {
                    if (res.status === 404) throw new Error('Tool not found');
                    throw new Error('Failed to fetch tool data');
                }
                const data = await res.json();

                // Map backend data to frontend structure
                const mappedTool: ToolDetailData = {
                    // Basic Info
                    id: data.id,
                    name: data.name,
                    slug: data.slug,
                    tagline: data.tagline,
                    short_description: data.short_description,
                    description: data.description,

                    // Visual
                    logo_url: data.logo_url,
                    brand_color_primary: data.brand_color_primary,
                    brand_color_secondary: data.brand_color_secondary,
                    screenshots: data.screenshots || [],

                    // Detailed Information
                    key_features: data.key_features || [],
                    pros: data.pros || [],
                    cons: data.cons || [],
                    ideal_for: data.ideal_for,
                    use_cases: data.use_cases || [],

                    // Pricing & Access
                    pricing_type: data.pricing_type,
                    pricing: data.pricing,
                    price_range: data.price_range,
                    free_trial: data.free_trial || false,
                    open_source: data.open_source || false,
                    repo_url: data.repo_url,

                    // Technical Info
                    website: data.website,
                    platforms: data.platforms || [],
                    models_used: data.models_used || [],
                    primary_model: data.primary_model,
                    integrations: data.integrations || [],
                    api_available: data.api_available || false,
                    api_docs_url: data.api_docs_url,

                    // Metadata
                    release_year: data.release_year,
                    company_name: data.company_name,
                    company_size: data.company_size,

                    // SEO
                    seo_title: data.seo_title,
                    seo_meta_description: data.seo_meta_description,
                    social_share_image: data.social_share_image,

                    // Admin Status
                    verified: data.verified || false,
                    featured: data.featured || false,
                    trending: data.trending || false,
                    editors_choice: data.editors_choice || false,
                    still_active: data.still_active !== false,

                    // Engagement
                    allow_reviews: data.allow_reviews !== false,
                    average_rating: data.average_rating,
                    review_count: data.review_count || 0,
                    view_count: data.view_count || 0,

                    // Relations
                    categories: data.categories || [],
                    tags: data.tags || [],
                    reviews: data.reviews || [],

                    // Legacy fields for compatibility
                    badges: data.categories ? data.categories.map((c: any) => c.name) : [],
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
