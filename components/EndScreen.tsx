import React from 'react';
import { PRIZE_LADDER } from '../constants';

interface EndScreenProps {
  level: number;
  won: boolean;
  onRestart: () => void;
}

export const EndScreen: React.FC<EndScreenProps> = ({ level, won, onRestart }) => {
  let prize = "0";
  if (won) {
      prize = PRIZE_LADDER[11];
  } else {
      if (level >= 9) prize = PRIZE_LADDER[9];      
      else if (level >= 4) prize = PRIZE_LADDER[4]; 
      else prize = "0";
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-fade-in z-10">
      <div className="text-6xl md:text-8xl mb-3 animate-bounce">
        {won ? '🏆' : '🧤'}
      </div>
      
      <h2 className="text-3xl md:text-4xl font-black mb-1 uppercase text-white tracking-tighter">
        {won ? 'NHÀ VÔ ĐỊCH!' : 'KẾT THÚC'}
      </h2>
      
      <p className="text-white/90 mb-6 text-sm md:text-lg max-w-lg font-bold italic drop-shadow-sm">
        {won 
          ? "Bạn thật sự đam mê bóng đá. Một Fan đích thực!" 
          : "Hôm nay bạn không đam mê bằng 1 học sinh lớp 5!"}
      </p>

      <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl mb-6 border border-white/20 w-full max-w-xs">
        <p className="text-white/50 text-[10px] mb-1 uppercase font-bold">Tổng giải thưởng</p>
        <div className="text-3xl font-black text-yellow-400 drop-shadow-md">{prize} VNĐ</div>
      </div>

      <button 
        onClick={onRestart} 
        className="bg-white text-pl-dark font-black py-3 px-10 rounded-xl text-lg hover:bg-pl-green transition-all shadow-xl active:scale-95"
      >
        CHƠI LẠI
      </button>
    </div>
  );
};