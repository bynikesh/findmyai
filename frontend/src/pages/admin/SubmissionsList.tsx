import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../../components/Loader';

interface Submission {
    id: number;
    submitterName: string;
    submitterEmail: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
    toolData: {
        name: string;
        description: string;
    };
}

export default function SubmissionsList() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSubmissions = async () => {
            setLoading(true);
            setError(null);
            try {
                const query = filter !== 'ALL' ? `?status=${filter}` : '';
                const res = await fetch(`/api/admin/submissions${query}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (res.status === 401 || res.status === 403) {
                    setError('Unauthorized. Please log in as an admin.');
                    return;
                }

                if (!res.ok) throw new Error('Failed to fetch submissions');

                const data = await res.json();
                setSubmissions(data.data || []);
            } catch (err: any) {
                setError(err.message);
                setSubmissions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, [filter]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'APPROVED':
                return 'bg-green-100 text-green-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-3xl font-bold text-gray-900">Tool Submissions</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Review and manage tool submissions from the community
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="mt-6 flex space-x-2">
                {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`rounded-md px-4 py-2 text-sm font-medium ${filter === status
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Error State */}
            {error && (
                <div className="mt-6 rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {/* Loading State */}
            {loading && <Loader />}

            {/* Submissions List */}
            {!loading && !error && (
                <div className="mt-8 flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                                Tool Name
                                            </th>
                                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Submitter
                                            </th>
                                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Status
                                            </th>
                                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Submitted
                                            </th>
                                            <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                <span className="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {submissions.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-12 text-center text-sm text-gray-500">
                                                    No submissions found
                                                </td>
                                            </tr>
                                        ) : (
                                            submissions.map((submission) => (
                                                <tr key={submission.id}>
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                        {submission.toolData.name}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        <div>{submission.submitterName}</div>
                                                        <div className="text-gray-400">{submission.submitterEmail}</div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                        <span
                                                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(
                                                                submission.status
                                                            )}`}
                                                        >
                                                            {submission.status}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        {new Date(submission.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                        <Link
                                                            to={`/admin/submissions/${submission.id}`}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            Review
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
