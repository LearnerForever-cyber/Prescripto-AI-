
import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Plus Sign Outline */}
      <path 
        d="M50 25V75M25 50H75" 
        stroke="currentColor" 
        strokeWidth="8" 
        strokeLinecap="round"
      />
      
      {/* Center Dot */}
      <circle cx="50" cy="50" r="6" fill="#00a3e0" />
      
      {/* Corner Dots */}
      <circle cx="30" cy="30" r="3" fill="#00a3e0" fillOpacity="0.8" />
      <circle cx="70" cy="30" r="3" fill="#00a3e0" fillOpacity="0.8" />
      <circle cx="30" cy="70" r="3" fill="#00a3e0" fillOpacity="0.8" />
      <circle cx="70" cy="70" r="3" fill="#00a3e0" fillOpacity="0.8" />
    </svg>
  );
};
