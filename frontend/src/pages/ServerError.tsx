import { Link } from 'react-router-dom';
import { ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline';

export default function ServerError() {
    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* 503 Icon */}
                <div className="mb-8">
                    <div className="text-9xl font-bold text-red-200">503</div>
                    <div className="relative -mt-8">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-orange-600 rounded-full opacity-20 blur-2xl"></div>
                        </div>
                        <div className="relative">
                            <svg className="mx-auto h-24 w-24 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Message */}
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    Service Unavailable
                </h1>
                <p className="text-gray-600 mb-8">
                    We're experiencing technical difficulties. Our team has been notified and is working to resolve the issue. Please try again in a few moments.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={handleRefresh}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-orange-700 transition-all shadow-sm"
                    >
                        <ArrowPathIcon className="h-5 w-5" />
                        Try Again
                    </button>
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
                    >
                        <HomeIcon className="h-5 w-5" />
                        Go Home
                    </Link>
                </div>

                {/* Status Info */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        Error Code: 503 • Service Unavailable
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                        If the problem persists, please contact support
                    </p>
                </div>
            </div>
        </div>
    );
}
