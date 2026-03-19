export function MosqueIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main Dome */}
      <path
        d="M50 10C50 10 30 30 30 45C30 52 38 58 50 58C62 58 70 52 70 45C70 30 50 10 50 10Z"
        fill="currentColor"
        fillOpacity="0.9"
      />
      
      {/* Crescent on top */}
      <path
        d="M50 5C52 5 54 7 54 9C54 11 52 13 50 13C51 13 52 11 52 9C52 7 51 5 50 5Z"
        fill="currentColor"
      />
      <circle cx="50" cy="9" r="1.5" fill="currentColor" />
      
      {/* Main Building */}
      <rect x="25" y="55" width="50" height="35" fill="currentColor" fillOpacity="0.8" />
      
      {/* Center Door */}
      <path
        d="M42 90V72C42 68 45 65 50 65C55 65 58 68 58 72V90"
        fill="currentColor"
        fillOpacity="0.3"
      />
      
      {/* Left Minaret */}
      <rect x="15" y="35" width="8" height="55" fill="currentColor" fillOpacity="0.85" />
      <path
        d="M19 25C19 25 14 32 14 35H24C24 32 19 25 19 25Z"
        fill="currentColor"
      />
      <circle cx="19" cy="22" r="2" fill="currentColor" />
      
      {/* Right Minaret */}
      <rect x="77" y="35" width="8" height="55" fill="currentColor" fillOpacity="0.85" />
      <path
        d="M81 25C81 25 76 32 76 35H86C86 32 81 25 81 25Z"
        fill="currentColor"
      />
      <circle cx="81" cy="22" r="2" fill="currentColor" />
      
      {/* Windows */}
      <rect x="32" y="62" width="6" height="10" rx="3" fill="currentColor" fillOpacity="0.3" />
      <rect x="62" y="62" width="6" height="10" rx="3" fill="currentColor" fillOpacity="0.3" />
      
      {/* Decorative Elements */}
      <rect x="17" y="45" width="4" height="6" rx="2" fill="currentColor" fillOpacity="0.4" />
      <rect x="17" y="55" width="4" height="6" rx="2" fill="currentColor" fillOpacity="0.4" />
      <rect x="17" y="65" width="4" height="6" rx="2" fill="currentColor" fillOpacity="0.4" />
      
      <rect x="79" y="45" width="4" height="6" rx="2" fill="currentColor" fillOpacity="0.4" />
      <rect x="79" y="55" width="4" height="6" rx="2" fill="currentColor" fillOpacity="0.4" />
      <rect x="79" y="65" width="4" height="6" rx="2" fill="currentColor" fillOpacity="0.4" />
    </svg>
  )
}
