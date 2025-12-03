import React, { useEffect, useState } from 'react';
import { PencilIcon, TrashIcon, EyeIcon, PlusIcon, SparklesIcon } from '@heroicons/react/24/outline';
import AdminLayout from '../../components/Admin/AdminLayout';
import DataTable from '../../components/Admin/DataTable';
import Modal from '../../components/Admin/Modal';
import FormInput from '../../components/Admin/FormInput';
import CategorySelect from '../../components/Admin/CategorySelect';
import CollapsibleSection from '../../components/Admin/CollapsibleSection';
import ArrayInput from '../../components/Admin/ArrayInput';
import { useToast } from '../../contexts/ToastContext';
import { apiUrl } from '../../lib/constants';

interface Tool {
    id: number;
    name: string;
    slug: string;
    tagline?: string;
    short_description?: string;
    description: string;
    website: string;

    // Detailed Info
    key_features: string[];
    pros: string[];
    cons: string[];
    ideal_for?: string;

    // Pricing
    pricing_type?: string;
    pricing: string | null;
    price_range?: string;
    free_trial: boolean;
    open_source: boolean;
    repo_url?: string;

    // Technical
    platforms: string[];
    models_used: string[];
    primary_model?: string;
    integrations: string[];
    api_available: boolean;
    api_docs_url?: string;

    // Branding
    logo_url: string | null;
    brand_color_primary?: string;
    brand_color_secondary?: string;
    screenshots: string[];

    // Metadata
    release_year?: number;
    company_name?: string;
    company_size?: string;

    // SEO
    seo_title?: string;
    seo_meta_description?: string;
    social_share_image?: string;

    // Engagement
    use_cases: string[];
    allow_reviews: boolean;

    // Admin Status
    verified: boolean;
    featured: boolean;
    trending: boolean;
    editors_choice: boolean;
    still_active: boolean;

    // Analytics
    click_count: number;
    view_count: number;

    // Existing
    average_rating: number | null;
    review_count: number;
    createdAt: string;
    categories: Category[];
}

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface NewToolForm {
    // Basic Info
    name: string;
    slug: string;
    tagline: string;
    short_description: string;
    website: string;

    // Detailed Information
    description: string;
    key_features: string[];
    pros: string[];
    cons: string[];
    ideal_for: string;

    // Pricing & Access
    pricing_type: string;
    pricing: string;
    price_range: string;
    free_trial: boolean;
    open_source: boolean;
    repo_url: string;

    // Technical Info
    platforms: string;
    models_used: string;
    primary_model: string;
    integrations: string[];
    api_available: boolean;
    api_docs_url: string;

    // Branding
    logo_url: string;
    brand_color_primary: string;
    brand_color_secondary: string;
    screenshots: string;

    // Metadata
    release_year: string;
    company_name: string;
    company_size: string;

    // SEO
    seo_title: string;
    seo_meta_description: string;
    social_share_image: string;

    // Engagement
    use_cases: string[];
    allow_reviews: boolean;

    // Admin Status
    verified: boolean;
    featured: boolean;
    trending: boolean;
    editors_choice: boolean;
    still_active: boolean;

    // Categorization
    categoryIds: number[];
}

const getInitialToolForm = (): NewToolForm => ({
    // Basic Info
    name: '',
    slug: '',
    tagline: '',
    short_description: '',
    website: '',

    // Detailed Information
    description: '',
    key_features: [],
    pros: [],
    cons: [],
    ideal_for: '',

    // Pricing & Access
    pricing_type: 'Freemium',
    pricing: '',
    price_range: '',
    free_trial: false,
    open_source: false,
    repo_url: '',

    // Technical Info
    platforms: '',
    models_used: '',
    primary_model: '',
    integrations: [],
    api_available: false,
    api_docs_url: '',

    // Branding
    logo_url: '',
    brand_color_primary: '#3B82F6',
    brand_color_secondary: '#8B5CF6',
    screenshots: '',

    // Metadata
    release_year: new Date().getFullYear().toString(),
    company_name: '',
    company_size: '',

    // SEO
    seo_title: '',
    seo_meta_description: '',
    social_share_image: '',

    // Engagement
    use_cases: [],
    allow_reviews: true,

    // Admin Status
    verified: true,
    featured: false,
    trending: false,
    editors_choice: false,
    still_active: true,

    // Categorization
    categoryIds: [],
});

const mapToolToForm = (tool: Tool): NewToolForm => ({
    name: tool.name,
    slug: tool.slug,
    tagline: tool.tagline || '',
    short_description: tool.short_description || '',
    website: tool.website,
    description: tool.description,
    key_features: tool.key_features || [],
    pros: tool.pros || [],
    cons: tool.cons || [],
    ideal_for: tool.ideal_for || '',
    pricing_type: tool.pricing_type || 'Freemium',
    pricing: tool.pricing || '',
    price_range: tool.price_range || '',
    free_trial: tool.free_trial || false,
    open_source: tool.open_source || false,
    repo_url: tool.repo_url || '',
    platforms: tool.platforms?.join(', ') || '',
    models_used: tool.models_used?.join(', ') || '',
    primary_model: tool.primary_model || '',
    integrations: tool.integrations || [],
    api_available: tool.api_available || false,
    api_docs_url: tool.api_docs_url || '',
    logo_url: tool.logo_url || '',
    brand_color_primary: tool.brand_color_primary || '#3B82F6',
    brand_color_secondary: tool.brand_color_secondary || '#8B5CF6',
    screenshots: tool.screenshots?.join(', ') || '',
    release_year: tool.release_year?.toString() || '',
    company_name: tool.company_name || '',
    company_size: tool.company_size || '',
    seo_title: tool.seo_title || '',
    seo_meta_description: tool.seo_meta_description || '',
    social_share_image: tool.social_share_image || '',
    use_cases: tool.use_cases || [],
    allow_reviews: tool.allow_reviews ?? true,
    verified: tool.verified,
    featured: tool.featured,
    trending: tool.trending,
    editors_choice: tool.editors_choice,
    still_active: tool.still_active,
    categoryIds: tool.categories?.map(c => c.id) || [],
});

export default function ToolsManagement() {
    const { showSuccess, showError } = useToast();
    const [tools, setTools] = useState<Tool[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending'>('all');

    // Unified Form State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingToolId, setEditingToolId] = useState<number | null>(null);
    const [formData, setFormData] = useState<NewToolForm>(getInitialToolForm());
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

    // Auto‑generate slug from name if slug is empty
    useEffect(() => {
        if (!formData.slug && formData.name) {
            const generated = formData.name
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');
            setFormData(prev => ({ ...prev, slug: generated }));
        }
    }, [formData.name]);

    const [deletingTool, setDeletingTool] = useState<Tool | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        fetchTools();
        fetchCategories();
    }, [statusFilter]); // Re-fetch when status filter changes

    const fetchTools = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/api/admin/tools?perPage=100&status=${statusFilter}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setTools(data.data || []);
        } catch (error) {
            console.error('Failed to fetch tools:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/categories`); // Removed hardcoded localhost
            const data = await res.json();
            setCategories(data || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleEdit = (tool: Tool) => {
        setFormData(mapToolToForm(tool));
        setEditingToolId(tool.id);
        setIsFormOpen(true);
    };

    const handleDelete = (tool: Tool) => {
        setDeletingTool(tool);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingTool) return;

        try {
            const res = await fetch(`${apiUrl}/api/admin/tools/${deletingTool.id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (res.ok) {
                setTools(tools.filter((t) => t.id !== deletingTool.id));
                setIsDeleteModalOpen(false);
                setDeletingTool(null);
            } else {
                console.error('Failed to delete tool');
            }
        } catch (error) {
            console.error('Error deleting tool:', error);
        }
    };

    const handleAutoFetch = async () => {
        if (!formData.website || !/^https?:\/\/[^\s]+$/.test(formData.website)) {
            setErrors({ ...errors, website: 'Valid URL required for auto-fetch' });
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
                body: JSON.stringify({ url: formData.website }),
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
                console.error('Failed to fetch metadata');
                showError('Failed to fetch metadata', 'Please check the URL and try again');
            }
        } catch (error) {
            console.error('Error fetching metadata:', error);
            showError('Error fetching metadata', 'Network error occurred');
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
                console.error('Failed to generate description');
                showError('Failed to generate description', 'Please try again');
            }
        } catch (error) {
            console.error('Error generating description:', error);
            showError('Error generating description', 'Network error occurred');
        } finally {
            setIsGeneratingDescription(false);
        }
    };

    const handleSaveTool = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
        if (!formData.website.trim()) {
            newErrors.website = 'Website is required';
        } else if (!/^https?:\/\/[^\s]+$/.test(formData.website)) {
            newErrors.website = 'Invalid URL';
        }
        if (!formData.description.trim()) newErrors.description = 'Description is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        const isEditing = editingToolId !== null;
        const url = isEditing ? `${apiUrl}/api/admin/tools/${editingToolId}` : `${apiUrl}/api/tools`;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const savedTool = await res.json();

                if (isEditing) {
                    setTools(tools.map((t) => (t.id === savedTool.id ? savedTool : t)));
                } else {
                    setTools([savedTool, ...tools]);
                }

                setIsFormOpen(false);
                setFormData(getInitialToolForm());
                setEditingToolId(null);
                setErrors({});
                showSuccess(
                    editingToolId ? 'Tool updated successfully' : 'Tool created successfully',
                    editingToolId ? 'Changes have been saved' : 'New tool has been added'
                );
            } else {
                const errorData = await res.json();
                console.error('Failed to save tool:', errorData);
                showError('Failed to save tool', errorData.message || 'Please try again');
            }
        } catch (error) {
            console.error('Error saving tool:', error);
            showError('Error saving tool', 'Please try again');
        }
    };

    const openCreateModal = () => {
        setFormData(getInitialToolForm());
        setEditingToolId(null);
        setIsFormOpen(true);
    };

    const handleApprove = async (tool: Tool) => {
        try {
            const res = await fetch(`${apiUrl}/api/admin/tools/${tool.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ verified: true }),
            });

            if (res.ok) {
                setTools(tools.map((t) => (t.id === tool.id ? { ...t, verified: true } : t)));
                showSuccess('Tool approved', 'The tool is now visible to users');
            } else {
                console.error('Failed to approve tool');
                showError('Failed to approve tool', 'Please try again');
            }
        } catch (error) {
            console.error('Error approving tool:', error);
            showError('Error approving tool', 'Please try again');
        }
    };

    const filteredTools = tools.filter((tool) =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns = [
        {
            key: 'name',
            header: 'Name',
            render: (tool: Tool) => (
                <div>
                    <div className="font-medium text-gray-900">{tool.name}</div>
                    <div className="text-xs text-gray-500">{tool.slug}</div>
                </div>
            ),
        },
        {
            key: 'description',
            header: 'Description',
            render: (tool: Tool) => (
                <div className="max-w-xs truncate">{tool.description}</div>
            ),
        },
        {
            key: 'pricing',
            header: 'Pricing',
        },
        {
            key: 'verified',
            header: 'Status',
            render: (tool: Tool) => (
                <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${tool.verified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                        }`}
                >
                    {tool.verified ? 'Verified' : 'Pending'}
                </span>
            ),
        },
    ];

    return (
        <AdminLayout>
            <div className="px-4 sm:px-6 lg:px-8 py-8">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="sm:flex-auto">
                        <h1 className="text-2xl font-semibold text-gray-900">Tools Management</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Manage all AI tools in the directory
                        </p>
                    </div>
                    <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="flex items-center gap-x-2 rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                            <PlusIcon className="h-5 w-5" />
                            New Tool
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="mt-6 flex gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search tools..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                    </div>
                    <div className="w-48">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                            <option value="all">All Status</option>
                            <option value="verified">Verified</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="mt-8 flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                                <DataTable
                                    data={filteredTools}
                                    columns={columns}
                                    loading={loading}
                                    emptyMessage="No tools found"
                                    actions={(tool) => (
                                        <div className="flex gap-2">
                                            {!tool.verified && (
                                                <button
                                                    onClick={() => handleApprove(tool)}
                                                    className="text-green-600 hover:text-green-900 font-medium text-xs border border-green-600 px-2 py-1 rounded"
                                                    title="Approve"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            <button
                                                onClick={() => window.open(`/tools/${tool.slug}`, '_blank')}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="View"
                                            >
                                                <EyeIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(tool)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                                title="Edit"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(tool)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Delete"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Unified Tool Modal */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingToolId ? "Edit Tool" : "Create New Tool"}
                size="xl"
                footer={
                    <>
                        <button
                            type="button"
                            onClick={() => setIsFormOpen(false)}
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="tool-form"
                            className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:w-auto"
                        >
                            {editingToolId ? "Save Changes" : "Create Tool"}
                        </button>
                    </>
                }
            >
                <form id="tool-form" onSubmit={handleSaveTool} className="space-y-4">
                    <CollapsibleSection title="Basic Info" defaultOpen={true}>
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
                            helperText="Leave empty to auto-generate from name"
                            error={errors.slug}
                        />
                        <FormInput
                            label="Tagline"
                            value={formData.tagline}
                            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                            helperText="Max 80 characters"
                            maxLength={80}
                        />
                        <div className="flex gap-2 items-end">
                            <div className="flex-grow">
                                <FormInput
                                    label="Website URL"
                                    type="url"
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    required
                                    error={errors.website}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleAutoFetch}
                                disabled={isFetchingMetadata}
                                className="mb-5 inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                                title="Auto-fill from website"
                            >
                                {isFetchingMetadata ? (
                                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                ) : (
                                    <SparklesIcon className="h-5 w-5" />
                                )}
                                Auto-Fetch
                            </button>
                        </div>
                        <FormInput
                            label="Short Description"
                            textarea
                            rows={2}
                            value={formData.short_description}
                            onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                            helperText="1-2 lines summary"
                            maxLength={160}
                        />
                    </CollapsibleSection>

                    <CollapsibleSection title="Detailed Information">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium leading-6 text-gray-900">
                                Full Description
                            </label>
                            <button
                                type="button"
                                onClick={handleGenerateDescription}
                                disabled={isGeneratingDescription}
                                className="inline-flex items-center gap-x-1.5 rounded-md bg-purple-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 disabled:opacity-50"
                            >
                                {isGeneratingDescription ? (
                                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                ) : (
                                    <SparklesIcon className="h-4 w-4" />
                                )}
                                Generate with AI
                            </button>
                        </div>
                        <FormInput
                            label=""
                            textarea
                            rows={6}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            error={errors.description}
                        />
                        <ArrayInput
                            label="Key Features"
                            value={formData.key_features}
                            onChange={(val) => setFormData({ ...formData, key_features: val })}
                        />
                        <ArrayInput
                            label="Pros"
                            value={formData.pros}
                            onChange={(val) => setFormData({ ...formData, pros: val })}
                        />
                        <ArrayInput
                            label="Cons"
                            value={formData.cons}
                            onChange={(val) => setFormData({ ...formData, cons: val })}
                        />
                        <FormInput
                            label="Ideal For"
                            value={formData.ideal_for}
                            onChange={(e) => setFormData({ ...formData, ideal_for: e.target.value })}
                            placeholder="e.g., Content creators, developers"
                        />
                    </CollapsibleSection>

                    <CollapsibleSection title="Pricing & Access">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium leading-6 text-gray-900">Pricing Type</label>
                                <select
                                    value={formData.pricing_type}
                                    onChange={(e) => setFormData({ ...formData, pricing_type: e.target.value })}
                                    className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                                >
                                    <option value="Free">Free</option>
                                    <option value="Freemium">Freemium</option>
                                    <option value="Paid">Paid</option>
                                    <option value="One-time">One-time</option>
                                    <option value="Open Source">Open Source</option>
                                </select>
                            </div>
                            <FormInput
                                label="Price Range"
                                value={formData.price_range}
                                onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                                placeholder="e.g., $19-99/mo"
                            />
                        </div>
                        <FormInput
                            label="Pricing Details"
                            value={formData.pricing}
                            onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                            helperText="Additional pricing info"
                        />
                        <div className="flex gap-6 mt-4">
                            <div className="flex items-center">
                                <input
                                    id="free-trial"
                                    type="checkbox"
                                    checked={formData.free_trial}
                                    onChange={(e) => setFormData({ ...formData, free_trial: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                                />
                                <label htmlFor="free-trial" className="ml-2 block text-sm text-gray-900">Free Trial?</label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="open-source"
                                    type="checkbox"
                                    checked={formData.open_source}
                                    onChange={(e) => setFormData({ ...formData, open_source: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                                />
                                <label htmlFor="open-source" className="ml-2 block text-sm text-gray-900">Open Source?</label>
                            </div>
                        </div>
                        {formData.open_source && (
                            <FormInput
                                label="Repository URL"
                                value={formData.repo_url}
                                onChange={(e) => setFormData({ ...formData, repo_url: e.target.value })}
                            />
                        )}
                    </CollapsibleSection>

                    <CollapsibleSection title="Technical Info">
                        <FormInput
                            label="Platforms"
                            value={formData.platforms}
                            onChange={(e) => setFormData({ ...formData, platforms: e.target.value })}
                            helperText="Comma-separated, e.g., Web, iOS, Android"
                        />
                        <FormInput
                            label="Primary Model"
                            value={formData.primary_model}
                            onChange={(e) => setFormData({ ...formData, primary_model: e.target.value })}
                            placeholder="e.g., GPT-4"
                        />
                        <FormInput
                            label="Other Models Used"
                            value={formData.models_used}
                            onChange={(e) => setFormData({ ...formData, models_used: e.target.value })}
                            helperText="Comma-separated"
                        />
                        <ArrayInput
                            label="Integrations"
                            value={formData.integrations}
                            onChange={(val) => setFormData({ ...formData, integrations: val })}
                        />
                        <div className="flex items-center mt-4">
                            <input
                                id="api-available"
                                type="checkbox"
                                checked={formData.api_available}
                                onChange={(e) => setFormData({ ...formData, api_available: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                            />
                            <label htmlFor="api-available" className="ml-2 block text-sm text-gray-900">API Available?</label>
                        </div>
                        {formData.api_available && (
                            <FormInput
                                label="API Docs URL"
                                value={formData.api_docs_url}
                                onChange={(e) => setFormData({ ...formData, api_docs_url: e.target.value })}
                            />
                        )}
                    </CollapsibleSection>

                    <CollapsibleSection title="Branding">
                        <FormInput
                            label="Logo URL"
                            type="url"
                            value={formData.logo_url}
                            onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormInput
                                label="Primary Brand Color"
                                type="color"
                                value={formData.brand_color_primary}
                                onChange={(e) => setFormData({ ...formData, brand_color_primary: e.target.value })}
                            />
                            <FormInput
                                label="Secondary Brand Color"
                                type="color"
                                value={formData.brand_color_secondary}
                                onChange={(e) => setFormData({ ...formData, brand_color_secondary: e.target.value })}
                            />
                        </div>
                        <FormInput
                            label="Screenshots"
                            value={formData.screenshots}
                            onChange={(e) => setFormData({ ...formData, screenshots: e.target.value })}
                            helperText="Comma-separated URLs"
                        />
                    </CollapsibleSection>

                    <CollapsibleSection title="Categorization">
                        <CategorySelect
                            label="Categories"
                            categories={categories}
                            selectedIds={formData.categoryIds}
                            onChange={(ids) => setFormData({ ...formData, categoryIds: ids })}
                            helperText="Select one or more categories"
                        />
                        <ArrayInput
                            label="Use Cases"
                            value={formData.use_cases}
                            onChange={(val) => setFormData({ ...formData, use_cases: val })}
                        />
                    </CollapsibleSection>

                    <CollapsibleSection title="Admin Tools">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center">
                                <input
                                    id="verified"
                                    type="checkbox"
                                    checked={formData.verified}
                                    onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                                />
                                <label htmlFor="verified" className="ml-2 block text-sm text-gray-900">Verified Badge</label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="featured"
                                    type="checkbox"
                                    checked={formData.featured}
                                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                                />
                                <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">Featured Tool</label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="trending"
                                    type="checkbox"
                                    checked={formData.trending}
                                    onChange={(e) => setFormData({ ...formData, trending: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                                />
                                <label htmlFor="trending" className="ml-2 block text-sm text-gray-900">Trending</label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="editors-choice"
                                    type="checkbox"
                                    checked={formData.editors_choice}
                                    onChange={(e) => setFormData({ ...formData, editors_choice: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                                />
                                <label htmlFor="editors-choice" className="ml-2 block text-sm text-gray-900">Editor's Choice</label>
                            </div>
                        </div>
                    </CollapsibleSection>
                </form>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Tool"
                size="md"
                footer={
                    <>
                        <button
                            type="button"
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={confirmDelete}
                            className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:w-auto"
                        >
                            Delete
                        </button>
                    </>
                }
            >
                <p className="text-sm text-gray-500">
                    Are you sure you want to delete <strong>{deletingTool?.name}</strong>? This action cannot be undone.
                </p>
            </Modal>
        </AdminLayout>
    );
}
