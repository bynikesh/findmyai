import React, { useEffect, useState } from 'react';
import { PencilIcon, TrashIcon, EyeIcon, PlusIcon } from '@heroicons/react/24/outline';
import AdminLayout from '../../components/Admin/AdminLayout';
import DataTable from '../../components/Admin/DataTable';
import Modal from '../../components/Admin/Modal';
import FormInput from '../../components/Admin/FormInput';
import CategorySelect from '../../components/Admin/CategorySelect';

interface Tool {
    id: number;
    name: string;
    slug: string;
    description: string;
    website: string;
    pricing: string | null;
    verified: boolean;
    createdAt: string;
}

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface NewToolForm {
    name: string;
    slug: string;
    description: string;
    website: string;
    pricing: string;
    platforms: string;
    models_used: string;
    logo_url: string;
    screenshots: string;
    categoryIds: number[];
}

export default function ToolsManagement() {
    const [tools, setTools] = useState<Tool[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingTool, setEditingTool] = useState<Tool | null>(null);
    const [editingCategoryIds, setEditingCategoryIds] = useState<number[]>([]);
    const [deletingTool, setDeletingTool] = useState<Tool | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newTool, setNewTool] = useState<NewToolForm>({
        name: '',
        slug: '',
        description: '',
        website: '',
        pricing: '',
        platforms: '',
        models_used: '',
        logo_url: '',
        screenshots: '',
        categoryIds: [],
    });

    useEffect(() => {
        fetchTools();
        fetchCategories();
    }, []);

    const fetchTools = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3000/api/tools?perPage=100');
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
            const res = await fetch('http://localhost:3000/api/categories');
            const data = await res.json();
            setCategories(data || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleEdit = async (tool: Tool) => {
        setEditingTool(tool);
        // Fetch full tool data with categories
        try {
            const res = await fetch(`http://localhost:3000/api/tools/${tool.slug}`);
            const data = await res.json();
            setEditingCategoryIds(data.categories?.map((c: any) => c.id) || []);
        } catch (error) {
            console.error('Failed to fetch tool categories:', error);
            setEditingCategoryIds([]);
        }
        setIsEditModalOpen(true);
    };

    const handleDelete = (tool: Tool) => {
        setDeletingTool(tool);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingTool) return;

        try {
            const res = await fetch(`http://localhost:3000/api/admin/tools/${deletingTool.id}`, {
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
                alert('Failed to delete tool');
            }
        } catch (error) {
            console.error('Error deleting tool:', error);
            alert('Failed to delete tool');
        }
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTool) return;

        try {
            const res = await fetch(`http://localhost:3000/api/admin/tools/${editingTool.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    ...editingTool,
                    categoryIds: editingCategoryIds,
                }),
            });

            if (res.ok) {
                const updatedTool = await res.json();
                setTools(tools.map((t) => (t.id === updatedTool.id ? updatedTool : t)));
                setIsEditModalOpen(false);
                setEditingTool(null);
            } else {
                alert('Failed to update tool');
            }
        } catch (error) {
            console.error('Error updating tool:', error);
            alert('Failed to update tool');
        }
    };

    const handleCreateTool = async (e: React.FormEvent) => {
        e.preventDefault();

        // Auto-generate slug from name if not provided
        const slug = newTool.slug || newTool.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        try {
            const res = await fetch('http://localhost:3000/api/tools', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    name: newTool.name,
                    slug,
                    description: newTool.description,
                    website: newTool.website,
                    pricing: newTool.pricing || null,
                    platforms: newTool.platforms ? newTool.platforms.split(',').map(p => p.trim()) : [],
                    models_used: newTool.models_used ? newTool.models_used.split(',').map(m => m.trim()) : [],
                    logo_url: newTool.logo_url || null,
                    screenshots: newTool.screenshots ? newTool.screenshots.split(',').map(s => s.trim()) : [],
                    verified: true, // Admin-created tools are verified by default
                    categoryIds: newTool.categoryIds,
                }),
            });

            if (res.ok) {
                const createdTool = await res.json();
                setTools([createdTool, ...tools]);
                setIsCreateModalOpen(false);
                setNewTool({
                    name: '',
                    slug: '',
                    description: '',
                    website: '',
                    pricing: '',
                    platforms: '',
                    models_used: '',
                    logo_url: '',
                    screenshots: '',
                    categoryIds: [],
                });
            } else {
                const errorData = await res.json();
                alert(`Failed to create tool: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error creating tool:', error);
            alert('Failed to create tool');
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
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-x-2 rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                            <PlusIcon className="h-5 w-5" />
                            New Tool
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="mt-6">
                    <input
                        type="text"
                        placeholder="Search tools..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
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

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Tool"
                size="xl"
                footer={
                    <>
                        <button
                            type="button"
                            onClick={() => setIsEditModalOpen(false)}
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="edit-tool-form"
                            className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:w-auto"
                        >
                            Save Changes
                        </button>
                    </>
                }
            >
                {editingTool && (
                    <form id="edit-tool-form" onSubmit={handleSaveEdit} className="space-y-4">
                        <FormInput
                            label="Name"
                            value={editingTool.name}
                            onChange={(e) => setEditingTool({ ...editingTool, name: e.target.value })}
                            required
                        />
                        <FormInput
                            label="Slug"
                            value={editingTool.slug}
                            onChange={(e) => setEditingTool({ ...editingTool, slug: e.target.value })}
                            required
                        />
                        <FormInput
                            label="Website"
                            type="url"
                            value={editingTool.website}
                            onChange={(e) => setEditingTool({ ...editingTool, website: e.target.value })}
                            required
                        />
                        <FormInput
                            label="Description"
                            textarea
                            rows={4}
                            value={editingTool.description}
                            onChange={(e) => setEditingTool({ ...editingTool, description: e.target.value })}
                            required
                        />
                        <FormInput
                            label="Pricing"
                            value={editingTool.pricing || ''}
                            onChange={(e) => setEditingTool({ ...editingTool, pricing: e.target.value })}
                        />
                        <CategorySelect
                            label="Categories"
                            categories={categories}
                            selectedIds={editingCategoryIds}
                            onChange={setEditingCategoryIds}
                            helperText="Select one or more categories"
                        />
                    </form>
                )}
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

            {/* Create Tool Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Tool"
                size="xl"
                footer={
                    <>
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="create-tool-form"
                            className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:w-auto"
                        >
                            Create Tool
                        </button>
                    </>
                }
            >
                <form id="create-tool-form" onSubmit={handleCreateTool} className="space-y-4">
                    <FormInput
                        label="Name"
                        value={newTool.name}
                        onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                        required
                    />
                    <FormInput
                        label="Slug"
                        value={newTool.slug}
                        onChange={(e) => setNewTool({ ...newTool, slug: e.target.value })}
                        helperText="Leave empty to auto-generate from name"
                    />
                    <FormInput
                        label="Website"
                        type="url"
                        value={newTool.website}
                        onChange={(e) => setNewTool({ ...newTool, website: e.target.value })}
                        required
                    />
                    <FormInput
                        label="Description"
                        textarea
                        rows={4}
                        value={newTool.description}
                        onChange={(e) => setNewTool({ ...newTool, description: e.target.value })}
                        required
                    />
                    <FormInput
                        label="Pricing"
                        value={newTool.pricing}
                        onChange={(e) => setNewTool({ ...newTool, pricing: e.target.value })}
                        helperText="e.g., Free, Freemium, Paid, $19/mo"
                    />
                    <FormInput
                        label="Platforms"
                        value={newTool.platforms}
                        onChange={(e) => setNewTool({ ...newTool, platforms: e.target.value })}
                        helperText="Comma-separated, e.g., Web, iOS, Android"
                    />
                    <FormInput
                        label="Models Used"
                        value={newTool.models_used}
                        onChange={(e) => setNewTool({ ...newTool, models_used: e.target.value })}
                        helperText="Comma-separated, e.g., GPT-4, Claude, Gemini"
                    />
                    <FormInput
                        label="Logo URL"
                        type="url"
                        value={newTool.logo_url}
                        onChange={(e) => setNewTool({ ...newTool, logo_url: e.target.value })}
                    />
                    <CategorySelect
                        label="Categories"
                        categories={categories}
                        selectedIds={newTool.categoryIds}
                        onChange={(ids) => setNewTool({ ...newTool, categoryIds: ids })}
                        helperText="Select one or more categories"
                    />
                    <FormInput
                        label="Screenshots"
                        value={newTool.screenshots}
                        onChange={(e) => setNewTool({ ...newTool, screenshots: e.target.value })}
                        helperText="Comma-separated URLs"
                    />
                </form>
            </Modal>
        </AdminLayout>
    );
}
