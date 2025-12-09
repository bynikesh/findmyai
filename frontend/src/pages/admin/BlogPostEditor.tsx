import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline';
import AdminLayout from '../../components/Admin/AdminLayout';
import BlogEditor from '../../components/Admin/BlogEditor';
import { apiUrl } from '../../lib/constants';

interface BlogTag {
    id: number;
    name: string;
    slug: string;
}

interface FormData {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    cover_image: string;
    seo_title: string;
    seo_description: string;
    author: string;
    published: boolean;
    featured: boolean;
    tagIds: number[];
}

export default function BlogPostEditor() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tags, setTags] = useState<BlogTag[]>([]);
    const [newTagName, setNewTagName] = useState('');
    const [autoSlug, setAutoSlug] = useState(!isEditing);

    const [formData, setFormData] = useState<FormData>({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        cover_image: '',
        seo_title: '',
        seo_description: '',
        author: '',
        published: false,
        featured: false,
        tagIds: [],
    });

    // Fetch available tags
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

    // Fetch post for editing
    useEffect(() => {
        if (!id) return;

        const fetchPost = async () => {
            try {
                const res = await fetch(`${apiUrl}/api/admin/blog/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });

                if (!res.ok) throw new Error('Failed to fetch post');

                const data = await res.json();
                const post = data.post;

                setFormData({
                    title: post.title || '',
                    slug: post.slug || '',
                    excerpt: post.excerpt || '',
                    content: post.content || '',
                    cover_image: post.cover_image || '',
                    seo_title: post.seo_title || '',
                    seo_description: post.seo_description || '',
                    author: post.author || '',
                    published: post.published || false,
                    featured: post.featured || false,
                    tagIds: post.tags?.map((t: BlogTag) => t.id) || [],
                });
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    // Auto-generate slug from title
    useEffect(() => {
        if (autoSlug && formData.title) {
            const slug = formData.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            setFormData(prev => ({ ...prev, slug }));
        }
    }, [formData.title, autoSlug]);

    const handleChange = useCallback((field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleTagToggle = (tagId: number) => {
        setFormData(prev => ({
            ...prev,
            tagIds: prev.tagIds.includes(tagId)
                ? prev.tagIds.filter(id => id !== tagId)
                : [...prev.tagIds, tagId],
        }));
    };

    const handleCreateTag = async () => {
        if (!newTagName.trim()) return;

        try {
            const res = await fetch(`${apiUrl}/api/admin/blog/tags`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ name: newTagName.trim() }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create tag');
            }

            const data = await res.json();
            setTags([...tags, data.tag]);
            setFormData(prev => ({ ...prev, tagIds: [...prev.tagIds, data.tag.id] }));
            setNewTagName('');
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSaving(true);

        try {
            const url = isEditing
                ? `${apiUrl}/api/admin/blog/${id}`
                : `${apiUrl}/api/admin/blog`;

            const res = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save post');
            }

            navigate('/admin/blog');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/admin/blog')}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        Back to Blog Posts
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
                    </h1>
                </div>

                {error && (
                    <div className="mb-6 rounded-md bg-red-50 p-4">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Main Content */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Content</h2>

                        {/* Title */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Enter post title"
                            />
                        </div>

                        {/* Slug */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Slug
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-500">
                                    <input
                                        type="checkbox"
                                        checked={autoSlug}
                                        onChange={(e) => setAutoSlug(e.target.checked)}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    Auto-generate from title
                                </label>
                            </div>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => {
                                    setAutoSlug(false);
                                    handleChange('slug', e.target.value);
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="post-url-slug"
                            />
                        </div>

                        {/* Excerpt */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Short Description / Excerpt
                                <span className="text-gray-400 ml-2">({formData.excerpt.length}/300 characters)</span>
                            </label>
                            <textarea
                                value={formData.excerpt}
                                onChange={(e) => handleChange('excerpt', e.target.value.slice(0, 300))}
                                rows={3}
                                maxLength={300}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Brief description for listings and previews"
                            />
                        </div>

                        {/* Content Editor */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Content <span className="text-red-500">*</span>
                            </label>
                            <BlogEditor
                                content={formData.content}
                                onChange={(content) => handleChange('content', content)}
                                placeholder="Write your blog post content here..."
                            />
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Featured Image</h2>

                        <div className="flex items-start gap-6">
                            {formData.cover_image ? (
                                <div className="relative w-48 h-32 rounded-lg overflow-hidden bg-gray-100">
                                    <img
                                        src={formData.cover_image}
                                        alt="Cover"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleChange('cover_image', '')}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="w-48 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                    <PhotoIcon className="w-12 h-12 text-gray-400" />
                                </div>
                            )}

                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Image URL
                                </label>
                                <input
                                    type="url"
                                    value={formData.cover_image}
                                    onChange={(e) => handleChange('cover_image', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="https://example.com/image.jpg"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Enter the URL of the featured image
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Tags</h2>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {tags.map((tag) => (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => handleTagToggle(tag.id)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${formData.tagIds.includes(tag.id)
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {tag.name}
                                </button>
                            ))}
                            {tags.length === 0 && (
                                <p className="text-gray-500 text-sm">No tags available. Create one below.</p>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateTag())}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Add new tag..."
                            />
                            <button
                                type="button"
                                onClick={handleCreateTag}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                            >
                                Add Tag
                            </button>
                        </div>
                    </div>

                    {/* SEO */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">SEO Settings</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    SEO Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.seo_title}
                                    onChange={(e) => handleChange('seo_title', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="SEO optimized title (defaults to post title)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    SEO Description
                                </label>
                                <textarea
                                    value={formData.seo_description}
                                    onChange={(e) => handleChange('seo_description', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Meta description for search engines"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Author
                                </label>
                                <input
                                    type="text"
                                    value={formData.author}
                                    onChange={(e) => handleChange('author', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Author name"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Publishing Options */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Publishing</h2>

                        <div className="space-y-4">
                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={formData.published}
                                    onChange={(e) => handleChange('published', e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div>
                                    <span className="font-medium text-gray-900">Published</span>
                                    <p className="text-sm text-gray-500">Make this post visible to the public</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={formData.featured}
                                    onChange={(e) => handleChange('featured', e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div>
                                    <span className="font-medium text-gray-900">Featured</span>
                                    <p className="text-sm text-gray-500">Highlight this post on the blog homepage</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/blog')}
                            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving || !formData.title || !formData.content}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Saving...' : isEditing ? 'Update Post' : 'Create Post'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
