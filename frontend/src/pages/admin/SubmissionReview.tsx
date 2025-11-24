import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Loader from '../../components/Loader';

interface Submission {
    id: number;
    submitterName: string;
    submitterEmail: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
    toolData: any;
}

export default function SubmissionReview() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editedData, setEditedData] = useState<any>(null);

    useEffect(() => {
        const fetchSubmission = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/admin/submissions/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (!res.ok) throw new Error('Failed to fetch submission');

                const data = await res.json();
                setSubmission(data);
                setEditedData(data.toolData);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSubmission();
    }, [id]);

    const handleApprove = async () => {
        if (!confirm('Are you sure you want to approve this submission?')) return;

        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/submissions/${id}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    editedToolData: editedData,
                }),
            });

            if (!res.ok) throw new Error('Failed to approve submission');

            alert('Submission approved and tool created!');
            navigate('/admin/submissions');
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        const reason = prompt('Reason for rejection (optional):');
        if (reason === null) return; // User cancelled

        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/submissions/${id}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ reason }),
            });

            if (!res.ok) throw new Error('Failed to reject submission');

            alert('Submission rejected');
            navigate('/admin/submissions');
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleFieldEdit = (field: string, value: any) => {
        setEditedData({ ...editedData, [field]: value });
    };

    if (loading) return <Loader />;
    if (error) return <div className="text-center py-12 text-red-600">{error}</div>;
    if (!submission) return <div className="text-center py-12">Submission not found</div>;

    const isPending = submission.status === 'PENDING';

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/admin/submissions')}
                    className="text-sm text-blue-600 hover:text-blue-800 mb-4"
                >
                    ← Back to submissions
                </button>
                <h1 className="text-3xl font-bold text-gray-900">{submission.toolData.name}</h1>
                <p className="mt-2 text-sm text-gray-500">
                    Submitted by {submission.submitterName} ({submission.submitterEmail}) on{' '}
                    {new Date(submission.createdAt).toLocaleDateString()}
                </p>
                <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${submission.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : submission.status === 'APPROVED'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                >
                    {submission.status}
                </span>
            </div>

            {/* Action Buttons */}
            {isPending && (
                <div className="mb-8 flex space-x-4">
                    <button
                        onClick={handleApprove}
                        disabled={actionLoading}
                        className="flex items-center space-x-2 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                        <CheckIcon className="h-5 w-5" />
                        <span>Approve & Create Tool</span>
                    </button>
                    <button
                        onClick={handleReject}
                        disabled={actionLoading}
                        className="flex items-center space-x-2 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                        <XMarkIcon className="h-5 w-5" />
                        <span>Reject</span>
                    </button>
                </div>
            )}

            {/* Quick Edit Fields */}
            <div className="mb-8 rounded-lg bg-white shadow">
                <div className="border-b border-gray-200 px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900">Quick Edit</h2>
                </div>
                <div className="space-y-4 p-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            value={editedData?.name || ''}
                            onChange={(e) => handleFieldEdit('name', e.target.value)}
                            disabled={!isPending}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            value={editedData?.description || ''}
                            onChange={(e) => handleFieldEdit('description', e.target.value)}
                            disabled={!isPending}
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Website</label>
                        <input
                            type="url"
                            value={editedData?.website || ''}
                            onChange={(e) => handleFieldEdit('website', e.target.value)}
                            disabled={!isPending}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Pricing</label>
                        <select
                            value={editedData?.pricing || ''}
                            onChange={(e) => handleFieldEdit('pricing', e.target.value)}
                            disabled={!isPending}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                            <option value="">Select pricing</option>
                            <option value="Free">Free</option>
                            <option value="Freemium">Freemium</option>
                            <option value="Paid">Paid</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Full JSON Data */}
            <div className="rounded-lg bg-white shadow">
                <div className="border-b border-gray-200 px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900">Full Submission Data (JSON)</h2>
                </div>
                <div className="p-6">
                    <pre className="overflow-auto rounded bg-gray-50 p-4 text-sm">
                        {JSON.stringify(submission.toolData, null, 2)}
                    </pre>
                </div>
            </div>

            {/* Screenshots */}
            {submission.toolData.screenshots && submission.toolData.screenshots.length > 0 && (
                <div className="mt-8 rounded-lg bg-white shadow">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-900">Screenshots</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4 p-6">
                        {submission.toolData.screenshots.map((url: string, idx: number) => (
                            <img
                                key={idx}
                                src={url}
                                alt={`Screenshot ${idx + 1}`}
                                className="h-48 w-full rounded object-cover"
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
