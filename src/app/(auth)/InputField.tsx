'use client'

import { forwardRef } from 'react'

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
  required?: boolean
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, hint, required, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-900">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <input
          ref={ref}
          className={`
            w-full px-4 py-2.5 border rounded-lg
            text-gray-900 placeholder-gray-400
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${
              error
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 bg-white hover:border-gray-400'
            }
            ${className}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.name}-error` : undefined}
          {...props}
        />

        {error && (
          <p id={`${props.name}-error`} className="text-sm text-red-600">
            {error}
          </p>
        )}

        {hint && !error && (
          <p className="text-sm text-gray-500">{hint}</p>
        )}
      </div>
    )
  }
)

InputField.displayName = 'InputField'
