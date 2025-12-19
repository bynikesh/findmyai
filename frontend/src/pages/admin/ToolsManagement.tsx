import React, { useEffect, useState } from 'react';
import { PencilIcon, TrashIcon, EyeIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/Admin/AdminLayout';
import DataTable from '../../components/Admin/DataTable';
import { useToast } from '../../contexts/ToastContext';
import { apiUrl } from '../../lib/constants';

interface Tool {
    id: number;
    name: string;
    slug: string;
    description: string;
    short_description?: string;
    website: string;
    verified: boolean;
    featured: boolean;
    pricing: string | null;
    logo_url?: string | null;
    categories: { id: number; name: string; slug: string }[];
}

export default function ToolsManagement() {
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending'>('all');

    // Bulk Actions State
    const [selectedToolIds, setSelectedToolIds] = useState<number[]>([]);

    useEffect(() => {
        fetchTools();
    }, [statusFilter]);

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

    const handleDelete = async (tool: Tool) => {
        if (!window.confirm(`Are you sure you want to delete "${tool.name}"?`)) return;

        try {
            const res = await fetch(`${apiUrl}/api/admin/tools/${tool.id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (res.ok) {
                setTools(tools.filter((t) => t.id !== tool.id));
                showSuccess('Tool deleted', 'Tool has been removed successfully');
            } else {
                showError('Error', 'Failed to delete tool');
            }
        } catch (error) {
            console.error('Error deleting tool:', error);
            showError('Error', 'Network error occurred');
        }
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
                showError('Error', 'Failed to approve tool');
            }
        } catch (error) {
            console.error('Error approving tool:', error);
            showError('Error', 'Network error occurred');
        }
    };

    const filteredTools = tools.filter((tool) =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tool.short_description || tool.description).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns = [
        {
            key: 'logo',
            header: '',
            render: (tool: Tool) => (
                <div className="w-10 h-10 flex-shrink-0">
                    {tool.logo_url ? (
                        <img
                            src={tool.logo_url}
                            alt={tool.name}
                            className="w-10 h-10 rounded-lg object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=AI';
                            }}
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                            {tool.name.charAt(0)}
                        </div>
                    )}
                </div>
            ),
        },
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
            key: 'categories',
            header: 'Categories',
            render: (tool: Tool) => (
                <div className="flex flex-wrap gap-1 max-w-xs">
                    {tool.categories && tool.categories.length > 0 ? (
                        tool.categories.slice(0, 3).map((cat) => (
                            <span
                                key={cat.id}
                                className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                            >
                                {cat.name}
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-400 text-xs">No categories</span>
                    )}
                    {tool.categories && tool.categories.length > 3 && (
                        <span className="text-xs text-gray-500">+{tool.categories.length - 3}</span>
                    )}
                </div>
            ),
        },
        {
            key: 'website',
            header: 'Website',
            render: (tool: Tool) => (
                <a
                    href={tool.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm truncate max-w-[200px] block"
                >
                    {tool.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                </a>
            ),
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
                            onClick={() => navigate('/admin/tools/new')}
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
                                    selectedIds={selectedToolIds}
                                    onSelectionChange={(ids) => setSelectedToolIds(ids as number[])}
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
                                                onClick={() => navigate(`/admin/tools/${tool.id}/edit`)}
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
        </AdminLayout>
    );
}
