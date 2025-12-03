import React, { useEffect, useState } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import AdminLayout from '../../components/Admin/AdminLayout';
import DataTable from '../../components/Admin/DataTable';
import Modal from '../../components/Admin/Modal';
import FormInput from '../../components/Admin/FormInput';
import { apiUrl } from '../../lib/constants';

interface Category {
    id: number;
    name: string;
    slug: string;
    featured: boolean;
    seo_description?: string;
    createdAt: string;
}

interface CategoryForm {
    name: string;
    slug: string;
    seo_description: string;
    featured: boolean;
}

export default function CategoriesManagement() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [newCategory, setNewCategory] = useState<CategoryForm>({
        name: '',
        slug: '',
        seo_description: '',
        featured: false,
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/api/categories`);
            const data = await res.json();
            setCategories(data || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setIsEditModalOpen(true);
    };

    const handleDelete = (category: Category) => {
        setDeletingCategory(category);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingCategory) return;

        try {
            const res = await fetch(`${apiUrl}/api/admin/categories/${deletingCategory.id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (res.ok) {
                setCategories(categories.filter((c) => c.id !== deletingCategory.id));
                setIsDeleteModalOpen(false);
                setDeletingCategory(null);
            } else {
                alert('Failed to delete category');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Failed to delete category');
        }
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;

        try {
            const res = await fetch(`${apiUrl}/api/admin/categories/${editingCategory.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(editingCategory),
            });

            if (res.ok) {
                const updatedCategory = await res.json();
                setCategories(categories.map((c) => (c.id === updatedCategory.id ? updatedCategory : c)));
                setIsEditModalOpen(false);
                setEditingCategory(null);
            } else {
                alert('Failed to update category');
            }
        } catch (error) {
            console.error('Error updating category:', error);
            alert('Failed to update category');
        }
    };

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();

        // Auto-generate slug from name if not provided
        const slug = newCategory.slug || newCategory.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        try {
            const res = await fetch(`${apiUrl}/api/admin/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    name: newCategory.name,
                    slug,
                    seo_description: newCategory.seo_description || null,
                    featured: newCategory.featured,
                }),
            });

            if (res.ok) {
                const createdCategory = await res.json();
                setCategories([createdCategory, ...categories]);
                setIsCreateModalOpen(false);
                setNewCategory({
                    name: '',
                    slug: '',
                    seo_description: '',
                    featured: false,
                });
            } else {
                const errorData = await res.json();
                alert(`Failed to create category: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error creating category:', error);
            alert('Failed to create category');
        }
    };

    const columns = [
        {
            key: 'name',
            header: 'Name',
            render: (category: Category) => (
                <div>
                    <div className="font-medium text-gray-900">{category.name}</div>
                    <div className="text-xs text-gray-500">{category.slug}</div>
                </div>
            ),
        },
        {
            key: 'seo_description',
            header: 'Description',
            render: (category: Category) => (
                <div className="max-w-md truncate">{category.seo_description || '-'}</div>
            ),
        },
        {
            key: 'createdAt',
            header: 'Created',
            render: (category: Category) => (
                <span className="text-sm text-gray-500">
                    {new Date(category.createdAt).toLocaleDateString()}
                </span>
            ),
        },
    ];

    return (
        <AdminLayout>
            <div className="px-4 sm:px-6 lg:px-8 py-8">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="sm:flex-auto">
                        <h1 className="text-2xl font-semibold text-gray-900">Categories Management</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Manage tool categories
                        </p>
                    </div>
                    <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-x-2 rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                            <PlusIcon className="h-5 w-5" />
                            New Category
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="mt-8 flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                                <DataTable
                                    data={categories}
                                    columns={columns}
                                    loading={loading}
                                    emptyMessage="No categories found"
                                    actions={(category) => (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(category)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                                title="Edit"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category)}
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

            {/* Create Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Category"
                size="lg"
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
                            form="create-category-form"
                            className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:w-auto"
                        >
                            Create Category
                        </button>
                    </>
                }
            >
                <form id="create-category-form" onSubmit={handleCreateCategory} className="space-y-4">
                    <FormInput
                        label="Name"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        required
                    />
                    <FormInput
                        label="Slug"
                        value={newCategory.slug}
                        onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                        helperText="Leave empty to auto-generate from name"
                    />
                    <FormInput
                        label="Description"
                        textarea
                        rows={3}
                        value={newCategory.seo_description}
                        onChange={(e) => setNewCategory({ ...newCategory, seo_description: e.target.value })}
                    />
                    <div className="flex items-center">
                        <input
                            id="featured-create"
                            type="checkbox"
                            checked={newCategory.featured}
                            onChange={(e) => setNewCategory({ ...newCategory, featured: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                        />
                        <label htmlFor="featured-create" className="ml-3 block text-sm font-medium leading-6 text-gray-900">
                            Featured (Display on home page)
                        </label>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Category"
                size="lg"
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
                            form="edit-category-form"
                            className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:w-auto"
                        >
                            Save Changes
                        </button>
                    </>
                }
            >
                {editingCategory && (
                    <form id="edit-category-form" onSubmit={handleSaveEdit} className="space-y-4">
                        <FormInput
                            label="Name"
                            value={editingCategory.name}
                            onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                            required
                        />
                        <FormInput
                            label="Slug"
                            value={editingCategory.slug}
                            onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                            required
                        />
                        <FormInput
                            label="Description"
                            textarea
                            rows={3}
                            value={editingCategory.seo_description || ''}
                            onChange={(e) => setEditingCategory({ ...editingCategory, seo_description: e.target.value })}
                        />
                        <div className="flex items-center">
                            <input
                                id="featured-edit"
                                type="checkbox"
                                checked={editingCategory.featured}
                                onChange={(e) => setEditingCategory({ ...editingCategory, featured: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                            />
                            <label htmlFor="featured-edit" className="ml-3 block text-sm font-medium leading-6 text-gray-900">
                                Featured (Display on home page)
                            </label>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Category"
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
                    Are you sure you want to delete <strong>{deletingCategory?.name}</strong>? This action cannot be undone.
                </p>
            </Modal>
        </AdminLayout>
    );
}
