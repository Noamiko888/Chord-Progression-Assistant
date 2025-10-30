import React from 'react';
import { getChordMidiNotes } from '../utils/audio';

interface PianoChordDiagramProps {
  chordName: string;
}

const WHITE_KEY_WIDTH = 12;
const WHITE_KEY_HEIGHT = 50;
const BLACK_KEY_WIDTH = 7;
const BLACK_KEY_HEIGHT = 30;

// The pattern of white and black keys in an octave
const KEY_MAP = [
  { type: 'white', xOffset: 0 }, // C
  { type: 'black', xOffset: 0.7 }, // C#
  { type: 'white', xOffset: 1 }, // D
  { type: 'black', xOffset: 1.8 }, // D#
  { type: 'white', xOffset: 2 }, // E
  { type: 'white', xOffset: 3 }, // F
  { type: 'black', xOffset: 3.7 }, // F#
  { type: 'white', xOffset: 4 }, // G
  { type: 'black', xOffset: 4.8 }, // G#
  { type: 'white', xOffset: 5 }, // A
  { type: 'black', xOffset: 5.9 }, // A#
  { type: 'white', xOffset: 6 }, // B
];

export const PianoChordDiagram: React.FC<PianoChordDiagramProps> = ({ chordName }) => {
  const midiNotes = getChordMidiNotes(chordName);

  if (midiNotes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700/50 rounded-md p-2">
        Diagram not available
      </div>
    );
  }

  // Determine the range of octaves to display
  const minMidi = Math.min(...midiNotes);
  const startOctave = Math.floor(minMidi / 12) - 3;
  const numOctaves = 2;
  const width = numOctaves * 7 * WHITE_KEY_WIDTH;

  const renderKey = (octave: number, noteIndex: number, isHighlighted: boolean) => {
    const keyInfo = KEY_MAP[noteIndex];
    const octaveOffset = octave * 7 * WHITE_KEY_WIDTH;
    
    if (keyInfo.type === 'white') {
      return (
        <rect
          key={`o${octave}n${noteIndex}`}
          x={octaveOffset + keyInfo.xOffset * WHITE_KEY_WIDTH}
          y={0}
          width={WHITE_KEY_WIDTH}
          height={WHITE_KEY_HEIGHT}
          className={`stroke-slate-400 dark:stroke-slate-500 stroke-[0.5] ${isHighlighted ? 'fill-sky-400 dark:fill-sky-500' : 'fill-white dark:fill-slate-300'}`}
        />
      );
    } else { // black key
      return (
        <rect
          key={`o${octave}n${noteIndex}`}
          x={octaveOffset + keyInfo.xOffset * WHITE_KEY_WIDTH}
          y={0}
          width={BLACK_KEY_WIDTH}
          height={BLACK_KEY_HEIGHT}
          className={`stroke-slate-500 dark:stroke-slate-900 stroke-[0.5] ${isHighlighted ? 'fill-sky-500 dark:fill-sky-600' : 'fill-slate-800 dark:fill-slate-900'}`}
        />
      );
    }
  };

  const whiteKeys = [];
  const blackKeys = [];

  for (let o = 0; o < numOctaves; o++) {
    for (let n = 0; n < 12; n++) {
      const currentMidi = (startOctave + o) * 12 + n;
      const isHighlighted = midiNotes.includes(currentMidi) || midiNotes.includes(currentMidi - 12) || midiNotes.includes(currentMidi + 12);
      const keyElement = renderKey(o, n, isHighlighted);
      if (KEY_MAP[n].type === 'white') {
        whiteKeys.push(keyElement);
      } else {
        blackKeys.push(keyElement);
      }
    }
  }

  return (
    <svg viewBox={`0 0 ${width} ${WHITE_KEY_HEIGHT}`} className="w-full max-w-[120px] h-auto">
      {whiteKeys}
      {blackKeys}
    </svg>
  );
};
