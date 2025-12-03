import { useEffect, useState } from 'react';
import {
    CloudArrowDownIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ClockIcon,
    StopIcon,
    CheckIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/Admin/AdminLayout';
import { useToast } from '../../contexts/ToastContext';
import { apiUrl } from '../../lib/constants';

interface ImportLog {
    id: number;
    source: string;
    fetched: number;
    imported: number;
    skipped: number;
    errors: string[] | null;
    timestamp: string;
}



export default function ImportTools() {
    const { showSuccess, showError } = useToast();
    const [logs, setLogs] = useState<ImportLog[]>([]);
    const [importing, setImporting] = useState<string | null>(null);
    const [totalTools, setTotalTools] = useState(0);
    const [pendingTools, setPendingTools] = useState<any[]>([]);
    const [stopping, setStopping] = useState(false);

    useEffect(() => {
        fetchLogs();
        fetchTotalTools();
        fetchPendingTools();
    }, []);

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/api/import/logs?limit=20`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setLogs(data.logs);
            }
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        }
    };

    const fetchTotalTools = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/api/analytics/overview`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setTotalTools(data.totals.tools);
            }
        } catch (error) {
            console.error('Failed to fetch total tools:', error);
        }
    };


    const fetchPendingTools = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/api/admin/tools?status=pending&perPage=50`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setPendingTools(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch pending tools:', error);
        }
    };

    const stopImport = async () => {
        setStopping(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/api/import/stop`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                showSuccess('Stop signal sent', 'Import will stop shortly');
            } else {
                showError('Failed to send stop signal');
            }
        } catch (error) {
            console.error('Stop import error:', error);
            showError('Error stopping import', 'Please try again');
        } finally {
            setStopping(false);
        }
    };

    const approveTool = async (id: number) => {
        if (!confirm('Are you sure you want to approve this tool?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/api/admin/tools/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ verified: true }),
            });
            if (res.ok) {
                setPendingTools(prev => prev.filter(t => t.id !== id));
                fetchTotalTools();
                showSuccess('Tool approved successfully', 'The tool is now live');
            } else {
                showError('Failed to approve tool', 'Please try again');
            }
        } catch (error) {
            console.error('Approve error:', error);
            showError('Error approving tool', 'Please try again');
        }
    };

    const rejectTool = async (id: number) => {
        if (!confirm('Are you sure you want to delete this tool?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/api/admin/tools/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setPendingTools(prev => prev.filter(t => t.id !== id));
                showSuccess('Tool rejected', 'The tool has been deleted');
            } else {
                showError('Failed to delete tool', 'Please try again');
            }
        } catch (error) {
            console.error('Reject error:', error);
            showError('Error rejecting tool', 'Please try again');
        }
    };

    const runImport = async (source: string) => {
        setImporting(source);
        try {
            const token = localStorage.getItem('token');
            const endpoint = source === 'all'
                ? `${apiUrl}/api/import/run`
                : `${apiUrl}/api/import/run/${source}`;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                await fetchLogs();
                await fetchTotalTools();
                await fetchPendingTools();
                showSuccess('Import completed successfully!', 'Check the pending imports section to review new tools');
            } else {
                const error = await res.json();
                showError('Import failed', error.message || 'Please try again');
            }
        } catch (error) {
            console.error('Import error:', error);
            showError('Import failed', 'Network error. Please check your connection');
        } finally {
            setImporting(null);
        }
    };

    return (
        <AdminLayout>
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">AI Tools Auto-Importer</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Automatically fetch, normalize, and enrich AI tools from public APIs.
                    </p>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <CloudArrowDownIcon className="h-6 w-6 text-gray-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total Tools in DB
                                        </dt>
                                        <dd className="text-2xl font-semibold text-gray-900">
                                            {totalTools}
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
                                    <ClockIcon className="h-6 w-6 text-gray-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Last Import
                                        </dt>
                                        <dd className="text-lg font-semibold text-gray-900">
                                            {logs.length > 0
                                                ? new Date(logs[0].timestamp).toLocaleDateString()
                                                : 'Never'}
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
                                    <CheckCircleIcon className="h-6 w-6 text-green-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total Imported (All Time)
                                        </dt>
                                        <dd className="text-2xl font-semibold text-gray-900">
                                            {logs.reduce((acc, log) => acc + log.imported, 0)}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Import Actions */}
                <div className="bg-white shadow rounded-lg mb-8">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Run Import
                        </h3>
                        <div className="mt-2 max-w-xl text-sm text-gray-500">
                            <p>Select a source to fetch new tools from. This process may take a few minutes.</p>
                        </div>
                        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <button
                                onClick={() => runImport('huggingface')}
                                disabled={!!importing}
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                            >
                                {importing === 'huggingface' ? (
                                    <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                ) : (
                                    '🤗 Hugging Face'
                                )}
                            </button>

                            <button
                                onClick={() => runImport('openrouter')}
                                disabled={!!importing}
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {importing === 'openrouter' ? (
                                    <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                ) : (
                                    '🔀 OpenRouter'
                                )}
                            </button>

                            <button
                                onClick={() => runImport('rapidapi')}
                                disabled={!!importing}
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                            >
                                {importing === 'rapidapi' ? (
                                    <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                ) : (
                                    '⚡ RapidAPI'
                                )}
                            </button>

                            <button
                                onClick={() => runImport('all')}
                                disabled={!!importing}
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                                {importing === 'all' ? (
                                    <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                ) : (
                                    '🚀 Run Full Import'
                                )}
                            </button>
                        </div>

                        <div className="mt-6 border-t border-gray-200 pt-6">
                            <button
                                onClick={stopImport}
                                disabled={stopping}
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            >
                                {stopping ? (
                                    <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                ) : (
                                    <StopIcon className="-ml-1 mr-2 h-5 w-5" />
                                )}
                                Stop Import
                            </button>
                            <p className="mt-2 text-sm text-gray-500">
                                Click to stop any running import process. It may take a moment to gracefully shut down.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Pending Imports */}
                <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Pending Imports ({pendingTools.length})
                        </h3>
                        <button
                            onClick={fetchPendingTools}
                            className="text-sm text-blue-600 hover:text-blue-500"
                        >
                            Refresh
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tool</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {pendingTools.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                            No pending tools found.
                                        </td>
                                    </tr>
                                ) : (
                                    pendingTools.map((tool) => (
                                        <tr key={tool.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {tool.logo_url && (
                                                        <img className="h-8 w-8 rounded-full mr-3" src={tool.logo_url} alt="" />
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{tool.name}</div>
                                                        <a href={tool.website} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
                                                            Visit Website
                                                        </a>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 line-clamp-2" title={tool.description}>
                                                    {tool.short_description || tool.description}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                                {tool.source || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => approveTool(tool.id)}
                                                    className="text-green-600 hover:text-green-900 mr-4"
                                                    title="Approve"
                                                >
                                                    <CheckIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => rejectTool(tool.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Reject"
                                                >
                                                    <XMarkIcon className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Import History */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Import History
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Source
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fetched
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Imported
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Skipped
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Errors
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                            No imports run yet.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                                                {log.source}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {log.fetched}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                                {log.imported}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {log.skipped}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-red-500">
                                                {log.errors && log.errors.length > 0 ? (
                                                    <div className="flex items-center">
                                                        <ExclamationCircleIcon className="h-5 w-5 mr-1" />
                                                        {log.errors.length} errors
                                                    </div>
                                                ) : (
                                                    <span className="text-green-500">None</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
