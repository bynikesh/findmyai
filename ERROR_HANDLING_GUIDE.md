# Error Handling & Validation Implementation Guide

## 🎯 Overview

This document provides a complete guide to the error handling, success messaging, and form validation systems implemented in the FindMyAI application.

---

## 📋 Table of Contents

1. [Toast Notification System](#toast-notification-system)
2. [Error Pages](#error-pages)
3. [Form Validation](#form-validation)
4. [Usage Examples](#usage-examples)
5. [Best Practices](#best-practices)

---

## 🔔 Toast Notification System

### Location
`frontend/src/contexts/ToastContext.tsx`

### Features
- **4 Toast Types**: Success, Error, Warning, Info
- **Auto-dismiss**: Automatically dismisses after 5s (errors stay 7s)
- **Manual dismiss**: Click X button to close
- **Animations**: Smooth slide-in from right
- **Stacking**: Multiple toasts stack vertically

### Setup

The ToastProvider is already wrapped around the entire app in `App.tsx`:

```tsx
import { ToastProvider } from './contexts/ToastContext'

function App() {
    return (
        <ToastProvider>
            {/* Your app content */}
        </ToastProvider>
    )
}
```

### Usage

```tsx
import { useToast } from '../contexts/ToastContext';

function MyComponent() {
    const { showSuccess, showError, showWarning, showInfo } = useToast();
    
    const handleSubmit = async () => {
        try {
            await apiCall();
            showSuccess('Success!', 'Your data has been saved');
        } catch (error) {
            showError('Failed to save', error.message);
        }
    };
    
    return (/* your JSX */);
}
```

### API Reference

| Method | Parameters | Description |
|--------|------------|-------------|
| `showSuccess(title, message?)` | title: string, message?: string | Green success toast |
| `showError(title, message?)` | title: string, message?: string | Red error toast (7s duration) |
| `showWarning(title, message?)` | title: string, message?: string | Yellow warning toast |
| `showInfo(title, message?)` | title: string, message?: string | Blue info toast |
| `showToast(type, title, message?, duration?)` | type: 'success'\|'error'\|'warning'\|'info', title: string, message?: string, duration?: number | Generic toast with custom duration |

---

## ⚠️ Error Pages

### Pages Created

| Page | Route | File Location | Use Case |
|------|-------|---------------|----------|
| **404 Not Found** | `*` (catch-all) | `pages/NotFound.tsx` | Invalid URLs, missing resources |
| **503 Server Error** | `/500`, `/503` | `pages/ServerError.tsx` | Server unavailable, maintenance |
| **Generic Error** | Programmatic | `pages/GenericError.tsx` | Customizable error page |

### Features

Each error page includes:
- ✨ Modern, engaging design
- 🏠 "Go Home" button
- ⬅️ "Go Back" button
- 📝 Helpful suggestions
- 🎨 Gradient backgrounds
- 📱 Mobile responsive

### Usage Examples

#### 404 - Automatic

Already configured as the catch-all route in `App.tsx`:

```tsx
<Route path="*" element={<NotFound />} />
```

Any invalid URL will show the 404 page.

#### Server Error - Manual Navigation

```tsx
import { useNavigate } from 'react-router-dom';

function MyComponent() {
    const navigate = useNavigate();
    
    const handleApiCall = async () => {
        try {
            const response = await fetch('/api/data');
            if (response.status === 503) {
                navigate('/503');
            }
        } catch (error) {
            navigate('/500');
        }
    };
}
```

#### Generic Error - Component Usage

```tsx
import GenericError from '../pages/GenericError';

function MyComponent() {
    const [hasError, setHasError] = useState(false);
    
    if (hasError) {
        return (
            <GenericError 
                title="Oops! Something went wrong"
                message="We couldn't load your data. Please try again."
                statusCode={500}
            />
        );
    }
    
    return (/* normal content */);
}
```

---

## ✅ Form Validation

### Location
`frontend/src/utils/validation.ts`

### Features

- **Type-safe validation rules**
- **Built-in patterns** (email, URL, slug, phone)
- **Common validation rules** (required, min/max length, number ranges)
- **Custom validators**
- **Form-level validation**
- **Helper functions**

### Validation Patterns

```tsx
import { VALIDATION_PATTERNS } from '../utils/validation';

// Available patterns:
VALIDATION_PATTERNS.email     // Email format
VALIDATION_PATTERNS.url       // URL format (http/https)
VALIDATION_PATTERNS.slug      // Lowercase with hyphens
VALIDATION_PATTERNS.phone     // Phone number
```

### Common Rules

```tsx
import { commonRules } from '../utils/validation';

const rules = {
    email: commonRules.email(),
    website: commonRules.url(),
    slug: commonRules.slug(),
    name: commonRules.name(2, 100), // min, max length
    description: commonRules.description(10, 5000),
    shortDescription: commonRules.shortDescription(160),
    categories: commonRules.arrayNotEmpty('category'),
    rating: commonRules.numberRange(1, 5, 'Rating'),
};
```

### Custom Validation Rules

```tsx
import { ValidationRule } from '../utils/validation';

const customRules: Record<string, ValidationRule> = {
    username: {
        required: 'Username is required',
        minLength: { value: 3, message: 'Username must be at least 3 characters' },
        maxLength: { value: 20, message: 'Username must be at most 20 characters' },
        pattern: {
            value: /^[a-zA-Z0-9_]+$/,
            message: 'Username can only contain letters, numbers, and underscores'
        }
    },
    password: {
        required: 'Password is required',
        minLength: { value: 8, message: 'Password must be at least 8 characters' },
        custom: (value: string) => {
            if (!/[A-Z]/.test(value)) {
                return 'Password must contain at least one uppercase letter';
            }
            if (!/[0-9]/.test(value)) {
                return 'Password must contain at least one number';
            }
            return undefined;
        }
    }
};
```

### Form Validation Example

```tsx
import { useState } from 'react';
import { validateForm, commonRules, hasErrors } from '../utils/validation';
import { useToast } from '../contexts/ToastContext';

function MyForm() {
    const { showSuccess, showError } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        website: '',
        description: ''
    });
    const [errors, setErrors] = useState({});
    
    const validationRules = {
        name: commonRules.name(),
        email: commonRules.email(),
        website: commonRules.url(),
        description: commonRules.description()
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate form
        const validationErrors = validateForm(formData, validationRules);
        
        if (hasErrors(validationErrors)) {
            setErrors(validationErrors);
            showError('Validation Failed', 'Please fix the errors below');
            return;
        }
        
        // Clear errors
        setErrors({});
        
        // Submit form
        try {
            await apiSubmit(formData);
            showSuccess('Success!', 'Your form has been submitted');
        } catch (error) {
            showError('Submission failed', error.message);
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <div>
                <input
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                {errors.name && (
                    <span className="text-red-600 text-sm">{errors.name}</span>
                )}
            </div>
            
            {/* More fields... */}
            
            <button type="submit">Submit</button>
        </form>
    );
}
```

### Field-Level Validation

```tsx
import { validateField } from '../utils/validation';

const [emailError, setEmailError] = useState('');

const handleEmailBlur = (value: string) => {
    const error = validateField(value, commonRules.email());
    setEmailError(error || '');
};
```

---

## 📖 Usage Examples

### Example 1: Admin Tool Approval (Already Implemented)

See `frontend/src/pages/admin/ImportTools.tsx` for a complete example:

```tsx
const approveTool = async (id: number) => {
    if (!confirm('Are you sure you want to approve this tool?')) return;
    try {
        const res = await fetch(`/api/admin/tools/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ verified: true }),
        });
        if (res.ok) {
            setPendingTools(prev => prev.filter(t => t.id !== id));
            fetchTotalTools();
            showSuccess('Tool approved successfully', 'The tool is now live');
        } else {
            showError('Failed to approve tool', 'Please try again');
        }
    } catch (error) {
        showError('Error approving tool', 'Please try again');
    }
};
```

### Example 2: Form with Validation

```tsx
import { useState } from 'react';
import { validateForm, commonRules, hasErrors } from '../utils/validation';
import { useToast } from '../contexts/ToastContext';

function SubmitToolForm() {
    const { showSuccess, showError } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        website: '',
        description: '',
        category: ''
    });
    const [errors, setErrors] = useState({});
    
    const rules = {
        name: commonRules.name(2, 100),
        website: commonRules.url(),
        description: commonRules.description(20, 1000),
        category: commonRules.required('Category')
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const validationErrors = validateForm(formData, rules);
        
        if (hasErrors(validationErrors)) {
            setErrors(validationErrors);
            showError('Validation failed', 'Please fix the errors and try again');
            return;
        }
        
        try {
            const res = await fetch('/api/tools', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (res.ok) {
                showSuccess('Tool submitted!', 'We\'ll review it shortly');
                setFormData({ name: '', website: '', description: '', category: '' });
                setErrors({});
            } else {
                const error = await res.json();
                showError('Submission failed', error.message);
            }
        } catch (error) {
            showError('Network error', 'Please check your connection');
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Tool Name *</label>
                <input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300"
                />
                {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
            </div>
            
            {/* More fields... */}
            
            <button 
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
            >
                Submit Tool
            </button>
        </form>
    );
}
```

---

## 🎯 Best Practices

### Toast Notifications

1. **Use appropriate types**:
   - ✅ Success: Actions completed successfully
   - ❌ Error: Failed operations, validation errors
   - ⚠️ Warning: Important information, non-critical issues
   - ℹ️ Info: General notifications, tips

2. **Keep messages concise**:
   - Title: Short and clear (2-5 words)
   - Message: Brief explanation (optional)

3. **User-friendly messages**:
   ```tsx
   // ❌ Don't
   showError('Error 500', 'Internal server error');
   
   // ✅ Do
   showError('Failed to save', 'Please try again or contact support');
   ```

### Error Pages

1. **Always provide navigation**:
   - Include "Go Home" and "Go Back" buttons
   - Add helpful links to common pages

2. **Be informative but friendly**:
   - Explain what happened
   - Suggest next steps
   - Avoid technical jargon for user-facing errors

### Form Validation

1. **Validate on submit, show errors immediately**:
   ```tsx
   const handleSubmit = (e) => {
       e.preventDefault();
       const errors = validateForm(data, rules);
       if (hasErrors(errors)) {
           setErrors(errors);
           showError('Please fix the errors');
           return;
       }
       // Submit...
   };
   ``

2. **Clear errors when user starts typing**:
   ```tsx
   const handleChange = (field, value) => {
       setFormData({...formData, [field]: value});
       if (errors[field]) {
           setErrors({...errors, [field]: ''});
       }
   };
   ```

3. **Use common rules when possible**:
   ```tsx
   import { commonRules } from '../utils/validation';
   
   // ✅ Do
   const rules = {
       email: commonRules.email(),
       name: commonRules.name()
   };
   
   // ❌ Don't reinvent
   const rules = {
       email: {
           required: 'Email required',
           pattern: { value: /.../, message: '...' }
       }
   };
   ```

4. **Provide field-level validation for better UX**:
   ```tsx
   const handleBlur = (field, value) => {
       const error = validateField(value, rules[field]);
       setErrors({...errors, [field]: error});
   };
   ```

---

## 📝 Summary

### What's Been Implemented

✅ **Toast Notification System**
- Context-based toast provider
- 4 toast types with auto-dismiss
- Smooth animations
- Already integrated in App.tsx

✅ **Error Pages**
- 404 Not Found page
- 503 Server Error page
- Generic customizable error page
- Routed in App.tsx

✅ **Form Validation**
- Comprehensive validation utilities
- Common patterns and rules
- Field and form-level validation
- Helper functions

✅ **Example Implementation**
- ImportTools page updated with toasts
- Replaced all alert() calls
- Better user experience

### Next Steps

1. **Apply to other forms**: Update Submit.tsx, Login.tsx, ReviewForm.tsx
2. **Add loading states**: Show spinners during async operations
3. **Backend validation**: Ensure backend validates data too
4. **Error boundaries**: Add React error boundaries for crash protection

---

**Last Updated**: 2025-12-03
