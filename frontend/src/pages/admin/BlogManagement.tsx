import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PlusIcon, PencilSquareIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import AdminLayout from '../../components/Admin/AdminLayout';
import Loader from '../../components/Loader';
import { apiUrl } from '../../lib/constants';

interface BlogTag {
    id: number;
    name: string;
    slug: string;
}

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    author: string | null;
    published: boolean;
    featured: boolean;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
    tags: BlogTag[];
}

export default function BlogManagement() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [tags, setTags] = useState<BlogTag[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
    const [deleting, setDeleting] = useState<number | null>(null);

    const statusFilter = searchParams.get('status') || 'all';
    const tagFilter = searchParams.get('tag') || '';
    const page = parseInt(searchParams.get('page') || '1');

    // Fetch posts
    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams();
                params.set('page', page.toString());
                params.set('perPage', '20');
                if (statusFilter !== 'all') params.set('status', statusFilter);
                if (tagFilter) params.set('tag', tagFilter);

                const res = await fetch(`${apiUrl}/api/admin/blog?${params}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });

                if (!res.ok) throw new Error('Failed to fetch posts');

                const data = await res.json();
                setPosts(data.posts || []);
                setMeta(data.meta || { total: 0, page: 1, totalPages: 1 });
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [page, statusFilter, tagFilter]);

    // Fetch tags for filter
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const res = await fetch(`${apiUrl}/api/admin/blog/tags`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setTags(data.tags || []);
                }
            } catch (err) {
                console.error('Failed to fetch tags:', err);
            }
        };
        fetchTags();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return;

        setDeleting(id);
        try {
            const res = await fetch(`${apiUrl}/api/admin/blog/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });

            if (!res.ok) throw new Error('Failed to delete post');

            setPosts(posts.filter(p => p.id !== id));
        } catch (err: any) {
            alert(err.message);
        } finally {
            setDeleting(null);
        }
    };

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.delete('page'); // Reset to page 1
        setSearchParams(params);
    };

    return (
        <AdminLayout>
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Manage blog posts, articles, and tutorials
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex gap-3">
                        <Link
                            to="/admin/blog/tags"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Manage Tags
                        </Link>
                        <Link
                            to="/admin/blog/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <PlusIcon className="w-5 h-5" />
                            New Post
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="mt-6 flex flex-wrap gap-4">
                    {/* Status Filter */}
                    <div className="flex rounded-lg overflow-hidden border border-gray-300">
                        {['all', 'published', 'draft'].map((status) => (
                            <button
                                key={status}
                                onClick={() => updateFilter('status', status === 'all' ? '' : status)}
                                className={`px-4 py-2 text-sm font-medium capitalize ${(status === 'all' && !statusFilter) || statusFilter === status
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {/* Tag Filter */}
                    <select
                        value={tagFilter}
                        onChange={(e) => updateFilter('tag', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                        <option value="">All Tags</option>
                        {tags.map((tag) => (
                            <option key={tag.id} value={tag.slug}>
                                {tag.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Error State */}
                {error && (
                    <div className="mt-6 rounded-md bg-red-50 p-4">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                {/* Loading State */}
                {loading && <Loader />}

                {/* Posts Table */}
                {!loading && !error && (
                    <div className="mt-8 flow-root">
                        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-300">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                                    Title
                                                </th>
                                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Tags
                                                </th>
                                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Status
                                                </th>
                                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Created
                                                </th>
                                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                    Updated
                                                </th>
                                                <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                    <span className="sr-only">Actions</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {posts.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="py-12 text-center text-sm text-gray-500">
                                                        No blog posts found.{' '}
                                                        <Link to="/admin/blog/new" className="text-indigo-600 hover:underline">
                                                            Create your first post
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ) : (
                                                posts.map((post) => (
                                                    <tr key={post.id} className="hover:bg-gray-50">
                                                        <td className="py-4 pl-4 pr-3 sm:pl-6">
                                                            <div>
                                                                <div className="font-medium text-gray-900 flex items-center gap-2">
                                                                    {post.title}
                                                                    {post.featured && (
                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                            Featured
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {post.excerpt && (
                                                                    <div className="text-sm text-gray-500 truncate max-w-md">
                                                                        {post.excerpt}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                            <div className="flex flex-wrap gap-1">
                                                                {post.tags.slice(0, 3).map((tag) => (
                                                                    <span
                                                                        key={tag.id}
                                                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                                                                    >
                                                                        {tag.name}
                                                                    </span>
                                                                ))}
                                                                {post.tags.length > 3 && (
                                                                    <span className="text-xs text-gray-500">
                                                                        +{post.tags.length - 3}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                            <span
                                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${post.published
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-yellow-100 text-yellow-800'
                                                                    }`}
                                                            >
                                                                {post.published ? 'Published' : 'Draft'}
                                                            </span>
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                            {new Date(post.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                            {new Date(post.updatedAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <a
                                                                    href={`/blog/${post.slug}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-gray-400 hover:text-gray-600"
                                                                    title="Preview"
                                                                >
                                                                    <EyeIcon className="w-5 h-5" />
                                                                </a>
                                                                <Link
                                                                    to={`/admin/blog/${post.id}/edit`}
                                                                    className="text-indigo-600 hover:text-indigo-900"
                                                                    title="Edit"
                                                                >
                                                                    <PencilSquareIcon className="w-5 h-5" />
                                                                </Link>
                                                                <button
                                                                    onClick={() => handleDelete(post.id)}
                                                                    disabled={deleting === post.id}
                                                                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                                                    title="Delete"
                                                                >
                                                                    <TrashIcon className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Pagination */}
                        {meta.totalPages > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                                <p className="text-sm text-gray-700">
                                    Showing page {meta.page} of {meta.totalPages} ({meta.total} total)
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            const params = new URLSearchParams(searchParams);
                                            params.set('page', String(page - 1));
                                            setSearchParams(params);
                                        }}
                                        disabled={page === 1}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => {
                                            const params = new URLSearchParams(searchParams);
                                            params.set('page', String(page + 1));
                                            setSearchParams(params);
                                        }}
                                        disabled={page >= meta.totalPages}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
