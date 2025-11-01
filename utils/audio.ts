import { type Chord } from "tone";

// A single AudioContext is used for performance.
let audioContext: AudioContext | null = null;

const initAudioContext = () => {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error("Web Audio API is not supported in this browser");
    }
  }
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
};

// Maps note names to a semitone value relative to C.
const NOTE_MAP: { [key: string]: number } = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5,
  'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

// C4 is used as the base MIDI note for calculations.
const C4_MIDI = 60; // Middle C

/**
 * Converts a MIDI note number to its corresponding frequency in Hz.
 * @param midi The MIDI note number.
 * @returns The frequency in Hz.
 */
const midiToFrequency = (midi: number): number => {
  return 440 * Math.pow(2, (midi - 69) / 12);
};

/**
 * Parses a single note string (e.g., "C4", "G#5") to its frequency in Hz.
 * @param note The note string.
 * @returns The frequency in Hz, or null if invalid.
 */
export const parseNoteToFrequency = (note: string): number | null => {
  const match = note.match(/^([A-G][#b]?)(\d)$/);
  if (!match) return null;

  const [, noteName, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);
  const baseSemitone = NOTE_MAP[noteName];

  if (isNaN(baseSemitone) || isNaN(octave)) return null;

  // Calculate MIDI note number (C0 is MIDI note 12)
  // C4 is MIDI 60. C0 is 12. C2 is 36. C3 is 48.
  const midiNote = baseSemitone + (octave * 12) + 12; // Adjusted for C0 = MIDI 12
  return midiToFrequency(midiNote);
};

/**
 * Converts a MIDI note number to its note name (e.g., 'C', 'C#').
 * Used internally and potentially by other modules.
 * @param midi The MIDI note number.
 * @returns The note name string.
 */
export const midiToNoteName = (midi: number): string => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return noteNames[midi % 12];
};

/**
 * Converts a MIDI note number to a full note string (e.g., "C4", "G#5").
 * @param midi The MIDI note number.
 * @returns The full note string with octave.
 */
export const midiToNoteNameWithOctave = (midi: number): string => {
  const noteName = midiToNoteName(midi);
  // C0 is MIDI 12, so an octave is (midi / 12) - 1.
  const octave = Math.floor(midi / 12) - 1;
  return `${noteName}${octave}`;
};


/**
 * Parses a chord string (e.g., "Am", "C#", "Gmaj7") and returns an array of MIDI note numbers.
 * Supports major, minor, and diminished triads, and basic 7th chords.
 * @param chord The chord name string.
 * @returns An array of MIDI note numbers representing the chord.
 */
export const getChordMidiNotes = (chord: string): number[] => {
  const rootMatch = chord.match(/^[A-G][#b]?/);
  if (!rootMatch) return [];

  const rootName = rootMatch[0];
  let quality = chord.substring(rootName.length);

  // Default to major if no quality specified or if it's "maj"
  if (quality === '' || quality.toLowerCase() === 'maj' || quality.toLowerCase() === 'major') {
    quality = 'major';
  } else if (quality.toLowerCase() === 'm' || quality.toLowerCase() === 'min' || quality.toLowerCase() === 'minor') {
    quality = 'minor';
  }

  const rootMidi = C4_MIDI + NOTE_MAP[rootName]; // Assume C4 as base octave for chord root
  if (isNaN(rootMidi)) return [];

  const notes = [rootMidi]; // Start with the root note

  // Determine chord quality and add corresponding intervals
  if (quality === 'minor') {
    notes.push(rootMidi + 3); // Minor third
    notes.push(rootMidi + 7); // Perfect fifth
  } else if (quality.startsWith('dim') || quality.startsWith('°')) { // Diminished
    notes.push(rootMidi + 3); // Minor third
    notes.push(rootMidi + 6); // Diminished fifth
  } else { // Major (default)
    notes.push(rootMidi + 4); // Major third
    notes.push(rootMidi + 7); // Perfect fifth
  }

  // Add a 7th note if specified
  if (chord.includes('7')) { // Use original chord string for 7th detection
    if (chord.includes('maj7')) {
      notes.push(rootMidi + 11); // Major seventh
    } else if (chord.includes('m7')) {
      notes.push(rootMidi + 10); // Minor seventh
    }
    else {
      notes.push(rootMidi + 10); // Dominant seventh (default 7th)
    }
  }

  return notes;
};

/**
 * Plays a single note with a basic synth sound.
 */
const createBasicSynthNote = (
  audioCtx: AudioContext,
  frequency: number,
  now: number,
  destinationNode: AudioNode,
  duration: number,
) => {
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.type = 'triangle'; // Basic synth wave
  osc.frequency.setValueAtTime(frequency, now);

  // Simple ADSR envelope based on duration, with tighter values for percussive sound
  const attackTime = 0.005; // Very fast attack
  const releaseTime = Math.min(0.05, duration * 0.3); // Max 50ms, or 30% of duration
  const endOfAttack = now + attackTime;
  const endOfRelease = endOfAttack + releaseTime;
  const stopTimeOscillator = now + duration + 0.01; // Slightly after target duration for cleanup

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.7, endOfAttack); // Attack to 70% volume
  gainNode.gain.linearRampToValueAtTime(0, endOfRelease); // Release to 0

  osc.connect(gainNode);
  gainNode.connect(destinationNode);

  osc.start(now);
  osc.stop(stopTimeOscillator);
};

/**
 * Plays a single note with a piano-like sound, using multiple oscillators and a low-pass filter.
 */
const createPianoNote = (
  audioCtx: AudioContext,
  frequency: number,
  now: number,
  destinationNode: AudioNode,
  duration: number,
) => {
  // Per-note gain node for a controlled envelope
  const noteGain = audioCtx.createGain();
  
  // Low-pass filter for a mellower piano tone
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(4000, now); // Cutoff frequency
  filter.Q.setValueAtTime(0.8, now); // Resonance
  
  noteGain.connect(filter);
  filter.connect(destinationNode);

  // Piano-like envelope (fast attack, quick decay, short sustain, release)
  const attackTime = 0.005; // Very fast attack
  const decayTime = Math.min(0.08, duration * 0.2); // Decay for max 80ms, or 20% of duration
  const sustainLevel = 0.2; // Lower sustain level
  const releaseTime = Math.min(0.1, duration * 0.3); // Release for max 100ms, or 30% of duration

  const endOfAttack = now + attackTime;
  const endOfDecay = endOfAttack + decayTime;
  const endOfRelease = endOfDecay + releaseTime;
  const stopTimeOscillator = now + duration + 0.01; // Ensure sound fully decays

  noteGain.gain.setValueAtTime(0, now);
  noteGain.gain.linearRampToValueAtTime(1, endOfAttack); // Attack
  noteGain.gain.exponentialRampToValueAtTime(sustainLevel, endOfDecay); // Decay
  noteGain.gain.linearRampToValueAtTime(0.001, endOfRelease); // Release to near silent
  // noteGain.gain.setValueAtTime(0, stopTimeOscillator); // Ensure it's off (safety, but ramp should handle it)

  // Fundamental (sine)
  const osc1 = audioCtx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(frequency, now);
  osc1.connect(noteGain);
  osc1.start(now);
  osc1.stop(stopTimeOscillator);

  // Octave higher, slightly detuned (sawtooth)
  const osc2 = audioCtx.createOscillator();
  osc2.type = 'sawtooth';
  osc2.frequency.setValueAtTime(frequency * 2 + 0.5, now); // Octave + slight detune
  const gain2 = audioCtx.createGain();
  gain2.gain.setValueAtTime(0.4, now); // Lower volume for harmonic
  osc2.connect(gain2);
  gain2.connect(noteGain);
  osc2.start(now);
  osc2.stop(stopTimeOscillator);

  // Fifth higher, more detuned (square)
  const osc3 = audioCtx.createOscillator();
  osc3.type = 'square';
  osc3.frequency.setValueAtTime(frequency * 1.5 - 0.5, now); // Fifth + slight detune
  const gain3 = audioCtx.createGain();
  gain3.gain.setValueAtTime(0.2, now); // Even lower volume
  osc3.connect(gain3);
  gain3.connect(noteGain);
  osc3.start(now);
  osc3.stop(stopTimeOscillator);
};

/**
 * Plays a chord through the Web Audio API with a specified instrument sound.
 * @param chord The chord name string to play.
 * @param instrumentType The type of instrument sound to use ('synth' or 'piano').
 * @param duration The duration of each note in the chord.
 */
export const playChord = (chord: string, instrumentType: 'synth' | 'piano' = 'piano', duration: number = 0.5) => {
  const ctx = initAudioContext();
  if (!ctx) return;

  const notes = getChordMidiNotes(chord);
  if (notes.length === 0) return;

  const now = ctx.currentTime;
  const masterGainNode = ctx.createGain();
  // Adjust overall volume based on number of notes to prevent clipping
  masterGainNode.gain.setValueAtTime(0.3 / notes.length, now); // Slightly higher base volume
  masterGainNode.connect(ctx.destination);

  notes.forEach(midiNote => {
    const baseFreq = midiToFrequency(midiNote);
    if (instrumentType === 'piano') {
      createPianoNote(ctx, baseFreq, now, masterGainNode, duration);
    } else { // 'synth'
      createBasicSynthNote(ctx, baseFreq, now, masterGainNode, duration);
    }
  });
};

/**
 * Plays a single note through the Web Audio API with a specified instrument sound.
 * @param note The note string (e.g., "C4", "G#5") to play.
 * @param instrumentType The type of instrument sound to use ('synth' or 'piano').
 * @param duration The duration of the note.
 */
export const playSingleNote = (
  note: string,
  instrumentType: 'synth' | 'piano' = 'piano',
  duration: number = 0.5
) => {
  const ctx = initAudioContext();
  if (!ctx) return;
  const frequency = parseNoteToFrequency(note);
  if (frequency === null) {
    console.warn(`Could not parse note: ${note}`);
    return;
  }
  const now = ctx.currentTime;
  const masterGainNode = ctx.createGain();
  masterGainNode.gain.setValueAtTime(0.25, now); // Adjusted volume for single notes
  masterGainNode.connect(ctx.destination);

  if (instrumentType === 'piano') {
    createPianoNote(ctx, frequency, now, masterGainNode, duration);
  } else { // 'synth'
    createBasicSynthNote(ctx, frequency, now, masterGainNode, duration);
  }
};


/**
 * Plays a metronome click sound.
 * @param isAccent If true, plays a higher-pitched click for the first beat of a measure.
 */
export const playMetronomeClick = (isAccent: boolean) => {
  const ctx = initAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const envelope = ctx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(isAccent ? 1200 : 800, now);
  
  envelope.gain.setValueAtTime(0, now);
  envelope.gain.linearRampToValueAtTime(0.5, now + 0.01);
  envelope.gain.linearRampToValueAtTime(0, now + 0.1);
  
  osc.connect(envelope);
  envelope.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.1);
};