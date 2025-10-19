// components/Logo.tsx
import React from "react";

type Props = {
  width?: number;
  height?: number;
  className?: string;
};

export default function Logo({
  width = 48,
  height = 48,
  className = "",
}: Props) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Site logo"
    >
      {/* outer ring */}
      <circle
        cx="512"
        cy="512"
        r="420"
        fill="none"
        stroke="currentColor"
        strokeWidth="36"
        className="text-gray-700 dark:text-gray-300"
      />

      {/* staircase (rectangular steps, centered alignment) */}
      <g transform="translate(260,700)">
        {/* each step uses theme color */}
        <rect x="0" y="0" width="120" height="80" fill="hsl(var(--primary))" />
        <rect x="120" y="-80" width="120" height="80" fill="hsl(var(--primary))" />
        <rect x="240" y="-160" width="120" height="80" fill="hsl(var(--primary))" />
        <rect x="360" y="-240" width="120" height="80" fill="hsl(var(--primary))" />

        {/* top circle: centered horizontally with the last rectangle */}
        <circle
          cx="420"   // mid of last rect (360 + 120/2)
          cy="-280"  // vertically centered above last rect (-240 - 80/2)
          r="40"
          fill="hsl(var(--secondary))"
        />
      </g>
    </svg>
  );
}
