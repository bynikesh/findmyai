import { Link } from 'react-router-dom';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* 404 Icon */}
                <div className="mb-8">
                    <div className="text-9xl font-bold text-gray-300">404</div>
                    <div className="relative -mt-8">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-32 h-32 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full opacity-20 blur-2xl"></div>
                        </div>
                        <div className="relative">
                            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Message */}
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    Page Not Found
                </h1>
                <p className="text-gray-600 mb-8">
                    Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or never existed.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                        Go Back
                    </button>
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all shadow-sm"
                    >
                        <HomeIcon className="h-5 w-5" />
                        Go Home
                    </Link>
                </div>

                {/* Suggestions */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-3">Suggested pages:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        <Link to="/tools" className="text-sm text-pink-600 hover:text-pink-700 font-medium">
                            Browse Tools
                        </Link>
                        <span className="text-gray-300">•</span>
                        <Link to="/categories" className="text-sm text-pink-600 hover:text-pink-700 font-medium">
                            Categories
                        </Link>
                        <span className="text-gray-300">•</span>
                        <Link to="/submit" className="text-sm text-pink-600 hover:text-pink-700 font-medium">
                            Submit a Tool
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
