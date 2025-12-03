import { Link, useNavigate } from 'react-router-dom';
import { HomeIcon, ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface GenericErrorProps {
    title?: string;
    message?: string;
    statusCode?: number;
}

export default function GenericError({
    title = 'Something Went Wrong',
    message = 'An unexpected error occurred. Please try again later.',
    statusCode
}: GenericErrorProps) {
    const navigate = useNavigate();

    const handleGoBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
            <div className="max-w-lg w-full text-center">
                {/* Error Icon */}
                <div className="mb-8">
                    {statusCode && (
                        <div className="text-8xl font-bold text-gray-300 mb-4">{statusCode}</div>
                    )}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-red-600 rounded-full opacity-20 blur-2xl"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <ExclamationTriangleIcon className="h-24 w-24 text-orange-500" />
                        </div>
                    </div>
                </div>

                {/* Message */}
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    {title}
                </h1>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    {message}
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={handleGoBack}
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

                {/* Help Text */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        Need help? <Link to="/submit" className="text-pink-600 hover:text-pink-700 font-medium">Contact Support</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
