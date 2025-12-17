import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/Admin/AdminLayout';
import { apiUrl } from '../../lib/constants';
import {
    DocumentTextIcon,
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    EyeIcon,
    EyeSlashIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface Page {
    id: number;
    title: string;
    slug: string;
    published: boolean;
    showInFooter: boolean;
    footerColumn?: string;
    createdAt: string;
    updatedAt: string;
}

export default function PagesManagement() {
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);

    const fetchPages = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/api/admin/pages`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setPages(data.pages || []);
            }
        } catch (error) {
            console.error('Error fetching pages:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPages();
    }, []);

    const handleSeedPages = async () => {
        setSeeding(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/api/admin/pages/seed`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                console.log('Seed results:', data.results);
                await fetchPages();
            }
        } catch (error) {
            console.error('Error seeding pages:', error);
        } finally {
            setSeeding(false);
        }
    };

    const handleDelete = async (id: number, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/api/admin/pages/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setPages(pages.filter(p => p.id !== id));
            }
        } catch (error) {
            console.error('Error deleting page:', error);
        }
    };

    const togglePublished = async (page: Page) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/api/admin/pages/${page.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ published: !page.published }),
            });
            if (res.ok) {
                setPages(pages.map(p =>
                    p.id === page.id ? { ...p, published: !p.published } : p
                ));
            }
        } catch (error) {
            console.error('Error toggling page:', error);
        }
    };

    const getColumnBadge = (column?: string) => {
        const colors: Record<string, string> = {
            discover: 'bg-blue-100 text-blue-700',
            resources: 'bg-green-100 text-green-700',
            company: 'bg-purple-100 text-purple-700',
            legal: 'bg-gray-100 text-gray-700',
        };
        return column ? (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${colors[column] || 'bg-gray-100 text-gray-600'}`}>
                {column}
            </span>
        ) : null;
    };

    return (
        <AdminLayout>
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Pages Management</h1>
                        <p className="text-gray-600 mt-1">Manage static pages like About, Contact, Privacy Policy, etc.</p>
                    </div>
                    <div className="flex gap-3">
                        {pages.length === 0 && (
                            <button
                                onClick={handleSeedPages}
                                disabled={seeding}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                <ArrowPathIcon className={`w-5 h-5 ${seeding ? 'animate-spin' : ''}`} />
                                Seed Default Pages
                            </button>
                        )}
                        <Link
                            to="/admin/pages/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-violet-700 transition-colors"
                        >
                            <PlusIcon className="w-5 h-5" />
                            New Page
                        </Link>
                    </div>
                </div>

                {/* Pages Table */}
                {loading ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-8">
                        <div className="animate-pulse space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-gray-200 rounded"></div>
                                    <div className="flex-1 h-6 bg-gray-200 rounded"></div>
                                    <div className="w-24 h-6 bg-gray-200 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : pages.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No pages yet</h3>
                        <p className="text-gray-600 mb-6">
                            Create your first page or seed the default pages to get started.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={handleSeedPages}
                                disabled={seeding}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                <ArrowPathIcon className={`w-5 h-5 ${seeding ? 'animate-spin' : ''}`} />
                                Seed Default Pages
                            </button>
                            <Link
                                to="/admin/pages/new"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-violet-700 transition-colors"
                            >
                                <PlusIcon className="w-5 h-5" />
                                New Page
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Page
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Slug
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Footer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Updated
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {pages.map((page) => (
                                    <tr key={page.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-pink-100 to-violet-100 rounded-lg flex items-center justify-center">
                                                    <DocumentTextIcon className="w-5 h-5 text-pink-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{page.title}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <a
                                                href={`/${page.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-gray-600 hover:text-pink-600 font-mono"
                                            >
                                                /{page.slug}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {page.showInFooter ? getColumnBadge(page.footerColumn) : (
                                                <span className="text-gray-400 text-sm">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => togglePublished(page)}
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${page.published
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                                    }`}
                                            >
                                                {page.published ? (
                                                    <>
                                                        <EyeIcon className="w-3.5 h-3.5" />
                                                        Published
                                                    </>
                                                ) : (
                                                    <>
                                                        <EyeSlashIcon className="w-3.5 h-3.5" />
                                                        Draft
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(page.updatedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/admin/pages/${page.id}/edit`}
                                                    className="p-2 text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(page.id, page.title)}
                                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
