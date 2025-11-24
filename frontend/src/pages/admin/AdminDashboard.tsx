import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ClipboardDocumentCheckIcon,
    UserGroupIcon,
    CubeIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/Admin/AdminLayout';

interface Stats {
    totalTools: number;
    pendingSubmissions: number;
    totalUsers: number;
    approvedThisMonth: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({
        totalTools: 0,
        pendingSubmissions: 0,
        totalUsers: 0,
        approvedThisMonth: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch basic stats from API
                const [toolsRes, submissionsRes] = await Promise.all([
                    fetch('http://localhost:3000/api/tools'),
                    fetch('http://localhost:3000/api/admin/submissions', {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    }),
                ]);

                const toolsData = await toolsRes.json();
                const submissionsData = await submissionsRes.json();

                const pendingCount = submissionsData.data?.filter(
                    (s: any) => s.status === 'PENDING'
                ).length || 0;

                setStats({
                    totalTools: toolsData.meta?.total || 0,
                    pendingSubmissions: pendingCount,
                    totalUsers: 0, // Would need a dedicated endpoint
                    approvedThisMonth: 0, // Would need calculation
                });
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const cards = [
        {
            name: 'Total Tools',
            value: stats.totalTools,
            icon: CubeIcon,
            color: 'bg-blue-500',
            link: '/admin/tools',
        },
        {
            name: 'Pending Submissions',
            value: stats.pendingSubmissions,
            icon: ClipboardDocumentCheckIcon,
            color: 'bg-yellow-500',
            link: '/admin/submissions',
        },
        {
            name: 'Total Users',
            value: stats.totalUsers || 'N/A',
            icon: UserGroupIcon,
            color: 'bg-green-500',
            link: '#',
        },
        {
            name: 'Approved This Month',
            value: stats.approvedThisMonth || 'N/A',
            icon: ChartBarIcon,
            color: 'bg-purple-500',
            link: '#',
        },
    ];

    return (
        <AdminLayout>
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Manage your AI tools directory
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    {cards.map((card) => (
                        <Link
                            key={card.name}
                            to={card.link}
                            className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6 hover:shadow-lg transition-shadow"
                        >
                            <dt>
                                <div className={`absolute rounded-md ${card.color} p-3`}>
                                    <card.icon className="h-6 w-6 text-white" aria-hidden="true" />
                                </div>
                                <p className="ml-16 truncate text-sm font-medium text-gray-500">
                                    {card.name}
                                </p>
                            </dt>
                            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                                <p className="text-2xl font-semibold text-gray-900">
                                    {loading ? '...' : card.value}
                                </p>
                            </dd>
                        </Link>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="rounded-lg bg-white shadow">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <Link
                                to="/admin/submissions"
                                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400 hover:shadow-md transition-all"
                            >
                                <div className="flex items-center space-x-3">
                                    <ClipboardDocumentCheckIcon className="h-6 w-6 text-blue-600" />
                                    <span className="text-sm font-medium text-gray-900">
                                        Review Submissions
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-gray-500">
                                    {stats.pendingSubmissions} pending review
                                </p>
                            </Link>

                            <Link
                                to="/submit"
                                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400 hover:shadow-md transition-all"
                            >
                                <div className="flex items-center space-x-3">
                                    <CubeIcon className="h-6 w-6 text-green-600" />
                                    <span className="text-sm font-medium text-gray-900">
                                        Add New Tool
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-gray-500">
                                    Submit a new AI tool to the directory
                                </p>
                            </Link>

                            <Link
                                to="/admin/tools"
                                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400 hover:shadow-md transition-all"
                            >
                                <div className="flex items-center space-x-3">
                                    <ChartBarIcon className="h-6 w-6 text-purple-600" />
                                    <span className="text-sm font-medium text-gray-900">
                                        Manage Tools
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-gray-500">
                                    Edit and manage {stats.totalTools} tools
                                </p>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Placeholder */}
                <div className="mt-8 rounded-lg bg-white shadow">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                    </div>
                    <div className="p-6">
                        <p className="text-sm text-gray-500">
                            Recent activity tracking coming soon...
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
