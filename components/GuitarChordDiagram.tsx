import React from 'react';
import { GUITAR_CHORD_LIBRARY, GuitarChordPosition } from '../utils/chords-library';

interface GuitarChordDiagramProps {
  chordName: string;
}

const parseChordName = (chordName: string): { root: string, quality: string } | null => {
    const rootMatch = chordName.match(/^[A-G][#b]?/);
    if (!rootMatch) return null;

    const root = rootMatch[0];
    let quality = chordName.substring(root.length);
    
    // Normalize quality keys to match the library
    if (quality === '' || quality.toLowerCase() === 'maj' || quality.toLowerCase() === 'major') quality = 'major';
    else if (quality.toLowerCase() === 'm' || quality.toLowerCase() === 'min' || quality.toLowerCase() === 'minor') quality = 'minor';
    else if (quality.toLowerCase() === 'maj7') quality = 'maj7';
    else if (quality.toLowerCase() === 'm7') quality = 'm7';
    else if (quality.toLowerCase() === '7') quality = '7';
    
    return { root, quality };
}

export const GuitarChordDiagram: React.FC<GuitarChordDiagramProps> = ({ chordName }) => {
  const parsed = parseChordName(chordName);
  let chordData: GuitarChordPosition | null = null;
  
  if (parsed && GUITAR_CHORD_LIBRARY[parsed.root] && GUITAR_CHORD_LIBRARY[parsed.root][parsed.quality]) {
    chordData = GUITAR_CHORD_LIBRARY[parsed.root][parsed.quality];
  }

  if (!chordData) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700/50 rounded-md p-2">
        Diagram not available
      </div>
    );
  }

  const { frets, fingers } = chordData;
  const numStrings = 6;
  const numFrets = 4;
  const cellWidth = 12;
  const cellHeight = 15;
  const width = cellWidth * (numStrings -1) + 20;
  const height = cellHeight * numFrets + 20;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[100px] h-auto mx-auto text-slate-800 dark:text-slate-200">
      {/* Strings */}
      {Array.from({ length: numStrings }).map((_, i) => (
        <line
          key={`string-${i}`}
          x1={10 + i * cellWidth} y1={10}
          x2={10 + i * cellWidth} y2={10 + numFrets * cellHeight}
          className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="0.5"
        />
      ))}

      {/* Frets (including nut) */}
      {Array.from({ length: numFrets + 1 }).map((_, i) => (
        <line
          key={`fret-${i}`}
          x1={10} y1={10 + i * cellHeight}
          x2={10 + (numStrings - 1) * cellWidth} y2={10 + i * cellHeight}
          className="stroke-slate-500 dark:stroke-slate-400"
          strokeWidth={i === 0 ? 2 : 0.5}
        />
      ))}

      {/* Finger positions */}
      {frets.map((fret, stringIndex) => {
        if (typeof fret === 'number' && fret > 0) {
          return (
            <circle
              key={`dot-${stringIndex}`}
              cx={10 + stringIndex * cellWidth}
              cy={10 + (fret - 0.5) * cellHeight}
              r="4"
              className="fill-current"
            />
          );
        }
        return null;
      })}
      
       {/* Open/Muted strings */}
      {frets.map((fret, stringIndex) => {
        const x = 10 + stringIndex * cellWidth;
        const y = 6;
        if (fret === 'x') {
          return (
             <text key={`muted-${stringIndex}`} x={x} y={y} fontSize="8" textAnchor="middle" className="fill-current">x</text>
          );
        }
        if (fret === 0) {
           return (
             <circle key={`open-${stringIndex}`} cx={x} cy={y-2} r="2.5" className="stroke-current" strokeWidth="0.5" fill="none" />
           )
        }
        return null;
      })}
    </svg>
  );
};