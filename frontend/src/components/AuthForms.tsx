import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { validateForm, commonRules, hasErrors, ValidationErrors, ValidationRule } from '../utils/validation'
import { apiUrl } from 'lib/constants';

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: {
                        client_id: string;
                        callback: (response: { credential: string }) => void;
                        auto_select?: boolean;
                    }) => void;
                    renderButton: (element: HTMLElement, config: {
                        theme?: string;
                        size?: string;
                        text?: string;
                        shape?: string;
                        width?: string | number;
                    }) => void;
                    prompt: () => void;
                };
            };
        };
    }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function AuthForms({ type }: { type: 'login' | 'register' }) {
    const navigate = useNavigate()
    const { showSuccess, showError } = useToast()
    const { login } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [errors, setErrors] = useState<ValidationErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)

    const validationRules: Record<string, ValidationRule> = type === 'login' ? {
        email: commonRules.email(),
        password: { required: 'Password is required' },
    } : {
        name: commonRules.name(2, 50),
        email: commonRules.email(),
        password: {
            required: 'Password is required',
            minLength: { value: 6, message: 'Password must be at least 6 characters' }
        },
    }

    // Initialize Google Sign-In
    useEffect(() => {
        console.log('Google Client ID:', GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
        if (!GOOGLE_CLIENT_ID) {
            console.warn('VITE_GOOGLE_CLIENT_ID is not configured');
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleGoogleResponse,
                });

                const buttonElement = document.getElementById('google-signin-button');
                if (buttonElement) {
                    window.google.accounts.id.renderButton(buttonElement, {
                        theme: 'outline',
                        size: 'large',
                        text: type === 'login' ? 'signin_with' : 'signup_with',
                        shape: 'rectangular',
                        width: '100%',
                    });
                }
            }
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [type]);

    const handleGoogleResponse = async (response: { credential: string }) => {
        setGoogleLoading(true);
        try {
            const res = await fetch(`${apiUrl}/api/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: response.credential }),
            });

            const data = await res.json();

            if (res.ok) {
                login(data.token, data.user);
                showSuccess(
                    `Welcome ${data.user.name || data.user.email.split('@')[0]}!`,
                    'Successfully signed in with Google'
                );

                if (data.user.role === 'ADMIN') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            } else {
                showError('Google Sign-In failed', data.message || 'Please try again');
            }
        } catch (error) {
            console.error('Google auth error:', error);
            showError('Connection error', 'Please check your internet connection');
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate form
        const formData = type === 'login' ? { email, password } : { email, password, name }
        const validationErrors = validateForm(formData, validationRules)

        if (hasErrors(validationErrors)) {
            setErrors(validationErrors)
            showError('Validation failed', 'Please fix the errors below')
            return
        }

        setErrors({})
        setIsSubmitting(true)

        const endpoint = type === 'login' ? `${apiUrl}/api/auth/login` : `${apiUrl}/api/auth/register`
        const body = type === 'login' ? { email, password } : { email, password, name }

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            const data = await res.json()

            if (res.ok) {
                login(data.token, data.user);

                // Show success
                const userName = data.user.name || name || email.split('@')[0]
                showSuccess(
                    `Welcome ${userName}!`,
                    type === 'register' ? 'Your account has been created successfully' : 'You\'ve been logged in'
                )

                // Redirect based on role
                if (data.user.role === 'ADMIN') {
                    navigate('/admin')
                } else {
                    navigate('/')
                }
            } else {
                showError(
                    type === 'login' ? 'Login failed' : 'Registration failed',
                    data.message || 'Please check your credentials and try again'
                )
            }
        } catch (error) {
            console.error(error)
            showError('Network error', 'Please check your connection and try again')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleFieldChange = (field: string, value: string) => {
        if (field === 'email') setEmail(value)
        else if (field === 'password') setPassword(value)
        else if (field === 'name') setName(value)

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' })
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative max-w-md w-full">
                {/* Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
                    {/* Logo & Header */}
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center justify-center mb-4">
                            <img src="/logo-final.png" alt="FindMyAI" className="h-12 w-auto" />
                        </Link>
                        <h2 className="text-2xl font-bold text-white">
                            {type === 'login' ? 'Welcome back!' : 'Create your account'}
                        </h2>
                        <p className="mt-2 text-sm text-gray-300">
                            {type === 'login' ? (
                                <>Don't have an account? <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign up</Link></>
                            ) : (
                                <>Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign in</Link></>
                            )}
                        </p>
                    </div>

                    {/* Google Sign-In Button */}
                    {GOOGLE_CLIENT_ID && (
                        <>
                            <div className="mb-6">
                                <div
                                    id="google-signin-button"
                                    className={`w-full flex justify-center ${googleLoading ? 'opacity-50 pointer-events-none' : ''}`}
                                ></div>
                                {googleLoading && (
                                    <p className="text-center text-sm text-gray-400 mt-2">Signing in with Google...</p>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="relative mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/20"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-transparent text-gray-400">or continue with email</span>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Form */}
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {type === 'register' && (
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-1.5">
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => handleFieldChange('name', e.target.value)}
                                    className={`block w-full rounded-xl border-0 bg-white/5 py-3 px-4 text-white placeholder:text-gray-400 ring-1 ring-inset ${errors.name ? 'ring-red-400' : 'ring-white/10'
                                        } focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm transition-all`}
                                    placeholder="John Doe"
                                />
                                {errors.name && (
                                    <p className="mt-1.5 text-sm text-red-400">{errors.name}</p>
                                )}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1.5">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => handleFieldChange('email', e.target.value)}
                                className={`block w-full rounded-xl border-0 bg-white/5 py-3 px-4 text-white placeholder:text-gray-400 ring-1 ring-inset ${errors.email ? 'ring-red-400' : 'ring-white/10'
                                    } focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm transition-all`}
                                placeholder="you@example.com"
                            />
                            {errors.email && (
                                <p className="mt-1.5 text-sm text-red-400">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-1.5">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete={type === 'login' ? 'current-password' : 'new-password'}
                                value={password}
                                onChange={(e) => handleFieldChange('password', e.target.value)}
                                className={`block w-full rounded-xl border-0 bg-white/5 py-3 px-4 text-white placeholder:text-gray-400 ring-1 ring-inset ${errors.password ? 'ring-red-400' : 'ring-white/10'
                                    } focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm transition-all`}
                                placeholder="••••••••"
                            />
                            {errors.password && (
                                <p className="mt-1.5 text-sm text-red-400">{errors.password}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="relative w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-indigo-500/25"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    {type === 'login' ? 'Signing in...' : 'Creating account...'}
                                </span>
                            ) : (
                                type === 'login' ? 'Sign in' : 'Create account'
                            )}
                        </button>
                    </form>

                    {/* Terms */}
                    {type === 'register' && (
                        <p className="mt-6 text-center text-xs text-gray-400">
                            By creating an account, you agree to our{' '}
                            <Link to="/terms" className="text-indigo-400 hover:text-indigo-300">Terms of Service</Link>
                            {' '}and{' '}
                            <Link to="/privacy" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

