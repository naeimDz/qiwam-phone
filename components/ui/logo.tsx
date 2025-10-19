import type { LogoProps } from '@/types'

export function Logo({ size = 36, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" rx="20" fill="currentColor" fillOpacity="0.1" />
      <path
        d="M30 25 L50 25 L50 45 L30 45 Z M50 25 L70 25 L70 45 L50 45 Z M30 45 L50 45 L50 65 L30 65 Z M50 45 L70 45 L70 65 L50 65 Z M40 70 L60 70 L60 75 L40 75 Z"
        fill="currentColor"
      />
      <circle cx="38" cy="33" r="2" fill="currentColor" fillOpacity="0.6" />
      <circle cx="62" cy="33" r="2" fill="currentColor" fillOpacity="0.6" />
      <circle cx="38" cy="53" r="2" fill="currentColor" fillOpacity="0.6" />
      <circle cx="62" cy="53" r="2" fill="currentColor" fillOpacity="0.6" />
    </svg>
  )
}
