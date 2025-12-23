import React, { useEffect, useRef } from 'react';
import { playArcadeIntro, stopArcadeIntro } from './SoundManager';

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const ballRef = useRef<HTMLDivElement>(null);
  const goalRef = useRef<HTMLDivElement>(null);
  const shakeTimeoutRef = useRef<number | null>(null);

  // Play intro music on mount with autoplay fallback
  useEffect(() => {
    playArcadeIntro();

    const unlockAudio = () => {
       playArcadeIntro();
       cleanUpListeners();
    };

    const cleanUpListeners = () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);

    return () => {
      stopArcadeIntro();
      cleanUpListeners();
    };
  }, []);

  // Logic to randomize the penalty kick target
  useEffect(() => {
    const triggerKick = () => {
        if (!ballRef.current || !goalRef.current) return;

        const randomX = Math.floor(Math.random() * 120) - 60;
        const randomY = Math.floor(Math.random() * 60) - 130; 
        
        ballRef.current.style.setProperty('--target-x', `${randomX}px`);
        ballRef.current.style.setProperty('--target-y', `${randomY}px`);

        ballRef.current.style.animation = 'none';
        void ballRef.current.offsetWidth;
        ballRef.current.style.animation = 'penaltyKickSequence 4s ease-out forwards';

        if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
        goalRef.current.style.animation = 'none';
        
        shakeTimeoutRef.current = window.setTimeout(() => {
            if (goalRef.current) {
                goalRef.current.style.animation = 'netShake 0.4s ease-out';
            }
        }, 880); 
    };

    triggerKick();
    const interval = setInterval(triggerKick, 4200);

    return () => {
        clearInterval(interval);
        if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    };
  }, []);

  const handleKickOff = () => {
      stopArcadeIntro();
      onStart();
  };

  return (
    <div className="flex flex-col items-center justify-between h-full py-4 text-center px-4 animate-fade-in relative overflow-hidden">
      
      {/* Top Section: Logo & Animation compacted */}
      <div className="flex flex-col items-center justify-center w-full flex-1 min-h-0">
          {/* Game Logo - Adjusted size for fit */}
          <img 
            src="https://lh3.googleusercontent.com/d/1ah0RGe13kImy6WxdDFMYirAQupXX68Sl" 
            alt="Logo"
            className="w-40 md:w-60 mb-1 drop-shadow-2xl hover:scale-105 transition-transform duration-500 object-contain max-h-[15vh] md:max-h-none"
          />

          {/* Penalty Kick Animation - Heavily scaled and margin reduced to fit */}
          <div className="transform scale-[0.5] md:scale-75 origin-center -my-10 md:-my-6 pointer-events-none">
             <div className="soccer-animation">
                <div ref={goalRef} className="goal-post">
                    <div className="goal-net"></div>
                </div>
                <div className="penalty-spot"></div>
                <div ref={ballRef} className="ball-kick">⚽</div>
             </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-black mb-0 text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] uppercase tracking-tighter leading-none">
            Premier <span className="text-pl-green">League</span>
          </h1>
          <h2 className="text-sm md:text-lg font-bold mb-2 text-yellow-400 uppercase tracking-widest mt-1">
            Ai đam mê hơn học sinh lớp 5?
          </h2>
      </div>

      {/* Bottom Section: Controls */}
      <div className="flex flex-col items-center w-full max-w-sm pb-2">
          <div className="glass-panel py-3 px-6 rounded-2xl mb-3 w-full border-l-4 border-pl-green">
            <p className="text-white/70 text-xs mb-0 italic">Giải thưởng tối đa</p>
            <div className="text-2xl md:text-3xl font-black text-pl-green drop-shadow-md">100.000.000 VNĐ</div>
          </div>

          <button 
            onClick={handleKickOff} 
            className="group relative overflow-hidden bg-pl-green text-pl-dark font-black py-3 px-12 rounded-full text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,255,133,0.4)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              KICK OFF <span className="group-hover:translate-x-1 transition-transform">➜</span>
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
          
          <p className="mt-2 text-[10px] text-white/30 italic">Chạm vào màn hình để bật âm thanh</p>
      </div>
    </div>
  );
};