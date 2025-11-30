import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ChartBarIcon,
    EyeIcon,
    UserGroupIcon,
    FireIcon,
} from '@heroicons/react/24/outline';

interface AnalyticsOverview {
    totals: {
        tools: number;
        users: number;
        reviews: number;
        views: number;
    };
    last7Days: {
        newSignups: number;
        views: number;
    };
}

interface TopTool {
    id: number;
    name: string;
    slug: string;
    viewCount: number;
    average_rating?: number;
    review_count: number;
}

export default function AnalyticsDashboard() {
    const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
    const [topTools, setTopTools] = useState<TopTool[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            const token = localStorage.getItem('token');

            try {
                const [overviewRes, topToolsRes] = await Promise.all([
                    fetch('/api/analytics/overview', {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch('/api/analytics/top-tools?limit=10&days=7', {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                if (overviewRes.ok) {
                    setOverview(await overviewRes.json());
                }
                if (topToolsRes.ok) {
                    setTopTools(await topToolsRes.json());
                }
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-gray-500">Loading analytics...</div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Platform metrics and performance insights
                </p>
            </div>

            {/* Overview Stats */}
            {overview && (
                <>
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Totals</h2>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <ChartBarIcon className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">
                                                    Total Tools
                                                </dt>
                                                <dd className="text-2xl font-semibold text-gray-900">
                                                    {overview.totals.tools}
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <UserGroupIcon className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">
                                                    Total Users
                                                </dt>
                                                <dd className="text-2xl font-semibold text-gray-900">
                                                    {overview.totals.users}
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <EyeIcon className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">
                                                    Total Views
                                                </dt>
                                                <dd className="text-2xl font-semibold text-gray-900">
                                                    {overview.totals.views.toLocaleString()}
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <FireIcon className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">
                                                    Total Reviews
                                                </dt>
                                                <dd className="text-2xl font-semibold text-gray-900">
                                                    {overview.totals.reviews}
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Last 7 Days</h2>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div className="bg-green-50 overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <UserGroupIcon className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-green-700 truncate">
                                                    New Signups
                                                </dt>
                                                <dd className="text-2xl font-semibold text-green-900">
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <EyeIcon className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-blue-700 truncate">
                                                    Page Views
                                                </dt>
                                                <dd className="text-2xl font-semibold text-blue-900">
                                                    {overview.last7Days.views.toLocaleString()}
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Top Tools */}
            <div className="bg-white shadow rounded-lg">
                <div className="border-b border-gray-200 px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Top Tools by Views (Last 7 Days)
                    </h2>
                </div>
                <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rank
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tool
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Views
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rating
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Reviews
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {topTools.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                        No data available
                                    </td>
                                </tr>
                            ) : (
                                topTools.map((tool, idx) => (
                                    <tr key={tool.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {idx + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link
                                                to={`/tools/${tool.slug}`}
                                                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                            >
                                                {tool.name}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {tool.viewCount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {tool.average_rating ? tool.average_rating.toFixed(1) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {tool.review_count}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
