import React, { useEffect, useState } from 'react';
import { PencilIcon, TrashIcon, PlusIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import AdminLayout from '../../components/Admin/AdminLayout';
import DataTable from '../../components/Admin/DataTable';
import Modal from '../../components/Admin/Modal';
import FormInput from '../../components/Admin/FormInput';
import { useToast } from '../../contexts/ToastContext';
import { apiUrl } from '../../lib/constants';

interface Job {
    id: number;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    featured: boolean;
    _count?: { tools: number };
}

interface JobForm {
    name: string;
    slug: string;
    description: string;
    icon: string;
    featured: boolean;
}

const getInitialForm = (): JobForm => ({
    name: '',
    slug: '',
    description: '',
    icon: '',
    featured: false,
});

export default function JobsManagement() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [deletingJob, setDeletingJob] = useState<Job | null>(null);
    const [formData, setFormData] = useState<JobForm>(getInitialForm());
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/api/jobs`);
            const data = await res.json();
            setJobs(data.jobs || []);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
            showError('Failed to fetch jobs', 'Please try again');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setFormData(getInitialForm());
        setEditingJob(null);
        setErrors({});
        setIsFormOpen(true);
    };

    const handleEdit = (job: Job) => {
        setFormData({
            name: job.name,
            slug: job.slug,
            description: job.description || '',
            icon: job.icon || '',
            featured: job.featured,
        });
        setEditingJob(job);
        setErrors({});
        setIsFormOpen(true);
    };

    const handleDelete = (job: Job) => {
        setDeletingJob(job);
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
            const url = editingJob
                ? `${apiUrl}/api/admin/jobs/${editingJob.id}`
                : `${apiUrl}/api/admin/jobs`;
            const method = editingJob ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const savedJob = await res.json();
                if (editingJob) {
                    setJobs(jobs.map(j => j.id === savedJob.job.id ? savedJob.job : j));
                    showSuccess('Job updated', 'Changes have been saved');
                } else {
                    setJobs([savedJob.job, ...jobs]);
                    showSuccess('Job created', 'New job role has been added');
                }
                setIsFormOpen(false);
                setFormData(getInitialForm());
                setEditingJob(null);
            } else {
                const errorData = await res.json();
                showError('Failed to save job', errorData.error || 'Please try again');
            }
        } catch (error) {
            console.error('Error saving job:', error);
            showError('Error saving job', 'Please try again');
        }
    };

    const confirmDelete = async () => {
        if (!deletingJob) return;

        try {
            const res = await fetch(`${apiUrl}/api/admin/jobs/${deletingJob.id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (res.ok) {
                setJobs(jobs.filter(j => j.id !== deletingJob.id));
                setIsDeleteModalOpen(false);
                setDeletingJob(null);
                showSuccess('Job deleted', 'The job role has been removed');
            } else {
                const errorData = await res.json();
                showError('Failed to delete job', errorData.error || 'Please try again');
            }
        } catch (error) {
            console.error('Error deleting job:', error);
            showError('Error deleting job', 'Please try again');
        }
    };

    const columns = [
        {
            key: 'name',
            header: 'Name',
            render: (job: Job) => (
                <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                        <BriefcaseIcon className="h-4 w-4" />
                    </span>
                    <div>
                        <div className="font-medium text-gray-900">{job.name}</div>
                        <div className="text-xs text-gray-500">{job.slug}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'description',
            header: 'Description',
            render: (job: Job) => (
                <div className="max-w-md truncate text-gray-600">{job.description || '-'}</div>
            ),
        },
        {
            key: 'tools',
            header: 'Tools',
            render: (job: Job) => (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                    {job._count?.tools || 0} tools
                </span>
            ),
        },
        {
            key: 'featured',
            header: 'Status',
            render: (job: Job) => (
                <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${job.featured
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                >
                    {job.featured ? 'Featured' : 'Normal'}
                </span>
            ),
        },
    ];

    return (
        <AdminLayout>
            <div className="px-4 sm:px-6 lg:px-8 py-8">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="sm:flex-auto">
                        <h1 className="text-2xl font-semibold text-gray-900">Jobs Management</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Manage job roles that tools can be categorized by (e.g., Data Scientist, Developer)
                        </p>
                    </div>
                    <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                        <button
                            type="button"
                            onClick={handleCreate}
                            className="flex items-center gap-x-2 rounded-md bg-emerald-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                        >
                            <PlusIcon className="h-5 w-5" />
                            New Job
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="mt-8 flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                                <DataTable
                                    data={jobs}
                                    columns={columns}
                                    loading={loading}
                                    emptyMessage="No jobs found"
                                    actions={(job) => (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(job)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                                title="Edit"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(job)}
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
                title={editingJob ? 'Edit Job' : 'Create New Job'}
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
                            form="job-form"
                            className="inline-flex w-full justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 sm:w-auto"
                        >
                            {editingJob ? 'Save Changes' : 'Create Job'}
                        </button>
                    </>
                }
            >
                <form id="job-form" onSubmit={handleSave} className="space-y-4">
                    <FormInput
                        label="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Data Scientist"
                        required
                        error={errors.name}
                    />
                    <FormInput
                        label="Slug"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        helperText="Leave empty to auto-generate from name"
                        placeholder="e.g., data-scientist"
                    />
                    <FormInput
                        label="Description"
                        textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Brief description of this job role"
                    />
                    <FormInput
                        label="Icon"
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        helperText="Heroicons icon name (e.g., chart-bar, code)"
                        placeholder="e.g., chart-bar"
                    />
                    <div className="flex items-center">
                        <input
                            id="featured"
                            type="checkbox"
                            checked={formData.featured}
                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600"
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
                title="Delete Job"
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
                    Are you sure you want to delete <strong>{deletingJob?.name}</strong>?
                    {deletingJob?._count?.tools && deletingJob._count.tools > 0 && (
                        <span className="text-red-600"> This job has {deletingJob._count.tools} associated tools.</span>
                    )}
                    {' '}This action cannot be undone.
                </p>
            </Modal>
        </AdminLayout>
    );
}
