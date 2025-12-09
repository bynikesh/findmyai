import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/Admin/AdminLayout';
import ToolForm, { ToolFormData } from '../../components/Admin/ToolForm';
import { useToast } from '../../contexts/ToastContext';
import { apiUrl } from '../../lib/constants';

export default function CreateTool() {
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (formData: ToolFormData) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/api/tools`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                showSuccess('Tool Created', 'The tool has been successfully added.');
                navigate('/admin/tools');
            } else {
                const error = await res.json();
                showError('Error', error.message || 'Failed to create tool');
            }
        } catch (error) {
            console.error('Create tool error:', error);
            showError('Error', 'Network error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ToolForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
        </AdminLayout>
    );
}
