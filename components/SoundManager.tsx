import React from 'react';
import { SOUNDS } from '../constants';

// A simple invisible component to hold audio elements
export const SoundManager: React.FC = () => {
  return (
    <div className="hidden">
      {SOUNDS.map((sound) => (
        <audio 
            key={sound.id} 
            id={`snd-${sound.id}`} 
            src={sound.src} 
            preload="auto" 
            loop={sound.loop}
        />
      ))}
    </div>
  );
};

export const playSound = (id: string) => {
  const el = document.getElementById(`snd-${id}`) as HTMLAudioElement;
  if (el) {
    el.currentTime = 0;
    el.play().catch(e => console.log("Audio play blocked", e));
  }
};

export const stopSound = (id: string) => {
    const el = document.getElementById(`snd-${id}`) as HTMLAudioElement;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
};

// --- Web Audio API Synthesizer ---
let audioCtx: AudioContext | null = null;
let melodyInterval: number | null = null;
let victoryTimeout: number | null = null;
let lossTimeout: number | null = null;
let isPlayingMelody = false;

// Note frequencies (Hz)
const NOTES = {
  // Bass Octave (3)
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,

  // Middle Octave (4)
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  
  // High Octave (5)
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,

  // Super High (6)
  C6: 1046.50
};

interface NoteStep {
  notes: number[];
  dur: number;
}

// Intro Loop
const MELODY_SEQUENCE: NoteStep[] = [
  { notes: [NOTES.C3, NOTES.C4, NOTES.E4], dur: 0.12 },
  { notes: [NOTES.C3, NOTES.C4, NOTES.E4], dur: 0.12 },
  { notes: [NOTES.C3, NOTES.E4, NOTES.G4], dur: 0.12 },
  { notes: [NOTES.C3, NOTES.G4, NOTES.C5], dur: 0.24 }, 
  { notes: [NOTES.C3, NOTES.G4], dur: 0.12 }, 
  { notes: [NOTES.C3, NOTES.E4], dur: 0.12 },
  { notes: [NOTES.F3, NOTES.F4, NOTES.A4], dur: 0.12 },
  { notes: [NOTES.F3, NOTES.F4, NOTES.A4], dur: 0.12 },
  { notes: [NOTES.F3, NOTES.A4, NOTES.C5], dur: 0.12 },
  { notes: [NOTES.F3, NOTES.C5, NOTES.F4], dur: 0.24 },
  { notes: [NOTES.G3, NOTES.G4, NOTES.B4], dur: 0.12 },
  { notes: [NOTES.G3, NOTES.B4, NOTES.D5], dur: 0.12 },
  { notes: [NOTES.C3, NOTES.E4, NOTES.G4, NOTES.C5], dur: 0.4 },
  { notes: [], dur: 0.2 }, 
];

// Victory Fanfare (Triumphant Brass Style)
const VICTORY_SEQUENCE: NoteStep[] = [
    { notes: [NOTES.C4, NOTES.E4, NOTES.G4], dur: 0.08 },
    { notes: [NOTES.E4, NOTES.G4, NOTES.C5], dur: 0.08 },
    { notes: [NOTES.G4, NOTES.C5, NOTES.E5], dur: 0.08 },
    { notes: [NOTES.C5, NOTES.E5, NOTES.G5], dur: 0.08 },
    { notes: [NOTES.C4, NOTES.G4, NOTES.C5, NOTES.E5, NOTES.G5], dur: 0.4 },
    { notes: [NOTES.F4, NOTES.A4, NOTES.C5, NOTES.F5], dur: 0.2 },
    { notes: [NOTES.F4, NOTES.A4, NOTES.C5, NOTES.F5], dur: 0.2 },
    { notes: [NOTES.G4, NOTES.B4, NOTES.D5, NOTES.G5], dur: 0.2 },
    { notes: [NOTES.G4, NOTES.B4, NOTES.D5, NOTES.G5], dur: 0.2 },
    { notes: [NOTES.C4, NOTES.E4, NOTES.G4, NOTES.C5, NOTES.E5], dur: 0.15 },
    { notes: [], dur: 0.05 },
    { notes: [NOTES.C4, NOTES.E4, NOTES.G4, NOTES.C5, NOTES.E5], dur: 0.15 },
    { notes: [], dur: 0.05 },
    { notes: [NOTES.C3, NOTES.C4, NOTES.G4, NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6], dur: 1.5 },
];

// Loss Melody (Descending Sad Tone)
const LOSS_SEQUENCE: NoteStep[] = [
    { notes: [NOTES.G4, NOTES.B4], dur: 0.25 },
    { notes: [NOTES.F4, NOTES.A4], dur: 0.25 },
    { notes: [NOTES.E4, NOTES.G4], dur: 0.25 },
    { notes: [NOTES.D4, NOTES.F4], dur: 0.25 },
    { notes: [NOTES.C3, NOTES.E3, NOTES.G3, NOTES.C4], dur: 1.5 }, // Low C Major resolve, but low pitch
];

const getAudioContext = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtx;
}

const playNote = (notes: number[], dur: number, type: OscillatorType = 'square', vol: number = 0.05) => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    notes.forEach(noteFreq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(noteFreq, ctx.currentTime);
        
        // Envelope
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + dur);
    });
}

export const playArcadeIntro = () => {
  stopVictoryMelody();
  stopLossMelody();
  if (isPlayingMelody) return;
  isPlayingMelody = true;
  
  let noteIndex = 0;
  const playNextStep = () => {
    if (!isPlayingMelody) return;
    const { notes, dur } = MELODY_SEQUENCE[noteIndex];
    // Intro uses triangle bass and square melody
    const bassNotes = notes.filter(n => n < NOTES.C4);
    const melodyNotes = notes.filter(n => n >= NOTES.C4);
    
    if (bassNotes.length > 0) playNote(bassNotes, dur, 'triangle', 0.15);
    if (melodyNotes.length > 0) playNote(melodyNotes, dur, 'square', 0.04);

    melodyInterval = window.setTimeout(() => {
      noteIndex = (noteIndex + 1) % MELODY_SEQUENCE.length;
      playNextStep();
    }, dur * 1000);
  };
  playNextStep();
};

export const stopArcadeIntro = () => {
  isPlayingMelody = false;
  if (melodyInterval) {
    clearTimeout(melodyInterval);
    melodyInterval = null;
  }
};

export const playVictoryMelody = () => {
    stopArcadeIntro();
    stopLossMelody();
    if (victoryTimeout) clearTimeout(victoryTimeout);

    let noteIndex = 0;
    const playNextVictoryStep = () => {
        if (noteIndex >= VICTORY_SEQUENCE.length) return;

        const { notes, dur } = VICTORY_SEQUENCE[noteIndex];
        // Victory uses 'sawtooth' for a bright, brassy trumpet sound
        if (notes.length > 0) playNote(notes, dur * 1.5, 'sawtooth', 0.08);

        victoryTimeout = window.setTimeout(() => {
            noteIndex++;
            playNextVictoryStep();
        }, dur * 1000);
    };
    playNextVictoryStep();
};

export const stopVictoryMelody = () => {
    if (victoryTimeout) {
        clearTimeout(victoryTimeout);
        victoryTimeout = null;
    }
}

export const playLossMelody = () => {
    stopArcadeIntro();
    stopVictoryMelody();
    if (lossTimeout) clearTimeout(lossTimeout);

    let noteIndex = 0;
    const playNextLossStep = () => {
        if (noteIndex >= LOSS_SEQUENCE.length) return;

        const { notes, dur } = LOSS_SEQUENCE[noteIndex];
        // Loss uses 'triangle' for a softer, sadder sound
        if (notes.length > 0) playNote(notes, dur * 1.5, 'triangle', 0.1);

        lossTimeout = window.setTimeout(() => {
            noteIndex++;
            playNextLossStep();
        }, dur * 1000);
    };
    playNextLossStep();
};

export const stopLossMelody = () => {
    if (lossTimeout) {
        clearTimeout(lossTimeout);
        lossTimeout = null;
    }
}