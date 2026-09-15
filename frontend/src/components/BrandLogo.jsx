import React from 'react';

/**
 * Professional FinGuard AI Enterprise Insignia
 * A sleek geometric emblem combining cryptographic security, graph forensics, and institutional AML integrity.
 */
export default function BrandLogo({ className = "w-6 h-6", isLight = false }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Hexagonal Shield Vault */}
      <path 
        d="M16 3L27 8.5V17C27 23.2 22.3 27.8 16 29.5C9.7 27.8 5 23.2 5 17V8.5L16 3Z" 
        stroke="currentColor" 
        strokeWidth="2.2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      {/* Inner Precision Diamond Nexus */}
      <path 
        d="M16 9L22 16L16 23L10 16L16 9Z" 
        stroke="currentColor" 
        strokeWidth="1.8" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        fill="currentColor"
        fillOpacity="0.12"
      />
      {/* Central Security Core */}
      <circle cx="16" cy="16" r="2.5" fill="currentColor" />
      {/* Upper Forensic Node */}
      <circle cx="16" cy="9" r="1.5" fill="currentColor" />
      {/* Lower Forensic Node */}
      <circle cx="16" cy="23" r="1.5" fill="currentColor" />
    </svg>
  );
}
