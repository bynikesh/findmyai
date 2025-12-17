import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    HomeIcon,
    CubeIcon,
    ClipboardDocumentCheckIcon,
    FolderIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    CloudArrowDownIcon,
    BriefcaseIcon,
    ClipboardDocumentListIcon,
    DocumentTextIcon,
    DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Tools', href: '/admin/tools', icon: CubeIcon },
    { name: 'Blog', href: '/admin/blog', icon: DocumentTextIcon },
    { name: 'Pages', href: '/admin/pages', icon: DocumentDuplicateIcon },
    { name: 'Submissions', href: '/admin/submissions', icon: ClipboardDocumentCheckIcon },
    { name: 'Categories', href: '/admin/categories', icon: FolderIcon },
    { name: 'Jobs', href: '/admin/jobs', icon: BriefcaseIcon },
    { name: 'Tasks', href: '/admin/tasks', icon: ClipboardDocumentListIcon },
    { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
    { name: 'Import Tools', href: '/admin/import-tools', icon: CloudArrowDownIcon },
    { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

interface AdminSidebarProps {
    mobileMenuOpen?: boolean;
    setMobileMenuOpen?: (open: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ setMobileMenuOpen }) => {
    const location = useLocation();

    const isActive = (href: string) => {
        if (href === '/admin') {
            return location.pathname === '/admin';
        }
        return location.pathname.startsWith(href);
    };

    return (
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
                <Link to="/" className="flex items-center">
                    <span className="text-2xl font-bold text-white">FindMyAI</span>
                    <span className="ml-2 rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white">
                        Admin
                    </span>
                </Link>
            </div>
            <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                        <ul role="list" className="-mx-2 space-y-1">
                            {navigation.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        to={item.href}
                                        onClick={() => setMobileMenuOpen?.(false)}
                                        className={`
                                            group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold
                                            ${isActive(item.href)
                                                ? 'bg-gray-800 text-white'
                                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                            }
                                        `}
                                    >
                                        <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default AdminSidebar;
