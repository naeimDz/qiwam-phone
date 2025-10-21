'use client'

interface FormErrorProps {
  message?: string
  className?: string
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null

  return (
    <div
      className={`rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-200 ${className}`}
      role="alert"
    >
      <p className="font-medium">خطأ</p>
      <p>{message}</p>
    </div>
  )
}
