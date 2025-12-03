import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import { validateForm, commonRules, hasErrors, ValidationErrors, ValidationRule } from '../utils/validation'
import { apiUrl } from 'lib/constants';

export default function AuthForms({ type }: { type: 'login' | 'register' }) {
    const navigate = useNavigate()
    const { showSuccess, showError } = useToast()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [errors, setErrors] = useState<ValidationErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

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
                // Store token in localStorage
                localStorage.setItem('token', data.token)

                // Decode token to check role
                const payload = JSON.parse(atob(data.token.split('.')[1]))

                // Show success
                const userName = payload.name || name || email.split('@')[0]
                showSuccess(
                    `Welcome ${userName}!`,
                    type === 'register' ? 'Your account has been created successfully' : 'You\'ve been logged in'
                )

                // Redirect based on role
                if (payload.role === 'ADMIN') {
                    navigate('/admin/submissions')
                } else {
                    navigate('/')
                }

                // Trigger re-render of header
                window.dispatchEvent(new Event('auth-change'))
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
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                    {type === 'login' ? 'Sign in to your account' : 'Register for an account'}
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {type === 'register' && (
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-2">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => handleFieldChange('name', e.target.value)}
                                    className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 ${errors.name ? 'ring-red-300' : 'ring-gray-300'
                                        }`}
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                            Email address <span className="text-red-500">*</span>
                        </label>
                        <div className="mt-2">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => handleFieldChange('email', e.target.value)}
                                className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 ${errors.email ? 'ring-red-300' : 'ring-gray-300'
                                    }`}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                Password <span className="text-red-500">*</span>
                            </label>
                        </div>
                        <div className="mt-2">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => handleFieldChange('password', e.target.value)}
                                className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 ${errors.password ? 'ring-red-300' : 'ring-gray-300'
                                    }`}
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ?
                                (type === 'login' ? 'Signing in...' : 'Registering...') :
                                (type === 'login' ? 'Sign in' : 'Register')
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
