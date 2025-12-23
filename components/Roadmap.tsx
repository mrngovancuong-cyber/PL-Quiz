import React from 'react';
import { PRIZE_LADDER } from '../constants';

interface RoadmapProps {
  currentLevel: number; // 0-based index
  isMobileOpen: boolean;
}

export const Roadmap: React.FC<RoadmapProps> = ({ currentLevel, isMobileOpen }) => {
  return (
    <div 
      className={`
        fixed md:static inset-y-0 right-0 w-64 md:w-56 bg-pl-dark/95 md:bg-black/20 backdrop-blur-md 
        border-l md:border md:border-white/10 p-4 transition-transform duration-300 z-50
        flex flex-col justify-center rounded-l-2xl md:rounded-2xl
        ${isMobileOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}
    >
      <h3 className="text-center font-black text-xs mb-4 text-pl-green/70 uppercase tracking-widest">ĐƯỜNG TỚI VINH QUANG</h3>
      <div className="flex flex-col-reverse gap-1 overflow-y-auto">
        {PRIZE_LADDER.map((prize, index) => {
          const isCurrent = index === currentLevel;
          const isPassed = index < currentLevel;
          const isMilestone = index === 4 || index === 8 || index === 11;
          
          let bgClass = "bg-white/5 border-white/5 text-white/30";
          if (isCurrent) bgClass = "bg-pl-green text-pl-dark scale-105 shadow-[0_0_15px_rgba(0,255,133,0.3)] border-pl-green z-10";
          else if (isPassed) bgClass = "bg-pl-green/20 text-pl-green/50 border-pl-green/20";
          else if (isMilestone) bgClass = "bg-white/10 text-yellow-400 border-yellow-400/30";

          return (
            <div 
              key={index} 
              className={`
                flex justify-between items-center px-3 py-2 rounded-lg font-bold border transition-all text-xs
                ${bgClass}
              `}
            >
              <span>{index + 1}</span>
              <span>{prize}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};