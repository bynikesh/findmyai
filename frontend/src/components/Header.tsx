import { Fragment, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

const navigation = [
    { name: 'Tools', href: '/tools', current: false },
    { name: 'Submit', href: '/submit', current: false },
]

export default function Header() {
    const navigate = useNavigate()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [userName, setUserName] = useState('')

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token')
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]))
                    setIsAuthenticated(true)
                    setIsAdmin(payload.role === 'ADMIN')
                    setUserName(payload.name || payload.email)
                } catch (error) {
                    setIsAuthenticated(false)
                }
            } else {
                setIsAuthenticated(false)
            }
        }

        checkAuth()

        // Listen for auth changes
        window.addEventListener('auth-change', checkAuth)
        return () => window.removeEventListener('auth-change', checkAuth)
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('token')
        setIsAuthenticated(false)
        setIsAdmin(false)
        window.dispatchEvent(new Event('auth-change'))
        navigate('/')
    }

    return (
        <Disclosure as="nav" className="bg-white shadow">
            {({ open }) => (
                <>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between">
                            <div className="flex">
                                <div className="flex flex-shrink-0 items-center">
                                    <Link to="/" className="text-2xl font-bold text-blue-600">
                                        FindMyAI
                                    </Link>
                                </div>
                                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                    {navigation.map((item) => (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className={clsx(
                                                item.current
                                                    ? 'border-blue-500 text-gray-900'
                                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium'
                                            )}
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                    {isAdmin && (
                                        <Link
                                            to="/admin"
                                            className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium"
                                        >
                                            Admin
                                        </Link>
                                    )}
                                </div>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:items-center">
                                {isAuthenticated ? (
                                    <Menu as="div" className="relative ml-3">
                                        <div>
                                            <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                                                <span className="sr-only">Open user menu</span>
                                                <UserCircleIcon className="h-8 w-8 text-gray-400" />
                                            </Menu.Button>
                                        </div>
                                        <Transition
                                            as={Fragment}
                                            enter="transition ease-out duration-200"
                                            enterFrom="transform opacity-0 scale-95"
                                            enterTo="transform opacity-100 scale-100"
                                            leave="transition ease-in duration-75"
                                            leaveFrom="transform opacity-100 scale-100"
                                            leaveTo="transform opacity-0 scale-95"
                                        >
                                            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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
                                        className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                    >
                                        Login
                                    </Link>
                                )}
                            </div>
                            <div className="-mr-2 flex items-center sm:hidden">
                                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                                    <span className="absolute -inset-0.5" />
                                    <span className="sr-only">Open main menu</span>
                                    {open ? (
                                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                                    )}
                                </Disclosure.Button>
                            </div>
                        </div>
                    </div>

                    <Disclosure.Panel className="sm:hidden">
                        <div className="space-y-1 pb-3 pt-2">
                            {navigation.map((item) => (
                                <Disclosure.Button
                                    key={item.name}
                                    as={Link}
                                    to={item.href}
                                    className={clsx(
                                        item.current
                                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                                            : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700',
                                        'block border-l-4 py-2 pl-3 pr-4 text-base font-medium'
                                    )}
                                >
                                    {item.name}
                                </Disclosure.Button>
                            ))}
                            {isAdmin && (
                                <Disclosure.Button
                                    as={Link}
                                    to="/admin"
                                    className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block border-l-4 py-2 pl-3 pr-4 text-base font-medium"
                                >
                                    Admin Dashboard
                                </Disclosure.Button>
                            )}
                            {isAuthenticated ? (
                                <Disclosure.Button
                                    as="button"
                                    onClick={handleLogout}
                                    className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block w-full text-left border-l-4 py-2 pl-3 pr-4 text-base font-medium"
                                >
                                    Sign out
                                </Disclosure.Button>
                            ) : (
                                <Disclosure.Button
                                    as={Link}
                                    to="/login"
                                    className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block border-l-4 py-2 pl-3 pr-4 text-base font-medium"
                                >
                                    Login
                                </Disclosure.Button>
                            )}
                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    )
}
