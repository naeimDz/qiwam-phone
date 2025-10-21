'use client'

interface FormSuccessProps {
  message?: string
  className?: string
}

export function FormSuccess({ message, className }: FormSuccessProps) {
  if (!message) return null

  return (
    <div
      className={`rounded-md bg-green-50 p-3 text-sm text-green-800 border border-green-200 ${className}`}
      role="alert"
    >
      <p className="font-medium">نجح</p>
      <p>{message}</p>
    </div>
  )
}