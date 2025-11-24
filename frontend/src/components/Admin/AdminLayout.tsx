import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <div className="h-screen flex">
            {/* Mobile menu */}
            <div
                className={`fixed inset-0 z-50 lg:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}
            >
                <div className="fixed inset-0 bg-gray-900/80" onClick={() => setMobileMenuOpen(false)} />
                <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-gray-900">
                    <div className="flex items-center justify-between p-4">
                        <span className="text-xl font-bold text-white">Menu</span>
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-gray-400 hover:text-white"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <AdminSidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                <AdminSidebar />
            </div>

            {/* Main content */}
            <div className="lg:pl-72 flex flex-col flex-1">
                {/* Top bar */}
                <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
                    <button
                        type="button"
                        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <span className="sr-only">Open sidebar</span>
                        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                    </button>

                    <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                        <div className="flex flex-1 items-center">
                            {/* Breadcrumb or title can go here */}
                        </div>
                        <div className="flex items-center gap-x-4 lg:gap-x-6">
                            {/* User menu */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-x-2 text-sm font-semibold leading-6 text-gray-900 hover:text-gray-600"
                            >
                                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                <span className="hidden sm:block">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
