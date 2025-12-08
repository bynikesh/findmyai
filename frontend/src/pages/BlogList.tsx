import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDaysIcon, ClockIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { apiUrl } from '../lib/constants';

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    cover_image: string | null;
    author: string | null;
    read_time: number | null;
    featured: boolean;
    publishedAt: string;
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function BlogCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-6">
                <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
        </div>
    );
}

export default function BlogList() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState<any>(null);
    const [page, setPage] = useState(1);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${apiUrl}/api/blog?page=${page}&perPage=12`);
                if (!res.ok) throw new Error('Failed to fetch posts');
                const data = await res.json();
                setPosts(prev => page === 1 ? data.posts : [...prev, ...data.posts]);
                setMeta(data.meta);
            } catch (error) {
                console.error('Error fetching blog posts:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [page]);

    const featuredPost = posts.find(p => p.featured);
    const regularPosts = posts.filter(p => !p.featured || posts.indexOf(p) > 0);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            AI Tools Blog
                        </h1>
                        <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
                            Discover the latest trends, comparisons, and guides to help you find the best AI tools for your needs.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Featured Post (if exists and on first page) */}
                {featuredPost && page === 1 && (
                    <Link
                        to={`/blog/${featuredPost.slug}`}
                        className="block mb-12 group"
                    >
                        <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                            <div className="md:flex">
                                <div className="md:w-1/2">
                                    {featuredPost.cover_image ? (
                                        <img
                                            src={featuredPost.cover_image}
                                            alt={featuredPost.title}
                                            className="h-64 md:h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-64 md:h-full w-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                                            <span className="text-6xl">📝</span>
                                        </div>
                                    )}
                                </div>
                                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
                                            Featured
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <CalendarDaysIcon className="w-4 h-4" />
                                            {formatDate(featuredPost.publishedAt)}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors">
                                        {featuredPost.title}
                                    </h2>
                                    <p className="text-gray-600 text-lg mb-6 line-clamp-3">
                                        {featuredPost.excerpt}
                                    </p>
                                    <div className="flex items-center text-indigo-600 font-semibold group-hover:gap-3 transition-all">
                                        Read Article
                                        <ArrowRightIcon className="w-5 h-5 ml-2" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                )}

                {/* Blog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {regularPosts.map((post) => (
                        <Link
                            key={post.id}
                            to={`/blog/${post.slug}`}
                            className="group"
                        >
                            <article className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all h-full flex flex-col">
                                {/* Cover Image */}
                                <div className="h-48 overflow-hidden">
                                    {post.cover_image ? (
                                        <img
                                            src={post.cover_image}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                                            <span className="text-4xl">📝</span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6 flex-1 flex flex-col">
                                    {/* Meta */}
                                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                                        <span className="flex items-center gap-1">
                                            <CalendarDaysIcon className="w-4 h-4" />
                                            {formatDate(post.publishedAt)}
                                        </span>
                                        {post.read_time && (
                                            <span className="flex items-center gap-1">
                                                <ClockIcon className="w-4 h-4" />
                                                {post.read_time} min read
                                            </span>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>

                                    {/* Excerpt */}
                                    <p className="text-gray-600 text-sm line-clamp-3 flex-1">
                                        {post.excerpt}
                                    </p>

                                    {/* Read More */}
                                    <div className="mt-4 text-indigo-600 text-sm font-semibold flex items-center group-hover:gap-2 transition-all">
                                        Read more
                                        <ArrowRightIcon className="w-4 h-4 ml-1" />
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}

                    {/* Loading Skeletons */}
                    {loading && [...Array(6)].map((_, i) => (
                        <BlogCardSkeleton key={i} />
                    ))}
                </div>

                {/* Empty State */}
                {!loading && posts.length === 0 && (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles yet</h3>
                        <p className="text-gray-600">Check back soon for the latest AI tools news and guides.</p>
                    </div>
                )}

                {/* Load More */}
                {!loading && meta && page < meta.totalPages && (
                    <div className="mt-12 text-center">
                        <button
                            onClick={() => setPage(prev => prev + 1)}
                            className="px-8 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
                        >
                            Load More Articles
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
