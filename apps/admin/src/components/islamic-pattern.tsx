export function IslamicPattern({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <pattern id="islamicPattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
          {/* 8-pointed star pattern */}
          <path
            d="M25 0L30 10L40 10L32 17L35 27L25 21L15 27L18 17L10 10L20 10Z"
            fill="currentColor"
            fillOpacity="0.08"
          />
          <path
            d="M25 23L30 33L40 33L32 40L35 50L25 44L15 50L18 40L10 33L20 33Z"
            fill="currentColor"
            fillOpacity="0.06"
          />
          {/* Connecting lines */}
          <path
            d="M0 25H10M40 25H50M25 0V10M25 40V50"
            stroke="currentColor"
            strokeOpacity="0.1"
            strokeWidth="0.5"
          />
          {/* Diamond accent */}
          <path
            d="M25 15L30 25L25 35L20 25Z"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.1"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="200" height="200" fill="url(#islamicPattern)" />
    </svg>
  )
}

export function GeometricBorder({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="none"
    >
      <defs>
        <pattern id="borderPattern" x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse">
          <path
            d="M0 10L10 0L20 10L30 0L40 10"
            stroke="currentColor"
            strokeOpacity="0.3"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M0 10L10 20L20 10L30 20L40 10"
            stroke="currentColor"
            strokeOpacity="0.3"
            strokeWidth="1"
            fill="none"
          />
          <circle cx="10" cy="10" r="2" fill="currentColor" fillOpacity="0.2" />
          <circle cx="30" cy="10" r="2" fill="currentColor" fillOpacity="0.2" />
        </pattern>
      </defs>
      <rect width="400" height="20" fill="url(#borderPattern)" />
    </svg>
  )
}
