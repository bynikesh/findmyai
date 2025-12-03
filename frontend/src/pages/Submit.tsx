import { useState } from 'react'
import { trackSubmission } from '../lib/analytics'
import { useToast } from '../contexts/ToastContext'
import { validateForm, commonRules, hasErrors, ValidationErrors } from '../utils/validation'
import { apiUrl } from '../lib/constants';

export default function Submit() {
    const { showSuccess, showError } = useToast()
    const [formData, setFormData] = useState({
        name: '',
        website: '',
        description: '',
        pricing: 'Free'
    })
    const [errors, setErrors] = useState<ValidationErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const validationRules = {
        name: commonRules.name(2, 100),
        website: commonRules.url(),
        description: commonRules.description(20, 2000),
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate form
        const validationErrors = validateForm(formData, validationRules)
        if (hasErrors(validationErrors)) {
            setErrors(validationErrors)
            showError('Validation failed', 'Please fix the errors below')
            return
        }

        setErrors({})
        setIsSubmitting(true)

        try {
            const res = await fetch(`${apiUrl}/api/submissions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                const data = await res.json()
                if (data && data.id) {
                    trackSubmission(data.id)
                }
                showSuccess('Submission received!', 'We\'ll review your tool and get back to you soon')
                setFormData({ name: '', website: '', description: '', pricing: 'Free' })
            } else {
                const error = await res.json()
                showError('Submission failed', error.message || 'Please try again')
            }
        } catch (error) {
            console.error(error)
            showError('Network error', 'Please check your connection and try again')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleFieldChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value })
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' })
        }
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Submit a Tool</h1>
            <p className="mt-2 text-sm text-gray-600">
                Share an AI tool with the community. We'll review it and add it to our directory.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Tool Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 sm:text-sm ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                            }`}
                        value={formData.name}
                        onChange={e => handleFieldChange('name', e.target.value)}
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                        Website URL <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="url"
                        name="website"
                        id="website"
                        placeholder="https://example.com"
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 sm:text-sm ${errors.website ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                            }`}
                        value={formData.website}
                        onChange={e => handleFieldChange('website', e.target.value)}
                    />
                    {errors.website && (
                        <p className="mt-1 text-sm text-red-600">{errors.website}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="pricing" className="block text-sm font-medium text-gray-700">
                        Pricing Model
                    </label>
                    <select
                        name="pricing"
                        id="pricing"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={formData.pricing}
                        onChange={e => setFormData({ ...formData, pricing: e.target.value })}
                    >
                        <option>Free</option>
                        <option>Freemium</option>
                        <option>Paid</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="description"
                        id="description"
                        rows={4}
                        placeholder="Describe what this tool does and why it's useful..."
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 sm:text-sm ${errors.description ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                            }`}
                        value={formData.description}
                        onChange={e => handleFieldChange('description', e.target.value)}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        {formData.description.length} / 2000 characters
                    </p>
                    {errors.description && (
                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Tool'}
                </button>
            </form>
        </div>
    )
}
