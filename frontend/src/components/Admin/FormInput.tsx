import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
    label: string;
    error?: string;
    helperText?: string;
    textarea?: boolean;
    rows?: number;
}

const FormInput: React.FC<FormInputProps> = ({
    label,
    error,
    helperText,
    textarea,
    rows = 3,
    className = '',
    ...props
}) => {
    const inputClasses = `
        block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset
        ${error ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-600'}
        placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6
        ${className}
    `;

    return (
        <div>
            <label className="block text-sm font-medium leading-6 text-gray-900">
                {label}
            </label>
            <div className="mt-2 relative">
                {textarea ? (
                    <textarea
                        rows={rows}
                        className={inputClasses}
                        {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                    />
                ) : (
                    <input
                        className={inputClasses}
                        {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
                    />
                )}
            </div>
            <div className="mt-1 flex justify-between">
                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}
                {!error && helperText && (
                    <p className="text-sm text-gray-500">{helperText}</p>
                )}
                {props.maxLength && (
                    <p className="text-xs text-gray-400">
                        {String(props.value || '').length}/{props.maxLength}
                    </p>
                )}
            </div>
        </div>
    );
};

export default FormInput;
