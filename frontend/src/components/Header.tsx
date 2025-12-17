import { Fragment, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Disclosure, Menu, Transition, Popover } from '@headlessui/react';
import {
    Bars3Icon,
    XMarkIcon,
    UserCircleIcon,
    MagnifyingGlassIcon,
    ChevronDownIcon,
    Squares2X2Icon,
    BriefcaseIcon,
    ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import HeaderSearchBar from './HeaderSearchBar';
import { apiUrl } from 'lib/constants';

interface JobOrTask {
    id: number;
    name: string;
    slug: string;
    icon?: string;
    featured: boolean;
    _count?: { tools: number };
}

interface Category {
    id: number;
    name: string;
    slug: string;
    featured: boolean;
}

const navigation = [
    { name: 'Tools', href: '/tools', current: false },
    { name: 'Blog', href: '/blog', current: false },
    { name: 'Submit Tool', href: '/submit', current: false },
];

type ViewType = 'category' | 'job' | 'task';

const sidebarItems: Array<{ name: string; icon: typeof Squares2X2Icon; type: ViewType }> = [
    { name: 'By Category', icon: Squares2X2Icon, type: 'category' },
    { name: 'By Job', icon: BriefcaseIcon, type: 'job' },
    { name: 'By Task', icon: ClipboardDocumentListIcon, type: 'task' },
];

export default function Header() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userName, setUserName] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [jobs, setJobs] = useState<JobOrTask[]>([]);
    const [tasks, setTasks] = useState<JobOrTask[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeTab, setActiveTab] = useState<ViewType>('task');

    // Fetch jobs, tasks, and categories
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobsRes, tasksRes, catsRes] = await Promise.all([
                    fetch(`${apiUrl}/api/jobs`),
                    fetch(`${apiUrl}/api/tasks`),
                    fetch(`${apiUrl}/api/categories`),
                ]);

                if (jobsRes.ok) {
                    const data = await jobsRes.json();
                    setJobs(data.jobs || []);
                }
                if (tasksRes.ok) {
                    const data = await tasksRes.json();
                    setTasks(data.tasks || []);
                }
                if (catsRes.ok) {
                    const data = await catsRes.json();
                    setCategories(data.categories || data || []);
                }
            } catch (error) {
                console.error('Error fetching menu data:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    setIsAuthenticated(true);
                    setIsAdmin(payload.role === 'ADMIN');
                    setUserName(payload.name || payload.email);
                } catch {
                    setIsAuthenticated(false);
                }
            } else {
                setIsAuthenticated(false);
            }
        };

        checkAuth();
        window.addEventListener('auth-change', checkAuth);
        return () => window.removeEventListener('auth-change', checkAuth);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setIsAdmin(false);
        window.dispatchEvent(new Event('auth-change'));
        navigate('/');
    };

    // Get items for the current active tab
    const getActiveItems = () => {
        switch (activeTab) {
            case 'category':
                return categories.slice(0, 8).map((c) => ({
                    name: c.name,
                    href: `/tools?category=${c.slug}`,
                }));
            case 'job':
                return jobs.slice(0, 8).map((j) => ({
                    name: j.name,
                    href: `/jobs/${j.slug}`,
                }));
            case 'task':
            default:
                return tasks.slice(0, 8).map((t) => ({
                    name: t.name,
                    href: `/tasks/${t.slug}`,
                }));
        }
    };

    const getSeeAllLink = () => {
        switch (activeTab) {
            case 'category':
                return { href: '/categories', label: 'See all Categories' };
            case 'job':
                return { href: '/jobs', label: 'See all Jobs' };
            case 'task':
            default:
                return { href: '/tasks', label: 'See all Tasks' };
        }
    };

    return (
        <Disclosure as="nav" className="bg-white border-b border-gray-100 sticky top-0 z-50">
            {({ open }) => (
                <>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 md:h-20 justify-between items-center">
                            {/* Logo */}
                            <div className="flex items-center">
                                <Link to="/" className="flex items-center gap-2">
                                    <img src="/logo-final.png" alt="FindMyAI" className="h-14 md:h-16 w-auto" />
                                </Link>
                            </div>

                            {/* Desktop Navigation */}
                            <div className="hidden lg:flex lg:items-center lg:gap-x-1">
                                {/* Discover AI Tools - Mega Menu */}
                                <Popover className="relative">
                                    {({ open: popoverOpen }) => (
                                        <>
                                            <Popover.Button
                                                className={clsx(
                                                    'inline-flex items-center gap-x-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                                                    popoverOpen
                                                        ? 'text-indigo-600 bg-indigo-50'
                                                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                                                )}
                                            >
                                                Discover AI Tools
                                                <ChevronDownIcon
                                                    className={clsx(
                                                        'h-4 w-4 transition-transform',
                                                        popoverOpen ? 'rotate-180' : ''
                                                    )}
                                                />
                                            </Popover.Button>

                                            <Transition
                                                as={Fragment}
                                                enter="transition ease-out duration-200"
                                                enterFrom="opacity-0 translate-y-1"
                                                enterTo="opacity-100 translate-y-0"
                                                leave="transition ease-in duration-150"
                                                leaveFrom="opacity-100 translate-y-0"
                                                leaveTo="opacity-0 translate-y-1"
                                            >
                                                <Popover.Panel className="absolute left-1/2 z-10 mt-3 w-screen max-w-2xl -translate-x-1/2 transform">
                                                    <div className="overflow-hidden rounded-2xl shadow-xl ring-1 ring-gray-900/5 bg-white">
                                                        <div className="flex">
                                                            {/* Left Sidebar - Tab Selection */}
                                                            <div className="w-48 bg-gray-50 p-4 border-r border-gray-100">
                                                                <div className="space-y-1">
                                                                    {sidebarItems.map((item) => (
                                                                        <button
                                                                            key={item.name}
                                                                            onClick={() => setActiveTab(item.type)}
                                                                            className={clsx(
                                                                                'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
                                                                                activeTab === item.type
                                                                                    ? 'bg-white text-indigo-600 shadow-sm'
                                                                                    : 'text-gray-700 hover:bg-white hover:text-indigo-600'
                                                                            )}
                                                                        >
                                                                            <span className={clsx(
                                                                                'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                                                                                activeTab === item.type
                                                                                    ? 'bg-indigo-500 text-white'
                                                                                    : 'bg-indigo-100 text-indigo-600'
                                                                            )}>
                                                                                <item.icon className="h-4 w-4" />
                                                                            </span>
                                                                            {item.name}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Right Content - Dynamic Grid */}
                                                            <div className="flex-1 p-6">
                                                                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                                                                    {getActiveItems().map((item) => (
                                                                        <Link
                                                                            key={item.name}
                                                                            to={item.href}
                                                                            className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                                                                        >
                                                                            {item.name}
                                                                        </Link>
                                                                    ))}
                                                                </div>
                                                                <div className="mt-6 pt-4 border-t border-gray-100">
                                                                    <Link
                                                                        to={getSeeAllLink().href}
                                                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                                                                    >
                                                                        {getSeeAllLink().label} →
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Popover.Panel>
                                            </Transition>
                                        </>
                                    )}
                                </Popover>

                                {/* Other Nav Items */}
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                ))}

                                {isAdmin && (
                                    <Link
                                        to="/admin"
                                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        Admin
                                    </Link>
                                )}
                            </div>

                            {/* Right Side - Search & Auth */}
                            <div className="flex items-center gap-3">
                                {/* Search Toggle */}
                                <button
                                    onClick={() => setShowSearch(!showSearch)}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
                                >
                                    <MagnifyingGlassIcon className="h-5 w-5" />
                                </button>

                                {/* Desktop Search */}
                                <div className="hidden lg:block">
                                    <HeaderSearchBar />
                                </div>

                                {/* Auth Buttons */}
                                {isAuthenticated ? (
                                    <Menu as="div" className="relative">
                                        <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                                            <UserCircleIcon className="h-8 w-8 text-gray-400" />
                                        </Menu.Button>
                                        <Transition
                                            as={Fragment}
                                            enter="transition ease-out duration-200"
                                            enterFrom="transform opacity-0 scale-95"
                                            enterTo="transform opacity-100 scale-100"
                                            leave="transition ease-in duration-75"
                                            leaveFrom="transform opacity-100 scale-100"
                                            leaveTo="transform opacity-0 scale-95"
                                        >
                                            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                                                    {userName}
                                                </div>
                                                {isAdmin && (
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <Link
                                                                to="/admin"
                                                                className={clsx(
                                                                    active ? 'bg-gray-100' : '',
                                                                    'block px-4 py-2 text-sm text-gray-700'
                                                                )}
                                                            >
                                                                Admin Dashboard
                                                            </Link>
                                                        )}
                                                    </Menu.Item>
                                                )}
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <button
                                                            onClick={handleLogout}
                                                            className={clsx(
                                                                active ? 'bg-gray-100' : '',
                                                                'block w-full text-left px-4 py-2 text-sm text-gray-700'
                                                            )}
                                                        >
                                                            Sign out
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                            </Menu.Items>
                                        </Transition>
                                    </Menu>
                                ) : (
                                    <Link
                                        to="/login"
                                        className="rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
                                    >
                                        Free Sign Up
                                    </Link>
                                )}

                                {/* Mobile Menu Button */}
                                <div className="lg:hidden">
                                    <Disclosure.Button className="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
                                        <span className="sr-only">Open main menu</span>
                                        {open ? (
                                            <XMarkIcon className="block h-6 w-6" />
                                        ) : (
                                            <Bars3Icon className="block h-6 w-6" />
                                        )}
                                    </Disclosure.Button>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Search Bar */}
                        {showSearch && (
                            <div className="pb-4 lg:hidden">
                                <HeaderSearchBar />
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Panel */}
                    <Disclosure.Panel className="lg:hidden">
                        <div className="space-y-1 px-4 pb-3 pt-2">
                            {/* Discover Section */}
                            <div className="py-2">
                                <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Discover AI Tools
                                </p>
                                {sidebarItems.map((item) => {
                                    const getMobileLink = () => {
                                        switch (item.type) {
                                            case 'category': return '/categories';
                                            case 'job': return '/jobs';
                                            case 'task': return '/tasks';
                                            default: return '/tools';
                                        }
                                    };
                                    return (
                                        <Disclosure.Button
                                            key={item.name}
                                            as={Link}
                                            to={getMobileLink()}
                                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white">
                                                <item.icon className="h-4 w-4" />
                                            </span>
                                            {item.name}
                                        </Disclosure.Button>
                                    );
                                })}
                            </div>

                            <div className="border-t border-gray-200 my-2" />

                            {/* Other Navigation */}
                            {navigation.map((item) => (
                                <Disclosure.Button
                                    key={item.name}
                                    as={Link}
                                    to={item.href}
                                    className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    {item.name}
                                </Disclosure.Button>
                            ))}

                            {isAdmin && (
                                <Disclosure.Button
                                    as={Link}
                                    to="/admin"
                                    className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Admin Dashboard
                                </Disclosure.Button>
                            )}

                            <div className="border-t border-gray-200 my-2" />

                            {isAuthenticated ? (
                                <Disclosure.Button
                                    as="button"
                                    onClick={handleLogout}
                                    className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Sign out
                                </Disclosure.Button>
                            ) : (
                                <Disclosure.Button
                                    as={Link}
                                    to="/login"
                                    className="block px-3 py-2 rounded-lg text-base font-medium text-indigo-600 hover:bg-indigo-50"
                                >
                                    Free Sign Up
                                </Disclosure.Button>
                            )}
                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    );
}
