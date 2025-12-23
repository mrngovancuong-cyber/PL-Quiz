
export interface Question {
  id: string;
  q: string; // Question text
  a: string[]; // Options
  c: number; // Correct index
  p: string; // Prize money string (e.g., "1")
  explanation?: string;
}

export interface QuestionBank {
  [level: number]: Question[];
}

export type GameState = 'START' | 'PLAYING' | 'END';

export interface Lifelines {
  audience: boolean; // Ask the crowd
  expert: boolean;   // Consult legend
  saoChep: boolean;  // Mai Tùa (Auto Answer)
  sub: boolean;      // Swap question
}

export interface SoundEffect {
  id: string;
  src: string;
  loop?: boolean;
}
