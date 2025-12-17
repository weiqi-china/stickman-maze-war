import React from 'react';
import { ItemType } from '../types';
import { DoorOpen, Zap } from 'lucide-react';

interface PetProps {
  heldItem?: ItemType;
}

export const Pet: React.FC<PetProps> = ({ heldItem = ItemType.NONE }) => {
  return (
    <div className="relative w-full h-full">
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full drop-shadow-sm animate-bounce">
        <defs>
          <radialGradient id="petGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f472b6" /> {/* Pinkish core */}
            <stop offset="100%" stopColor="#db2777" />
          </radialGradient>
        </defs>
        
        {/* Little floating drone body */}
        <circle cx="12" cy="12" r="6" fill="url(#petGrad)" stroke="white" strokeWidth="1.5" />
        
        {/* Eyes */}
        <circle cx="10" cy="11" r="1.5" fill="white" />
        <circle cx="14" cy="11" r="1.5" fill="white" />
        <circle cx="10" cy="11" r="0.5" fill="black" />
        <circle cx="14" cy="11" r="0.5" fill="black" />
        
        {/* Antenna */}
        <line x1="12" y1="6" x2="12" y2="3" stroke="#f472b6" strokeWidth="1" />
        <circle cx="12" cy="2" r="1" fill="#fde047" /> {/* Glowing tip */}

        {/* Little wings */}
        <path d="M6 12 Q 2 10, 6 8" stroke="white" strokeWidth="1" fill="white" fillOpacity="0.5" />
        <path d="M18 12 Q 22 10, 18 8" stroke="white" strokeWidth="1" fill="white" fillOpacity="0.5" />
      </svg>

      {/* Held Item Indicator */}
      {heldItem === ItemType.DOOR && (
         <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5 border border-white shadow-sm">
           <DoorOpen size={8} className="text-white" />
         </div>
      )}
      {heldItem === ItemType.SHURIKEN && (
         <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-0.5 border border-white shadow-sm">
           <Zap size={8} className="text-white" />
         </div>
      )}
    </div>
  );
};
