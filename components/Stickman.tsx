import React from 'react';

interface StickmanProps {
  color: string;
  isPolice?: boolean;
}

export const Stickman: React.FC<StickmanProps> = ({ color, isPolice }) => {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-md">
      <defs>
        <radialGradient id={`grad-${isPolice ? 'police' : 'player'}`} cx="50%" cy="30%" r="50%" fx="50%" fy="30%">
          <stop offset="0%" stopColor={isPolice ? '#60a5fa' : color} stopOpacity="1" />
          <stop offset="100%" stopColor={isPolice ? '#1d4ed8' : (color === '#171717' ? 'black' : '#b91c1c')} stopOpacity="1" />
        </radialGradient>
      </defs>

      {/* Feet */}
      <ellipse cx="8" cy="21" rx="3" ry="2" fill="#333" />
      <ellipse cx="16" cy="21" rx="3" ry="2" fill="#333" />

      {/* Big Head Body */}
      <circle cx="12" cy="13" r="9" fill={isPolice ? `url(#grad-police)` : color} stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
      
      {/* Face Details */}
      {!isPolice && (
        <>
          {/* Bandit Mask */}
          <path d="M3 12 C3 12, 6 10, 12 10 C18 10, 21 12, 21 12 V 15 C21 15, 18 17, 12 17 C6 17, 3 15, 3 15 Z" fill="#111" />
          {/* Eyes inside mask */}
          <circle cx="9" cy="13.5" r="1.5" fill="white" />
          <circle cx="15" cy="13.5" r="1.5" fill="white" />
          {/* Tie of the mask */}
          <path d="M21 12 L23 11 M21 14 L23 15" stroke="#111" strokeWidth="1.5" />
        </>
      )}

      {isPolice && (
        <>
           {/* Eyes */}
           <ellipse cx="9" cy="14" rx="2" ry="2.5" fill="white" />
           <ellipse cx="15" cy="14" rx="2" ry="2.5" fill="white" />
           <circle cx="9" cy="14" r="0.8" fill="black" />
           <circle cx="15" cy="14" r="0.8" fill="black" />

           {/* Police Cap */}
           <path d="M4 10 L20 10 L19 6 H5 L4 10 Z" fill="#1e3a8a" /> {/* Cap Top */}
           <path d="M3 10 H21 V11.5 C21 11.5 17 10.5 12 10.5 C7 10.5 3 11.5 3 11.5 V10 Z" fill="#111" /> {/* Visor */}
           
           {/* Badge */}
           <circle cx="12" cy="8" r="1.5" fill="#facc15" />
        </>
      )}

      {/* Shine on head */}
      <ellipse cx="8" cy="8" rx="3" ry="1.5" fill="white" fillOpacity="0.3" transform="rotate(-45 8 8)" />
    </svg>
  );
};