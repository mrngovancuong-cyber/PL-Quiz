import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Question, Lifelines } from '../types';
import { playSound } from './SoundManager';
import { Roadmap } from './Roadmap';
import { LifelineModal } from './LifelineModal';

interface GameScreenProps {
  questions: Question[];
  onEnd: (won: boolean, level: number) => void;
}

const MAX_TIME = 30;

export const GameScreen: React.FC<GameScreenProps> = ({ questions, onEnd }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false); // Validating answer
  const [lifelines, setLifelines] = useState<Lifelines>({ audience: true, expert: true, saoChep: true, sub: true });
  const [activeModal, setActiveModal] = useState<'audience' | 'expert' | null>(null);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]); 
  const [roadmapOpen, setRoadmapOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question>(questions[0]);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const timerRef = useRef<number | null>(null);

  // Update current question when index changes or active question changes (Sub)
  useEffect(() => {
    if (questions[currentIdx]) {
        if (currentQuestion.id !== questions[currentIdx].id && currentQuestion.p !== questions[currentIdx].p) {
             setCurrentQuestion(questions[currentIdx]);
        }
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, questions]);

  // Reset Timer when question changes
  useEffect(() => {
    setTimeLeft(MAX_TIME);
  }, [currentQuestion]);

  // Timer Logic
  useEffect(() => {
    // Stop timer if checking answer, modal is open, or already timed out
    if (isChecking || activeModal || timeLeft <= 0) return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, isChecking, activeModal]);

  const handleTimeout = () => {
    playSound('wrong');
    // Automatically fail
    onEnd(false, currentIdx);
  };

  const handleAnswer = (idx: number) => {
    if (isChecking || selectedAns !== null || timeLeft <= 0) return;
    
    setSelectedAns(idx);
    setIsChecking(true);

    // Suspense delay
    setTimeout(() => {
      const isCorrect = idx === currentQuestion.c;
      
      if (isCorrect) {
        playSound('correct');
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 }, colors: ['#00ff85', '#ffffff'] });
        
        setTimeout(() => {
          if (currentIdx < questions.length - 1) {
            setCurrentIdx(prev => prev + 1);
            setCurrentQuestion(questions[currentIdx + 1]); // Advance
            setSelectedAns(null);
            setIsChecking(false);
            setHiddenOptions([]);
          } else {
            onEnd(true, 12);
          }
        }, 1500);
      } else {
        playSound('wrong');
        setTimeout(() => {
          onEnd(false, currentIdx);
        }, 2000);
      }
    }, 1500); // 1.5s suspense
  };

  const handleLifeline = (type: keyof Lifelines) => {
    if (!lifelines[type] || isChecking || timeLeft <= 0) return;

    if (type === 'audience') {
      setActiveModal('audience');
      setLifelines(prev => ({ ...prev, audience: false }));
    } else if (type === 'expert') {
      setActiveModal('expert');
      setLifelines(prev => ({ ...prev, expert: false }));
    } else if (type === 'saoChep') {
      playSound('cash'); 
      setLifelines(prev => ({ ...prev, saoChep: false }));
      handleAnswer(currentQuestion.c);
    } else if (type === 'sub') {
      playSound('substitute');
      setLifelines(prev => ({ ...prev, sub: false }));
      const correctIdx = currentQuestion.c;
      const wrongIndices = [0, 1, 2, 3].filter(i => i !== correctIdx);
      const shuffledWrong = wrongIndices.sort(() => 0.5 - Math.random());
      const toHide = shuffledWrong.slice(0, 2);
      setHiddenOptions(toHide);
      // Timer will reset via useEffect on currentQuestion dependency if we actually swapped question
      // But 'sub' logic in this simplified version just hides answers (50/50 logic basically) or swaps?
      // Looking at previous logic: it sets hiddenOptions. It DOES NOT actually swap the question text in the original logic. 
      // User prompt said "Thay người" (Sub) but logic acted like 50/50. 
      // If we want to strictly follow existing logic, we just continue. 
      // If we want to reset timer on 'sub' (50/50), we can manually do it:
      // setTimeLeft(MAX_TIME); // Optional: Give them fresh time for 50/50? Let's keep it continuous for difficulty unless it's a real swap.
    }
  };

  // Calculate timer color
  const getTimerColor = () => {
    if (timeLeft <= 5) return 'bg-red-500';
    if (timeLeft <= 15) return 'bg-yellow-400';
    return 'bg-pl-green';
  };

  return (
    <div className="flex w-full h-full max-w-5xl gap-2 p-2 relative flex-col md:flex-row">
      {/* Mobile Roadmap Toggle */}
      <button 
        onClick={() => setRoadmapOpen(!roadmapOpen)}
        className="md:hidden fixed top-3 right-3 z-[60] bg-pl-purple p-2 rounded-full border border-white/20 shadow-lg scale-75"
      >
        💰
      </button>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col h-full justify-between">
        {/* Header - Compact */}
        <div className="flex justify-between items-center mb-2 px-1">
          <div className="bg-pl-green text-pl-dark px-3 py-0.5 rounded-full font-black text-xs uppercase shadow-[0_0_10px_rgba(0,255,133,0.5)]">
            Câu {currentIdx + 1}/12
          </div>
          <div className="text-yellow-400 font-black text-lg drop-shadow-md">
            {questions[currentIdx]?.p ? questions[currentIdx].p + ".000.000 VNĐ" : "0 VNĐ"}
          </div>
        </div>

        {/* Question Board - Flexible height but compact padding */}
        <div className="glass-panel flex-1 rounded-xl p-3 md:p-6 flex flex-col justify-center relative mb-2 border-2 border-white/10 shadow-2xl min-h-0 overflow-y-auto">
           {/* Progress line (Question progress) */}
          <div className="absolute top-0 left-0 h-1 bg-white/10 w-full">
             <div className="h-full bg-gradient-to-r from-pl-purple to-blue-400 transition-all duration-700" style={{ width: `${((currentIdx + 1) / 12) * 100}%` }}></div>
          </div>
          
          <h2 className="text-lg md:text-2xl font-bold text-center text-white mb-4 leading-snug">
            {currentQuestion.q}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 w-full">
            {currentQuestion.a.map((opt, i) => {
              const isSelected = selectedAns === i;
              const isHidden = hiddenOptions.includes(i);
              
              let btnClass = "bg-white/5 border-white/10 hover:bg-white/10 hover:scale-[1.01]";
              if (isChecking) {
                 if (isSelected) btnClass = "bg-yellow-500 border-yellow-400 text-black scale-[1.01]";
              }
              
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={isChecking || isHidden}
                  className={`
                    group relative p-3 rounded-lg text-left transition-all duration-200 border-2
                    flex items-center
                    ${isHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                    ${btnClass}
                  `}
                >
                  <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs md:text-sm mr-3 group-hover:bg-pl-green group-hover:text-pl-dark transition-colors shrink-0">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="font-semibold text-sm md:text-base leading-tight">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Control Area: Lifelines + Timer */}
        <div className="flex flex-col gap-2 shrink-0">
            {/* Lifelines Area - Compact */}
            <div className="grid grid-cols-4 gap-2 h-14 md:h-16">
                <LifelineButton icon="👥" label="Khán giả" used={!lifelines.audience} onClick={() => handleLifeline('audience')} />
                <LifelineButton icon="👔" label="Chuyên gia" used={!lifelines.expert} onClick={() => handleLifeline('expert')} />
                <LifelineButton icon="💰" label="Mai Tùa" used={!lifelines.saoChep} onClick={() => handleLifeline('saoChep')} />
                <LifelineButton icon="🔄" label="Thay người" used={!lifelines.sub} onClick={() => handleLifeline('sub')} />
            </div>

            {/* Timer Bar */}
            <div className="w-full bg-black/40 rounded-lg p-2 border border-white/5">
                <div className="flex justify-between text-[10px] md:text-xs text-white/70 mb-1 font-bold uppercase tracking-wider">
                    <span>Thời gian còn lại</span>
                    <span className={timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-pl-green"}>{timeLeft}s</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-1000 ease-linear ${getTimerColor()}`}
                        style={{ width: `${(timeLeft / MAX_TIME) * 100}%` }}
                    ></div>
                </div>
            </div>
        </div>
      </div>

      {/* Sidebar (Desktop & Mobile) */}
      <Roadmap currentLevel={currentIdx} isMobileOpen={roadmapOpen} />

      {/* Modals */}
      {activeModal && (
        <LifelineModal 
          type={activeModal} 
          question={currentQuestion} 
          onClose={() => setActiveModal(null)} 
        />
      )}
    </div>
  );
};

const LifelineButton: React.FC<{ icon: string, label: string, used: boolean, onClick: () => void }> = ({ icon, label, used, onClick }) => (
    <button 
        onClick={onClick}
        disabled={used}
        className={`
            flex flex-col items-center justify-center rounded-xl transition-all active:scale-95 shadow-lg border-b-4
            ${used 
                ? 'bg-gray-800 border-gray-900 text-gray-600 opacity-50 cursor-not-allowed' 
                : 'bg-gradient-to-b from-pl-purple to-pl-dark border-pl-dark hover:brightness-125'
            }
        `}
    >
        <span className="text-xl md:text-2xl mb-0 md:mb-1 leading-none">{icon}</span>
        <span className="text-[9px] md:text-xs font-bold uppercase hidden md:block">{label}</span>
    </button>
);