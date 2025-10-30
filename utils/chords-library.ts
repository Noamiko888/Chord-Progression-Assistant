// Represents the fingering for a guitar chord.
export interface GuitarChordPosition {
  frets: (number | 'x')[]; // 'x' for muted, number for fret (0=open)
  // FIX: Allow 'x' for muted strings in the fingers array to match usage in the library.
  fingers: (number | 'o' | 'x')[]; // 'o' for open, 'x' for muted, number for finger (1-4)
}

// A dictionary of common guitar chords.
// Key: Root note (e.g., 'C', 'F#').
// Value: A dictionary of chord qualities (e.g., 'major', 'minor').
// Frets are listed from low E (6th string) to high e (1st string).
export const GUITAR_CHORD_LIBRARY: { [root: string]: { [quality: string]: GuitarChordPosition } } = {
  'A': {
    'major': { frets: ['x', 0, 2, 2, 2, 0], fingers: ['x', 'o', 2, 3, 4, 'o'] },
    'minor': { frets: ['x', 0, 2, 2, 1, 0], fingers: ['x', 'o', 2, 3, 1, 'o'] },
    '7': { frets: ['x', 0, 2, 0, 2, 0], fingers: ['x', 'o', 2, 'o', 3, 'o'] },
    'maj7': { frets: ['x', 0, 2, 1, 2, 0], fingers: ['x', 'o', 2, 1, 3, 'o'] },
    'm7': { frets: ['x', 0, 2, 0, 1, 0], fingers: ['x', 'o', 2, 'o', 1, 'o'] },
  },
  'A#': {
    'major': { frets: ['x', 1, 3, 3, 3, 1], fingers: ['x', 1, 3, 4, 4, 1] },
    'minor': { frets: ['x', 1, 3, 3, 2, 1], fingers: ['x', 1, 3, 4, 2, 1] },
  },
   'Bb': {
    'major': { frets: ['x', 1, 3, 3, 3, 1], fingers: ['x', 1, 3, 4, 4, 1] },
    'minor': { frets: ['x', 1, 3, 3, 2, 1], fingers: ['x', 1, 3, 4, 2, 1] },
  },
  'B': {
    'major': { frets: ['x', 2, 4, 4, 4, 2], fingers: ['x', 1, 3, 4, 4, 1] },
    'minor': { frets: ['x', 2, 4, 4, 3, 2], fingers: ['x', 1, 3, 4, 2, 1] },
  },
  'C': {
    'major': { frets: ['x', 3, 2, 0, 1, 0], fingers: ['x', 3, 2, 'o', 1, 'o'] },
    'minor': { frets: ['x', 3, 5, 5, 4, 3], fingers: ['x', 1, 3, 4, 2, 1] },
    '7': { frets: ['x', 3, 2, 3, 1, 0], fingers: ['x', 3, 2, 4, 1, 'o'] },
    'maj7': { frets: ['x', 3, 2, 0, 0, 0], fingers: ['x', 3, 2, 'o', 'o', 'o'] },
    'm7': { frets: ['x', 3, 5, 3, 4, 3], fingers: ['x', 1, 3, 1, 2, 1] },
  },
  'C#': {
    'major': { frets: ['x', 4, 6, 6, 6, 4], fingers: ['x', 1, 3, 4, 4, 1] },
    'minor': { frets: ['x', 4, 6, 6, 5, 4], fingers: ['x', 1, 3, 4, 2, 1] },
  },
  'Db': {
    'major': { frets: ['x', 4, 6, 6, 6, 4], fingers: ['x', 1, 3, 4, 4, 1] },
    'minor': { frets: ['x', 4, 6, 6, 5, 4], fingers: ['x', 1, 3, 4, 2, 1] },
  },
  'D': {
    'major': { frets: ['x', 'x', 0, 2, 3, 2], fingers: ['x', 'x', 'o', 1, 3, 2] },
    'minor': { frets: ['x', 'x', 0, 2, 3, 1], fingers: ['x', 'x', 'o', 2, 3, 1] },
    '7': { frets: ['x', 'x', 0, 2, 1, 2], fingers: ['x', 'x', 'o', 2, 1, 3] },
    'maj7': { frets: ['x', 'x', 0, 2, 2, 2], fingers: ['x', 'x', 'o', 1, 2, 3] },
    'm7': { frets: ['x', 'x', 0, 2, 1, 1], fingers: ['x', 'x', 'o', 2, 1, 1] },
  },
  'D#': {
    'major': { frets: ['x', 6, 8, 8, 8, 6], fingers: ['x', 1, 3, 4, 4, 1] },
    'minor': { frets: ['x', 6, 8, 8, 7, 6], fingers: ['x', 1, 3, 4, 2, 1] },
  },
  'Eb': {
    'major': { frets: ['x', 6, 8, 8, 8, 6], fingers: ['x', 1, 3, 4, 4, 1] },
    'minor': { frets: ['x', 6, 8, 8, 7, 6], fingers: ['x', 1, 3, 4, 2, 1] },
  },
  'E': {
    'major': { frets: [0, 2, 2, 1, 0, 0], fingers: ['o', 2, 3, 1, 'o', 'o'] },
    'minor': { frets: [0, 2, 2, 0, 0, 0], fingers: ['o', 2, 3, 'o', 'o', 'o'] },
    '7': { frets: [0, 2, 0, 1, 0, 0], fingers: ['o', 2, 'o', 1, 'o', 'o'] },
    'maj7': { frets: [0, 2, 1, 1, 0, 0], fingers: ['o', 2, 1, 1, 'o', 'o'] },
    'm7': { frets: [0, 2, 0, 0, 0, 0], fingers: ['o', 2, 'o', 'o', 'o', 'o'] },
  },
  'F': {
    'major': { frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1] },
    'minor': { frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1] },
  },
  'F#': {
    'major': { frets: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1] },
    'minor': { frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1] },
  },
  'Gb': {
    'major': { frets: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1] },
    'minor': { frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1] },
  },
  'G': {
    'major': { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 'o', 'o', 'o', 3] },
    'minor': { frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1] },
    '7': { frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 'o', 'o', 'o', 1] },
    'maj7': { frets: [3, 2, 0, 0, 0, 2], fingers: [2, 1, 'o', 'o', 'o', 3] },
    'm7': { frets: [3, 5, 3, 3, 3, 3], fingers: [1, 3, 1, 1, 1, 1] },
  },
  'G#': {
    'major': { frets: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1] },
    'minor': { frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1] },
  },
  'Ab': {
    'major': { frets: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1] },
    'minor': { frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1] },
  },
};
