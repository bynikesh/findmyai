import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/Admin/AdminLayout';
import { apiUrl } from '../../lib/constants';
import { ArrowLeftIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapLink from '@tiptap/extension-link';

interface PageData {
    title: string;
    slug: string;
    content: string;
    seo_title: string;
    seo_description: string;
    published: boolean;
    showInFooter: boolean;
    footerColumn: string;
}

const defaultPageData: PageData = {
    title: '',
    slug: '',
    content: '',
    seo_title: '',
    seo_description: '',
    published: true,
    showInFooter: false,
    footerColumn: '',
};

const footerColumnOptions = [
    { value: '', label: 'None' },
    { value: 'discover', label: 'Discover' },
    { value: 'resources', label: 'Resources' },
    { value: 'company', label: 'Company' },
    { value: 'legal', label: 'Legal' },
];

export default function PageEditor() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [pageData, setPageData] = useState<PageData>(defaultPageData);
    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const editor = useEditor({
        extensions: [
            StarterKit,
            TiptapLink.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-pink-600 underline',
                },
            }),
        ],
        content: pageData.content,
        onUpdate: ({ editor }) => {
            setPageData(prev => ({ ...prev, content: editor.getHTML() }));
        },
    });

    useEffect(() => {
        if (isEditing && id) {
            const fetchPage = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${apiUrl}/api/admin/pages/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (res.ok) {
                        const data = await res.json();
                        const page = data.page;
                        setPageData({
                            title: page.title || '',
                            slug: page.slug || '',
                            content: page.content || '',
                            seo_title: page.seo_title || '',
                            seo_description: page.seo_description || '',
                            published: page.published ?? true,
                            showInFooter: page.showInFooter ?? false,
                            footerColumn: page.footerColumn || '',
                        });
                        editor?.commands.setContent(page.content || '');
                    }
                } catch (err) {
                    console.error('Error fetching page:', err);
                    setError('Failed to load page');
                } finally {
                    setLoading(false);
                }
            };
            fetchPage();
        }
    }, [id, isEditing, editor]);

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setPageData(prev => ({
            ...prev,
            title,
            slug: prev.slug || generateSlug(title),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            const token = localStorage.getItem('token');
            const url = isEditing
                ? `${apiUrl}/api/admin/pages/${id}`
                : `${apiUrl}/api/admin/pages`;

            const res = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(pageData),
            });

            if (res.ok) {
                navigate('/admin/pages');
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to save page');
            }
        } catch (err) {
            console.error('Error saving page:', err);
            setError('Failed to save page');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="p-6">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                        <div className="space-y-4">
                            <div className="h-12 bg-gray-200 rounded"></div>
                            <div className="h-12 bg-gray-200 rounded"></div>
                            <div className="h-64 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-6 max-w-5xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/admin/pages')}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isEditing ? 'Edit Page' : 'Create New Page'}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {isEditing ? 'Update the page content and settings' : 'Add a new static page to your site'}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Page Title *
                                </label>
                                <input
                                    type="text"
                                    value={pageData.title}
                                    onChange={handleTitleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    placeholder="e.g., About Us"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    URL Slug *
                                </label>
                                <div className="flex items-center">
                                    <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 text-sm">
                                        /
                                    </span>
                                    <input
                                        type="text"
                                        value={pageData.slug}
                                        onChange={(e) => setPageData(prev => ({ ...prev, slug: e.target.value }))}
                                        required
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        placeholder="about-us"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Editor */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Page Content</h2>

                        {/* Toolbar */}
                        <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border border-gray-200 rounded-t-lg">
                            <button
                                type="button"
                                onClick={() => editor?.chain().focus().toggleBold().run()}
                                className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('bold') ? 'bg-gray-200' : ''}`}
                            >
                                <strong>B</strong>
                            </button>
                            <button
                                type="button"
                                onClick={() => editor?.chain().focus().toggleItalic().run()}
                                className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('italic') ? 'bg-gray-200' : ''}`}
                            >
                                <em>I</em>
                            </button>
                            <span className="w-px h-6 bg-gray-300 mx-1 self-center"></span>
                            <button
                                type="button"
                                onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                                className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
                            >
                                H1
                            </button>
                            <button
                                type="button"
                                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                                className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
                            >
                                H2
                            </button>
                            <button
                                type="button"
                                onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                                className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
                            >
                                H3
                            </button>
                            <span className="w-px h-6 bg-gray-300 mx-1 self-center"></span>
                            <button
                                type="button"
                                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                                className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('bulletList') ? 'bg-gray-200' : ''}`}
                            >
                                • List
                            </button>
                            <button
                                type="button"
                                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                                className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('orderedList') ? 'bg-gray-200' : ''}`}
                            >
                                1. List
                            </button>
                        </div>

                        <EditorContent
                            editor={editor}
                            className="prose prose-lg max-w-none min-h-[300px] p-4 border border-t-0 border-gray-200 rounded-b-lg focus-within:ring-2 focus-within:ring-pink-500"
                        />
                    </div>

                    {/* SEO Settings */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    SEO Title
                                </label>
                                <input
                                    type="text"
                                    value={pageData.seo_title}
                                    onChange={(e) => setPageData(prev => ({ ...prev, seo_title: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    placeholder="Custom title for search engines"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    SEO Description
                                </label>
                                <textarea
                                    value={pageData.seo_description}
                                    onChange={(e) => setPageData(prev => ({ ...prev, seo_description: e.target.value }))}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    placeholder="Description for search engine results"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Publishing Settings */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Publishing Settings</h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="font-medium text-gray-900">Published</label>
                                    <p className="text-sm text-gray-500">Make this page visible to visitors</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setPageData(prev => ({ ...prev, published: !prev.published }))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${pageData.published ? 'bg-pink-500' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pageData.published ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <label className="font-medium text-gray-900">Show in Footer</label>
                                        <p className="text-sm text-gray-500">Display link in the website footer</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setPageData(prev => ({ ...prev, showInFooter: !prev.showInFooter }))}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${pageData.showInFooter ? 'bg-pink-500' : 'bg-gray-200'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pageData.showInFooter ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>

                                {pageData.showInFooter && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Footer Column
                                        </label>
                                        <select
                                            value={pageData.footerColumn}
                                            onChange={(e) => setPageData(prev => ({ ...prev, footerColumn: e.target.value }))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        >
                                            {footerColumnOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/pages')}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <div className="flex gap-3">
                            {isEditing && pageData.slug && (
                                <a
                                    href={`/${pageData.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    <EyeIcon className="w-5 h-5" />
                                    Preview
                                </a>
                            )}
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-violet-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-violet-700 transition-colors disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : isEditing ? 'Update Page' : 'Create Page'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
