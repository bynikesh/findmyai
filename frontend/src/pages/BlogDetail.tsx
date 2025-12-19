import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CalendarDaysIcon, ClockIcon, ArrowLeftIcon, ShareIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import ToolCard from '../components/ToolCard';
import { apiUrl } from '../lib/constants';
import { BlogSEO } from '../components/SEO';

interface Tool {
    id: number;
    name: string;
    slug: string;
    short_description: string;
    logo_url: string | null;
    pricing_type: string[] | null;
    verified: boolean;
    categories: { name: string; slug: string }[];
}

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    cover_image: string | null;
    seo_title: string | null;
    seo_description: string | null;
    author: string | null;
    read_time: number | null;
    publishedAt: string;
    related_tools: Tool[];
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function BlogDetailSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="h-64 md:h-96 bg-gray-200 rounded-3xl mb-8"></div>
            <div className="max-w-3xl mx-auto">
                <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-3/4 mb-6"></div>
                <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
            </div>
        </div>
    );
}

export default function BlogDetail() {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPost = async () => {
            if (!slug) return;
            setLoading(true);
            try {
                const res = await fetch(`${apiUrl}/api/blog/${slug}`);
                if (!res.ok) {
                    if (res.status === 404) {
                        setError('Article not found');
                    } else {
                        throw new Error('Failed to fetch post');
                    }
                    return;
                }
                const data = await res.json();
                setPost(data.post);

                // Update page title and meta
                if (data.post) {
                    document.title = data.post.seo_title || `${data.post.title} | FindMyAI Blog`;
                }
            } catch (err) {
                console.error('Error fetching blog post:', err);
                setError('Failed to load article');
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [slug]);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: post?.title,
                    text: post?.excerpt || '',
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <BlogDetailSkeleton />
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600 mb-6">{error || 'Article not found'}</p>
                    <Link
                        to="/blog"
                        className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        Back to Blog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* SEO Meta Tags */}
            <BlogSEO post={post} />

            {/* Hero Image */}
            <div className="relative">
                {post.cover_image ? (
                    <div className="h-64 md:h-96 w-full">
                        <img
                            src={post.cover_image}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>
                ) : (
                    <div className="h-64 md:h-96 w-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"></div>
                )}

                {/* Back Button Overlay */}
                <div className="absolute top-6 left-6">
                    <Link
                        to="/blog"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 hover:bg-white transition-colors shadow-sm"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back to Blog
                    </Link>
                </div>
            </div>

            {/* Article Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
                <article className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-8 md:p-12">
                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                            <span className="flex items-center gap-1.5">
                                <CalendarDaysIcon className="w-4 h-4" />
                                {formatDate(post.publishedAt)}
                            </span>
                            {post.read_time && (
                                <span className="flex items-center gap-1.5">
                                    <ClockIcon className="w-4 h-4" />
                                    {post.read_time} min read
                                </span>
                            )}
                            {post.author && (
                                <span>By {post.author}</span>
                            )}
                            <button
                                onClick={handleShare}
                                className="ml-auto flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700"
                            >
                                <ShareIcon className="w-4 h-4" />
                                Share
                            </button>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            {post.title}
                        </h1>

                        {/* Excerpt */}
                        {post.excerpt && (
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                {post.excerpt}
                            </p>
                        )}

                        {/* Content */}
                        <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
                            <ReactMarkdown>{post.content}</ReactMarkdown>
                        </div>
                    </div>
                </article>

                {/* Related Tools */}
                {post.related_tools && post.related_tools.length > 0 && (
                    <div className="mt-12 mb-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Tools Mentioned in This Article
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {post.related_tools.map((tool) => (
                                <ToolCard
                                    key={tool.id}
                                    tool={{
                                        ...tool,
                                        description: tool.short_description,
                                        pricing: tool.pricing_type?.[0] || 'Free',
                                        pricing_type: tool.pricing_type ?? undefined,
                                        logo_url: tool.logo_url ?? undefined,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Back to Blog */}
                <div className="text-center py-12">
                    <Link
                        to="/blog"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        Browse More Articles
                    </Link>
                </div>
            </div>
        </div>
    );
}
