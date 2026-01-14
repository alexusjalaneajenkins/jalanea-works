'use client'

import { AlertCircle } from 'lucide-react'

interface FormErrorProps {
  message?: string
  className?: string
}

/**
 * Displays a form validation error message
 * Returns null if no message is provided
 */
export function FormError({ message, className = '' }: FormErrorProps) {
  if (!message) return null

  return (
    <div className={`flex items-center gap-1.5 text-red-600 text-sm mt-1 ${className}`}>
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}

/**
 * Displays a form field error from react-hook-form
 * Handles the FieldError type which has a message property
 */
interface FieldErrorDisplayProps {
  error?: { message?: string }
  className?: string
}

export function FieldError({ error, className = '' }: FieldErrorDisplayProps) {
  if (!error?.message) return null

  return <FormError message={error.message} className={className} />
}

/**
 * Wrapper component for form fields that shows error styling
 */
interface FormFieldProps {
  children: React.ReactNode
  error?: { message?: string }
  className?: string
}

export function FormField({ children, error, className = '' }: FormFieldProps) {
  return (
    <div className={className}>
      {children}
      <FieldError error={error} />
    </div>
  )
}
