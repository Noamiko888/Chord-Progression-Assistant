import React from 'react';
import { getChordMidiNotes } from '../utils/audio';
import { ROOT_NOTES } from '../constants';

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

const midiToNoteName = (midi: number): string => {
  return ROOT_NOTES[midi % 12];
};

export const PianoChordDiagram: React.FC<PianoChordDiagramProps> = ({ chordName }) => {
  const midiNotes = getChordMidiNotes(chordName);

  if (midiNotes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700/50 rounded-md p-2">
        Diagram not available
      </div>
    );
  }

  const startMidiNote = 48; // Start drawing from C3
  const numOctaves = 2;
  const numKeysToRender = numOctaves * 12;
  const width = numOctaves * 7 * WHITE_KEY_WIDTH;

  const whiteKeys = [];
  const blackKeys = [];
  const noteLabels = [];

  for (let i = 0; i < numKeysToRender; i++) {
    const midiNote = startMidiNote + i;
    const isHighlighted = midiNotes.includes(midiNote);
    const noteInOctave = midiNote % 12;
    const keyInfo = KEY_MAP[noteInOctave];
    
    const octave = Math.floor(midiNote / 12);
    const startOctave = Math.floor(startMidiNote / 12);
    const relativeOctave = octave - startOctave;
    
    const octaveOffset = relativeOctave * 7 * WHITE_KEY_WIDTH;
    
    if (keyInfo.type === 'white') {
        const x = octaveOffset + keyInfo.xOffset * WHITE_KEY_WIDTH;
        whiteKeys.push(
            <rect
            key={`midi-white-${midiNote}`}
            x={x}
            y={0}
            width={WHITE_KEY_WIDTH}
            height={WHITE_KEY_HEIGHT}
            className={`stroke-slate-400 dark:stroke-slate-500 stroke-[0.5] ${isHighlighted ? 'fill-sky-500 dark:fill-sky-500' : 'fill-white dark:fill-slate-300'}`}
            />
        );
        if (isHighlighted) {
            noteLabels.push(
            <text
                key={`label-${midiNote}`}
                x={x + WHITE_KEY_WIDTH / 2}
                y={WHITE_KEY_HEIGHT - 6}
                className="text-[6px] font-bold fill-white dark:fill-white pointer-events-none"
                textAnchor="middle"
            >
                {midiToNoteName(midiNote)}
            </text>
            );
        }
    } else { // black key
        const x = octaveOffset + keyInfo.xOffset * WHITE_KEY_WIDTH;
        blackKeys.push(
            <rect
            key={`midi-black-${midiNote}`}
            x={x}
            y={0}
            width={BLACK_KEY_WIDTH}
            height={BLACK_KEY_HEIGHT}
            className={`stroke-slate-500 dark:stroke-slate-900 stroke-[0.5] ${isHighlighted ? 'fill-sky-500 dark:fill-sky-600' : 'fill-slate-800 dark:fill-slate-900'}`}
            />
        );
        if (isHighlighted) {
            noteLabels.push(
            <text
                key={`label-${midiNote}`}
                x={x + BLACK_KEY_WIDTH / 2}
                y={BLACK_KEY_HEIGHT - 5}
                className="text-[5px] font-bold fill-white dark:fill-white pointer-events-none"
                textAnchor="middle"
            >
                {midiToNoteName(midiNote)}
            </text>
            );
        }
    }
  }

  return (
    <svg viewBox={`0 0 ${width} ${WHITE_KEY_HEIGHT}`} className="w-full max-w-[120px] h-auto mx-auto">
      {whiteKeys}
      {blackKeys}
      {noteLabels}
    </svg>
  );
};