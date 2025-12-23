import React, { useState } from 'react';
import { GameState, Question } from './types';
import { QUESTION_BANK } from './constants';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { EndScreen } from './components/EndScreen';
import { SoundManager, playSound, playVictoryMelody, playLossMelody } from './components/SoundManager';

// Helper to shuffle questions
const prepareQuestions = (): Question[] => {
  const selected: Question[] = [];
  for (let i = 1; i <= 12; i++) {
    const pool = QUESTION_BANK[i];
    if (pool && pool.length > 0) {
      const randomQ = pool[Math.floor(Math.random() * pool.length)];
      selected.push(randomQ);
    }
  }
  return selected;
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('START');
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const [finalLevel, setFinalLevel] = useState(0);
  const [wonGame, setWonGame] = useState(false);

  const startGame = () => {
    playSound('whistle');
    const qs = prepareQuestions();
    setGameQuestions(qs);
    setGameState('PLAYING');
  };

  const endGame = (won: boolean, level: number) => {
    setWonGame(won);
    setFinalLevel(level);
    if (won) {
        playVictoryMelody();
    } else {
        playLossMelody();
    }
    setGameState('END');
  };

  return (
    <div className="w-full min-h-screen bg-pl-dark relative flex items-center justify-center overflow-hidden font-sans">
      {/* Background Elements */}
      <div className="absolute inset-0 pitch-bg opacity-10 pointer-events-none"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-pl-purple rounded-full blur-[100px] opacity-50"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pl-green rounded-full blur-[100px] opacity-20"></div>

      <SoundManager />

      <div className="relative z-10 w-full flex justify-center">
        {gameState === 'START' && <StartScreen onStart={startGame} />}
        {gameState === 'PLAYING' && <GameScreen questions={gameQuestions} onEnd={endGame} />}
        {gameState === 'END' && <EndScreen level={finalLevel} won={wonGame} onRestart={() => setGameState('START')} />}
      </div>
    </div>
  );
};

export default App;