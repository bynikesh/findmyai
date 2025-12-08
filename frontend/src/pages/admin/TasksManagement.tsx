import React, { useEffect, useState } from 'react';
import { PencilIcon, TrashIcon, PlusIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import AdminLayout from '../../components/Admin/AdminLayout';
import DataTable from '../../components/Admin/DataTable';
import Modal from '../../components/Admin/Modal';
import FormInput from '../../components/Admin/FormInput';
import { useToast } from '../../contexts/ToastContext';
import { apiUrl } from '../../lib/constants';

interface Task {
    id: number;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    featured: boolean;
    _count?: { tools: number };
}

interface TaskForm {
    name: string;
    slug: string;
    description: string;
    icon: string;
    featured: boolean;
}

const getInitialForm = (): TaskForm => ({
    name: '',
    slug: '',
    description: '',
    icon: '',
    featured: false,
});

export default function TasksManagement() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [deletingTask, setDeletingTask] = useState<Task | null>(null);
    const [formData, setFormData] = useState<TaskForm>(getInitialForm());
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/api/tasks`);
            const data = await res.json();
            setTasks(data.tasks || []);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            showError('Failed to fetch tasks', 'Please try again');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setFormData(getInitialForm());
        setEditingTask(null);
        setErrors({});
        setIsFormOpen(true);
    };

    const handleEdit = (task: Task) => {
        setFormData({
            name: task.name,
            slug: task.slug,
            description: task.description || '',
            icon: task.icon || '',
            featured: task.featured,
        });
        setEditingTask(task);
        setErrors({});
        setIsFormOpen(true);
    };

    const handleDelete = (task: Task) => {
        setDeletingTask(task);
        setIsDeleteModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const payload = { ...formData, slug };

        try {
            const url = editingTask
                ? `${apiUrl}/api/admin/tasks/${editingTask.id}`
                : `${apiUrl}/api/admin/tasks`;
            const method = editingTask ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const savedTask = await res.json();
                if (editingTask) {
                    setTasks(tasks.map(t => t.id === savedTask.task.id ? savedTask.task : t));
                    showSuccess('Task updated', 'Changes have been saved');
                } else {
                    setTasks([savedTask.task, ...tasks]);
                    showSuccess('Task created', 'New task has been added');
                }
                setIsFormOpen(false);
                setFormData(getInitialForm());
                setEditingTask(null);
            } else {
                const errorData = await res.json();
                showError('Failed to save task', errorData.error || 'Please try again');
            }
        } catch (error) {
            console.error('Error saving task:', error);
            showError('Error saving task', 'Please try again');
        }
    };

    const confirmDelete = async () => {
        if (!deletingTask) return;

        try {
            const res = await fetch(`${apiUrl}/api/admin/tasks/${deletingTask.id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (res.ok) {
                setTasks(tasks.filter(t => t.id !== deletingTask.id));
                setIsDeleteModalOpen(false);
                setDeletingTask(null);
                showSuccess('Task deleted', 'The task has been removed');
            } else {
                const errorData = await res.json();
                showError('Failed to delete task', errorData.error || 'Please try again');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            showError('Error deleting task', 'Please try again');
        }
    };

    const columns = [
        {
            key: 'name',
            header: 'Name',
            render: (task: Task) => (
                <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                        <ClipboardDocumentListIcon className="h-4 w-4" />
                    </span>
                    <div>
                        <div className="font-medium text-gray-900">{task.name}</div>
                        <div className="text-xs text-gray-500">{task.slug}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'description',
            header: 'Description',
            render: (task: Task) => (
                <div className="max-w-md truncate text-gray-600">{task.description || '-'}</div>
            ),
        },
        {
            key: 'tools',
            header: 'Tools',
            render: (task: Task) => (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                    {task._count?.tools || 0} tools
                </span>
            ),
        },
        {
            key: 'featured',
            header: 'Status',
            render: (task: Task) => (
                <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${task.featured
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                >
                    {task.featured ? 'Featured' : 'Normal'}
                </span>
            ),
        },
    ];

    return (
        <AdminLayout>
            <div className="px-4 sm:px-6 lg:px-8 py-8">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="sm:flex-auto">
                        <h1 className="text-2xl font-semibold text-gray-900">Tasks Management</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Manage tasks that tools can perform (e.g., Create Images, Write Code)
                        </p>
                    </div>
                    <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                        <button
                            type="button"
                            onClick={handleCreate}
                            className="flex items-center gap-x-2 rounded-md bg-purple-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
                        >
                            <PlusIcon className="h-5 w-5" />
                            New Task
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="mt-8 flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                                <DataTable
                                    data={tasks}
                                    columns={columns}
                                    loading={loading}
                                    emptyMessage="No tasks found"
                                    actions={(task) => (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(task)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                                title="Edit"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(task)}
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

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingTask ? 'Edit Task' : 'Create New Task'}
                size="lg"
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
                            form="task-form"
                            className="inline-flex w-full justify-center rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 sm:w-auto"
                        >
                            {editingTask ? 'Save Changes' : 'Create Task'}
                        </button>
                    </>
                }
            >
                <form id="task-form" onSubmit={handleSave} className="space-y-4">
                    <FormInput
                        label="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Create Images"
                        required
                        error={errors.name}
                    />
                    <FormInput
                        label="Slug"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        helperText="Leave empty to auto-generate from name"
                        placeholder="e.g., create-images"
                    />
                    <FormInput
                        label="Description"
                        textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Brief description of this task"
                    />
                    <FormInput
                        label="Icon"
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        helperText="Heroicons icon name (e.g., photo, code-bracket)"
                        placeholder="e.g., photo"
                    />
                    <div className="flex items-center">
                        <input
                            id="featured"
                            type="checkbox"
                            checked={formData.featured}
                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                        />
                        <label htmlFor="featured" className="ml-3 block text-sm font-medium leading-6 text-gray-900">
                            Featured (Display in mega menu)
                        </label>
                    </div>
                </form>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Task"
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
                    Are you sure you want to delete <strong>{deletingTask?.name}</strong>?
                    {deletingTask?._count?.tools && deletingTask._count.tools > 0 && (
                        <span className="text-red-600"> This task has {deletingTask._count.tools} associated tools.</span>
                    )}
                    {' '}This action cannot be undone.
                </p>
            </Modal>
        </AdminLayout>
    );
}
