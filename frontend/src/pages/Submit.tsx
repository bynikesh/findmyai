import { useState } from 'react'

export default function Submit() {
    const [formData, setFormData] = useState({
        name: '',
        website: '',
        description: '',
        pricing: 'Free'
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                alert('Submission received!')
                setFormData({ name: '', website: '', description: '', pricing: 'Free' })
            } else {
                alert('Error submitting tool')
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Submit a Tool</h1>
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tool Name</label>
                    <input type="text" name="name" id="name" required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website URL</label>
                    <input type="url" name="website" id="website" required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={formData.website}
                        onChange={e => setFormData({ ...formData, website: e.target.value })}
                    />
                </div>
                <div>
                    <label htmlFor="pricing" className="block text-sm font-medium text-gray-700">Pricing</label>
                    <select name="pricing" id="pricing"
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
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" id="description" rows={4} required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>
                <button type="submit" className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                    Submit Tool
                </button>
            </form>
        </div>
    )
}
