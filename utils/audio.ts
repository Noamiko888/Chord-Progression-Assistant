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
};

// Maps note names to a semitone value relative to C.
const NOTE_MAP: { [key: string]: number } = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5,
  'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

// C4 is used as the base MIDI note for calculations.
const C4_MIDI = 60;

/**
 * Converts a MIDI note number to its corresponding frequency in Hz.
 * @param midi The MIDI note number.
 * @returns The frequency in Hz.
 */
const midiToFrequency = (midi: number): number => {
  return 440 * Math.pow(2, (midi - 69) / 12);
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
  const quality = chord.substring(rootName.length);

  const rootMidi = C4_MIDI + NOTE_MAP[rootName];
  if (isNaN(rootMidi)) return [];

  const notes = [rootMidi]; // Start with the root note

  // Determine chord quality and add corresponding intervals
  if (quality.startsWith('m') && !quality.startsWith('maj')) { // Minor
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
  if (quality.includes('7')) {
    if (quality.includes('maj7')) {
      notes.push(rootMidi + 11); // Major seventh
    } else {
      notes.push(rootMidi + 10); // Dominant seventh
    }
  }

  return notes;
};

/**
 * Plays a chord through the Web Audio API.
 * Creates oscillators for each note in the chord and applies a simple envelope to avoid clicking.
 * @param chord The chord name string to play.
 */
export const playChord = (chord: string) => {
  initAudioContext();
  if (!audioContext) return;

  const notes = getChordMidiNotes(chord);
  if (notes.length === 0) return;

  const now = audioContext.currentTime;
  const attackTime = 0.01;
  const releaseTime = 0.4;
  const duration = attackTime + releaseTime;
  
  // Master gain to control overall volume and prevent clipping
  const masterGain = audioContext.createGain();
  masterGain.gain.setValueAtTime(0.3 / notes.length, now); // Lower volume for more notes
  masterGain.connect(audioContext.destination);

  // Create an oscillator for each note in the chord
  notes.forEach(midiNote => {
    const osc = audioContext!.createOscillator();
    osc.type = 'sine'; // A clean, simple waveform
    osc.frequency.setValueAtTime(midiToFrequency(midiNote), now);
    
    // Use a gain node as an envelope to control note volume over time
    const envelope = audioContext!.createGain();
    osc.connect(envelope);
    envelope.connect(masterGain);
    
    // Simple ADSR-like envelope: quick attack, then fade out
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(1, now + attackTime);
    envelope.gain.linearRampToValueAtTime(0, now + duration);

    osc.start(now);
    osc.stop(now + duration + 0.1); // Schedule oscillator to stop
  });
};

/**
 * Plays a metronome click sound.
 * @param isAccent If true, plays a higher-pitched click for the first beat of a measure.
 */
export const playMetronomeClick = (isAccent: boolean) => {
  initAudioContext();
  if (!audioContext) return;

  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const envelope = audioContext.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(isAccent ? 1200 : 800, now);
  
  envelope.gain.setValueAtTime(0, now);
  envelope.gain.linearRampToValueAtTime(0.5, now + 0.01);
  envelope.gain.linearRampToValueAtTime(0, now + 0.1);
  
  osc.connect(envelope);
  envelope.connect(audioContext.destination);

  osc.start(now);
  osc.stop(now + 0.1);
};
