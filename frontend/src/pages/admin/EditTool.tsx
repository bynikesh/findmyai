import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/Admin/AdminLayout';
import ToolForm, { ToolFormData, initialToolForm } from '../../components/Admin/ToolForm';
import { useToast } from '../../contexts/ToastContext';
import { apiUrl } from '../../lib/constants';
import Loader from '../../components/Loader';

// Helper to map API response to form data
const mapToolToForm = (tool: any): ToolFormData => ({
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
    pricing_type: tool.pricing_type || ['Freemium'],
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
    categoryIds: tool.categories?.map((c: any) => c.id) || [],
    jobIds: tool.jobs?.map((j: any) => j.id) || [],
    taskIds: tool.tasks?.map((t: any) => t.id) || [],
});

export default function EditTool() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [initialData, setInitialData] = useState<ToolFormData>(initialToolForm);

    useEffect(() => {
        if (id) fetchTool(id);
    }, [id]);

    const fetchTool = async (toolId: string) => {
        try {
            // Need to fetch via slug usually for public, but for admin by ID is better.
            // However, our getToolBySlug is public.
            // Let's use the list endpoint with ID filter if needed, OR just use the detail endpoint if we have one by ID.
            // Checking backend routes... we use slug for public.
            // Creating a dedicated 'GET /api/admin/tools/:id' would be best, but 'GET /api/tools/:slug' returns relations too.
            // But we have the ID here.

            // Wait, standard CRUD usually has get by ID.
            // I'll assume we can fetch by slug if I knew it, but I only have ID from the URL if I route by ID.
            // Admin table has the full object, I could pass state, but deep linking is better.
            // Let's check if there is a get-by-id endpoint.
            // There isn't one explicitly in `toolController` except delete/update.
            // I'll fetch the list filtering by ID or modify backend.
            // Actually, `getToolBySlug` includes categories/tags.
            // But I don't have the slug easily if I just clicked "Edit".
            // I'll iterate the list for now or just add a GET /admin/tools/:id endpoint.
            // Adding the endpoint is safer.

            // Wait, looking at `toolController.ts` again...
            // `getToolBySlug` (line 208) gets by slug.

            // I will use `GET /api/tools?search=...` to find it? No.
            // I will add `GET /api/admin/tools/:id` to `toolsAdmin.ts` quickly.

            // Actually, let's just use the `ToolsManagement` approach for now?
            // "edit tools ... opens as a pop up, rather lets have it in a page".
            // If I navigate to `/admin/tools/:id`, I need to fetch the tool.

            // Let's add the endpoint. It's clean.

            // Temporary workaround: I'll use the public endpoint if I can get the slug.
            // But I don't have the slug.

            // I'll just add the endpoint to `backend/src/routes/toolsAdmin.ts`.
            // But first let's finish this file assuming the endpoint exists.

            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/api/admin/tools/${toolId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setInitialData(mapToolToForm(data));
            } else {
                showError('Error', 'Failed to fetch tool details');
                navigate('/admin/tools');
            }

        } catch (error) {
            console.error('Error fetching tool:', error);
            showError('Error', 'Network error');
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async (formData: ToolFormData) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/api/admin/tools/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                showSuccess('Tool Updated', 'The changes have been saved.');
                navigate('/admin/tools');
            } else {
                const error = await res.json();
                showError('Error', error.message || 'Failed to update tool');
            }
        } catch (error) {
            console.error('Update tool error:', error);
            showError('Error', 'Network error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) return <Loader />;

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ToolForm initialData={initialData} isEditing={true} onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
        </AdminLayout>
    );
}
