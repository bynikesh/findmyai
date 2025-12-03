// Validation utilities for forms

export interface ValidationRule {
    required?: string;
    minLength?: { value: number; message: string };
    maxLength?: { value: number; message: string };
    pattern?: { value: RegExp; message: string };
    min?: { value: number; message: string };
    max?: { value: number; message: string };
    custom?: (value: any) => string | undefined;
}

export interface ValidationErrors {
    [key: string]: string;
}

// Common validation patterns
export const VALIDATION_PATTERNS = {
    email: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'Invalid email address',
    },
    url: {
        value: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
        message: 'Invalid URL format',
    },
    slug: {
        value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        message: 'Slug must contain only lowercase letters, numbers, and hyphens',
    },
    phone: {
        value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
        message: 'Invalid phone number',
    },
};

// Validate a single field
export const validateField = (
    value: any,
    rules: ValidationRule
): string | undefined => {
    // Required check
    if (rules.required) {
        const isEmpty = value === null || value === undefined ||
            (typeof value === 'string' && value.trim() === '') ||
            (Array.isArray(value) && value.length === 0);

        if (isEmpty) {
            return rules.required;
        }
    }

    // Skip other checks if value is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
        return undefined;
    }

    // String validations
    if (typeof value === 'string') {
        if (rules.minLength && value.length < rules.minLength.value) {
            return rules.minLength.message;
        }

        if (rules.maxLength && value.length > rules.maxLength.value) {
            return rules.maxLength.message;
        }

        if (rules.pattern && !rules.pattern.value.test(value)) {
            return rules.pattern.message;
        }
    }

    // Number validations
    if (typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min.value) {
            return rules.min.message;
        }

        if (rules.max !== undefined && value > rules.max.value) {
            return rules.max.message;
        }
    }

    // Custom validation
    if (rules.custom) {
        return rules.custom(value);
    }

    return undefined;
};

// Validate entire form
export const validateForm = (
    data: Record<string, any>,
    rules: Record<string, ValidationRule>
): ValidationErrors => {
    const errors: ValidationErrors = {};

    Object.keys(rules).forEach((field) => {
        const error = validateField(data[field], rules[field]);
        if (error) {
            errors[field] = error;
        }
    });

    return errors;
};

// Common validation rules
export const commonRules = {
    required: (fieldName: string): ValidationRule => ({
        required: `${fieldName} is required`,
    }),

    email: (): ValidationRule => ({
        required: 'Email is required',
        pattern: VALIDATION_PATTERNS.email,
    }),

    url: (): ValidationRule => ({
        required: 'URL is required',
        pattern: VALIDATION_PATTERNS.url,
    }),

    optionalUrl: (): ValidationRule => ({
        pattern: VALIDATION_PATTERNS.url,
    }),

    slug: (): ValidationRule => ({
        required: 'Slug is required',
        pattern: VALIDATION_PATTERNS.slug,
        minLength: { value: 2, message: 'Slug must be at least 2 characters' },
    }),

    name: (min: number = 2, max: number = 100): ValidationRule => ({
        required: 'Name is required',
        minLength: { value: min, message: `Name must be at least ${min} characters` },
        maxLength: { value: max, message: `Name must be at most ${max} characters` },
    }),

    description: (min: number = 10, max: number = 5000): ValidationRule => ({
        required: 'Description is required',
        minLength: { value: min, message: `Description must be at least ${min} characters` },
        maxLength: { value: max, message: `Description must be at most ${max} characters` },
    }),

    shortDescription: (max: number = 160): ValidationRule => ({
        maxLength: { value: max, message: `Short description must be at most ${max} characters` },
    }),

    arrayNotEmpty: (fieldName: string): ValidationRule => ({
        custom: (value: any[]) => {
            if (!Array.isArray(value) || value.length === 0) {
                return `At least one ${fieldName} is required`;
            }
            return undefined;
        },
    }),

    numberRange: (min: number, max: number, fieldName: string = 'Value'): ValidationRule => ({
        required: `${fieldName} is required`,
        min: { value: min, message: `${fieldName} must be at least ${min}` },
        max: { value: max, message: `${fieldName} must be at most ${max}` },
    }),
};

// Helper to check if form has errors
export const hasErrors = (errors: ValidationErrors): boolean => {
    return Object.keys(errors).length > 0;
};

// Helper to get first error message
export const getFirstError = (errors: ValidationErrors): string | undefined => {
    const firstKey = Object.keys(errors)[0];
    return firstKey ? errors[firstKey] : undefined;
};

// Format validation errors for display
export const formatErrors = (errors: ValidationErrors): string => {
    return Object.values(errors).join(', ');
};
