import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, SparklesIcon } from '@heroicons/react/24/outline';
import FormInput from './FormInput';
import CollapsibleSection from './CollapsibleSection';
import ArrayInput from './ArrayInput';
import ResourceSelect from './ResourceSelect';
import RichTextEditor from './RichTextEditor';
import { useToast } from '../../contexts/ToastContext';
import { apiUrl } from '../../lib/constants';

export interface ToolFormData {
    name: string;
    slug: string;
    tagline: string;
    short_description: string;
    website: string;
    description: string;

    key_features: string[];
    pros: string[];
    cons: string[];
    ideal_for: string;

    pricing_type: string[];
    pricing: string;
    price_range: string;
    free_trial: boolean;
    open_source: boolean;
    repo_url: string;

    platforms: string;
    models_used: string;
    primary_model: string;
    integrations: string[];
    api_available: boolean;
    api_docs_url: string;

    logo_url: string;
    brand_color_primary: string;
    brand_color_secondary: string;
    screenshots: string;

    release_year: string;
    company_name: string;
    company_size: string;

    seo_title: string;
    seo_meta_description: string;
    social_share_image: string;

    use_cases: string[];
    allow_reviews: boolean;

    verified: boolean;
    featured: boolean;
    trending: boolean;
    editors_choice: boolean;
    still_active: boolean;

    categoryIds: number[];
    jobIds: number[];
    taskIds: number[];
}

interface ToolFormProps {
    initialData?: ToolFormData;
    isEditing?: boolean;
    onSubmit: (data: ToolFormData) => Promise<void>;
    isLoading?: boolean;
}

export const initialToolForm: ToolFormData = {
    name: '',
    slug: '',
    tagline: '',
    short_description: '',
    website: '',
    description: '',
    key_features: [],
    pros: [],
    cons: [],
    ideal_for: '',
    pricing_type: ['Freemium'],
    pricing: '',
    price_range: '',
    free_trial: false,
    open_source: false,
    repo_url: '',
    platforms: '',
    models_used: '',
    primary_model: '',
    integrations: [],
    api_available: false,
    api_docs_url: '',
    logo_url: '',
    brand_color_primary: '#3B82F6',
    brand_color_secondary: '#8B5CF6',
    screenshots: '',
    release_year: new Date().getFullYear().toString(),
    company_name: '',
    company_size: '',
    seo_title: '',
    seo_meta_description: '',
    social_share_image: '',
    use_cases: [],
    allow_reviews: true,
    verified: true,
    featured: false,
    trending: false,
    editors_choice: false,
    still_active: true,
    categoryIds: [],
    jobIds: [],
    taskIds: [],
};

export default function ToolForm({ initialData, isEditing = false, onSubmit, isLoading = false }: ToolFormProps) {
    const navigate = useNavigate();
    const { showError } = useToast();
    const [formData, setFormData] = useState<ToolFormData>(initialData || initialToolForm);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Resources state
    const [categories, setCategories] = useState<any[]>([]);
    const [jobs, setJobs] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);

    const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
    const [isFetchingLogo, setIsFetchingLogo] = useState(false);

    useEffect(() => {
        if (initialData) setFormData(initialData);
    }, [initialData]);

    // Fetch resources
    useEffect(() => {
        const fetchResources = async () => {
            try {
                const [catsRes, jobsRes, tasksRes] = await Promise.all([
                    fetch(`${apiUrl}/api/categories`),
                    fetch(`${apiUrl}/api/jobs`),
                    fetch(`${apiUrl}/api/tasks`)
                ]);

                if (catsRes.ok) setCategories(await catsRes.json());
                if (jobsRes.ok) {
                    const data = await jobsRes.json();
                    setJobs(data.jobs || []);
                }
                if (tasksRes.ok) {
                    const data = await tasksRes.json();
                    setTasks(data.tasks || []);
                }
            } catch (error) {
                console.error('Error fetching resources:', error);
                showError('Error', 'Failed to fetch form resources');
            }
        };
        fetchResources();
    }, []);

    // Auto-generate slug
    useEffect(() => {
        if (!isEditing && !formData.slug && formData.name) {
            const generated = formData.name
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');
            setFormData(prev => ({ ...prev, slug: generated }));
        }
    }, [formData.name, isEditing]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
        if (!formData.website.trim()) newErrors.website = 'Website is required';
        else if (!/^https?:\/\/[^\s]+$/.test(formData.website)) newErrors.website = 'Invalid URL';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            showError('Validation Error', 'Please check the form for errors');
            return;
        }

        await onSubmit(formData);
    };

    const handleFetchMetadata = async () => {
        if (!formData.repo_url) {
            showError('URL required', 'Please enter a Source URL first');
            return;
        }

        setIsFetchingMetadata(true);
        try {
            const res = await fetch(`${apiUrl}/api/admin/tools/fetch-metadata`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ url: formData.repo_url }),
            });

            if (res.ok) {
                const data = await res.json();
                setFormData(prev => ({
                    ...prev,
                    name: prev.name || data.title || '',
                    description: prev.description || data.description || '',
                    seo_title: prev.seo_title || data.title || '',
                    seo_meta_description: prev.seo_meta_description || data.description || '',
                    logo_url: prev.logo_url || data.icon || '',
                    social_share_image: prev.social_share_image || data.image || '',
                }));
            } else {
                showError('Error', 'Failed to fetch metadata');
            }
        } catch (error) {
            showError('Error', 'Network error occurred');
        } finally {
            setIsFetchingMetadata(false);
        }
    };

    const handleGenerateDescription = async () => {
        if (!formData.name || !formData.website) {
            setErrors({ ...errors, description: 'Name and Website required for AI generation' });
            return;
        }

        setIsGeneratingDescription(true);
        try {
            const res = await fetch(`${apiUrl}/api/admin/tools/generate-description`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    website: formData.website,
                    tagline: formData.tagline,
                    features: formData.key_features,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setFormData(prev => ({
                    ...prev,
                    short_description: data.short_description || prev.short_description,
                    description: data.description || prev.description,
                    tagline: data.tagline || prev.tagline,
                    key_features: data.features?.length ? data.features : prev.key_features,
                    use_cases: data.use_cases?.length ? data.use_cases : prev.use_cases,
                }));
            } else {
                showError('Error', 'Failed to generate description');
            }
        } catch (error) {
            showError('Error', 'Network error occurred');
        } finally {
            setIsGeneratingDescription(false);
        }
    };

    const handleFetchLogo = async () => {
        if (!formData.website) {
            showError('Website required', 'Please enter the tool website URL first');
            return;
        }

        setIsFetchingLogo(true);
        try {
            // First try to fetch from metadata API
            const res = await fetch(`${apiUrl}/api/admin/tools/fetch-logo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ url: formData.website }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.logo_url) {
                    setFormData(prev => ({ ...prev, logo_url: data.logo_url }));
                } else {
                    showError('No logo found', 'Could not find a logo for this website');
                }
            } else {
                // Fallback to Google favicon service
                const url = new URL(formData.website);
                const googleFavicon = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`;
                setFormData(prev => ({ ...prev, logo_url: googleFavicon }));
            }
        } catch (error) {
            // Fallback to Google favicon
            try {
                const url = new URL(formData.website);
                const googleFavicon = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`;
                setFormData(prev => ({ ...prev, logo_url: googleFavicon }));
            } catch {
                showError('Error', 'Failed to fetch logo');
            }
        } finally {
            setIsFetchingLogo(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/tools')}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEditing ? 'Edit Tool' : 'Create New Tool'}
                    </h1>
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/tools')}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isLoading ? 'Saving...' : 'Save Tool'}
                    </button>
                </div>
            </div>

            <CollapsibleSection title="Basic Info" defaultOpen={true}>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormInput
                        label="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        error={errors.name}
                    />
                    <FormInput
                        label="Slug"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        required
                        error={errors.slug}
                    />
                    <div className="sm:col-span-2">
                        <FormInput
                            label="Website URL"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            required
                            error={errors.website}
                            placeholder="https://..."
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <FormInput
                        label="Tagline"
                        value={formData.tagline}
                        onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                        placeholder="A short catchy tagline..."
                    />
                </div>

                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source URL (for auto-fetch)</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={formData.repo_url}
                            onChange={(e) => setFormData({ ...formData, repo_url: e.target.value })}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="e.g. Hugging Face, GitHub, OpenRouter URL"
                        />
                        <button
                            type="button"
                            onClick={handleFetchMetadata}
                            disabled={isFetchingMetadata}
                            className="bg-gray-100 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                        >
                            {isFetchingMetadata ? 'Fetching...' : 'Fetch'}
                        </button>
                    </div>
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Description & Features" defaultOpen={true}>
                <div className="mb-6 flex justify-end">
                    <button
                        type="button"
                        onClick={handleGenerateDescription}
                        disabled={isGeneratingDescription}
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                        <SparklesIcon className="w-4 h-4" />
                        {isGeneratingDescription ? 'Generating...' : 'Auto-Generate with AI'}
                    </button>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Short Description
                    </label>
                    <textarea
                        rows={3}
                        value={formData.short_description}
                        onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                </div>

                <RichTextEditor
                    label="Full Description"
                    value={formData.description}
                    onChange={(val) => setFormData({ ...formData, description: val })}
                    height="300px"
                    error={errors.description}
                />

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-6">
                    <ArrayInput
                        label="Key Features"
                        value={formData.key_features}
                        onChange={(values) => setFormData({ ...formData, key_features: values })}
                    />
                    <ArrayInput
                        label="Use Cases"
                        value={formData.use_cases}
                        onChange={(values) => setFormData({ ...formData, use_cases: values })}
                    />
                    <ArrayInput
                        label="Pros"
                        value={formData.pros}
                        onChange={(values) => setFormData({ ...formData, pros: values })}
                    />
                    <ArrayInput
                        label="Cons"
                        value={formData.cons}
                        onChange={(values) => setFormData({ ...formData, cons: values })}
                    />
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Categorization" defaultOpen={true}>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <ResourceSelect
                        label="Categories"
                        resources={categories}
                        selectedIds={formData.categoryIds}
                        onChange={(ids) => setFormData({ ...formData, categoryIds: ids })}
                        placeholder="Search categories..."
                    />
                    <ResourceSelect
                        label="Jobs (Professional Roles)"
                        resources={jobs}
                        selectedIds={formData.jobIds}
                        onChange={(ids) => setFormData({ ...formData, jobIds: ids })}
                        placeholder="Search jobs..."
                    />
                    <ResourceSelect
                        label="Tasks (Specific Actions)"
                        resources={tasks}
                        selectedIds={formData.taskIds}
                        onChange={(ids) => setFormData({ ...formData, taskIds: ids })}
                        placeholder="Search tasks..."
                    />
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Pricing & Technical">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <ArrayInput
                        label="Pricing Models"
                        value={formData.pricing_type}
                        onChange={(values) => setFormData({ ...formData, pricing_type: values })}
                        placeholder="e.g. Free, Paid, API"
                    />
                    <FormInput
                        label="Price Range"
                        value={formData.price_range}
                        onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                    />
                    <div className="flex items-center mt-6">
                        <input
                            type="checkbox"
                            checked={formData.free_trial}
                            onChange={(e) => setFormData({ ...formData, free_trial: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label className="ml-2 block text-sm text-gray-900">Free Trial Available</label>
                    </div>
                    <div className="flex items-center mt-6">
                        <input
                            type="checkbox"
                            checked={formData.open_source}
                            onChange={(e) => setFormData({ ...formData, open_source: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label className="ml-2 block text-sm text-gray-900">Open Source</label>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-6">
                    <FormInput
                        label="Platforms"
                        value={formData.platforms}
                        onChange={(e) => setFormData({ ...formData, platforms: e.target.value })}
                        helperText="Comma separated"
                    />
                    <FormInput
                        label="Models Used"
                        value={formData.models_used}
                        onChange={(e) => setFormData({ ...formData, models_used: e.target.value })}
                        helperText="Comma separated"
                    />
                    <FormInput
                        label="API Docs URL"
                        value={formData.api_docs_url}
                        onChange={(e) => setFormData({ ...formData, api_docs_url: e.target.value })}
                    />
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Branding & Media">
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={formData.logo_url}
                                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                                className="block flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                placeholder="https://..."
                            />
                            <button
                                type="button"
                                onClick={handleFetchLogo}
                                disabled={isFetchingLogo || !formData.website}
                                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-600 text-white rounded-md text-sm font-medium hover:from-pink-600 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isFetchingLogo ? 'Fetching...' : 'Fetch Logo'}
                            </button>
                        </div>
                        {formData.logo_url && (
                            <div className="mt-3 flex items-center gap-3">
                                <img
                                    src={formData.logo_url}
                                    alt="Logo preview"
                                    className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                                <span className="text-xs text-gray-500">Logo preview</span>
                            </div>
                        )}
                    </div>
                    <FormInput
                        label="Social Share Image"
                        value={formData.social_share_image}
                        onChange={(e) => setFormData({ ...formData, social_share_image: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Primary Color"
                            type="color"
                            value={formData.brand_color_primary}
                            onChange={(e) => setFormData({ ...formData, brand_color_primary: e.target.value })}
                        />
                        <FormInput
                            label="Secondary Color"
                            type="color"
                            value={formData.brand_color_secondary}
                            onChange={(e) => setFormData({ ...formData, brand_color_secondary: e.target.value })}
                        />
                    </div>
                    <FormInput
                        label="Screenshots (URLs)"
                        value={formData.screenshots}
                        onChange={(e) => setFormData({ ...formData, screenshots: e.target.value })}
                        helperText="Comma separated URLs"
                    />
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Admin Status">
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.verified}
                            onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label className="ml-2 block text-sm text-gray-900">Verified</label>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.featured}
                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label className="ml-2 block text-sm text-gray-900">featured</label>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.trending}
                            onChange={(e) => setFormData({ ...formData, trending: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label className="ml-2 block text-sm text-gray-900">Trending</label>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.editors_choice}
                            onChange={(e) => setFormData({ ...formData, editors_choice: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label className="ml-2 block text-sm text-gray-900">Editor's Choice</label>
                    </div>
                </div>
            </CollapsibleSection>
        </form>
    );
}
