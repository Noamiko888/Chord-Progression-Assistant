import { useState, useRef, useEffect, useCallback } from 'react';
import { autoCorrelate, frequencyToNoteDetails } from '../utils/tuner';

export interface TunerData {
  noteName: string;
  octave: number;
  frequency: string;
  cents: string;
}

// --- Configuration Constants for Tuner Stability ---
// The number of recent frequency samples to store for analysis.
const FREQUENCY_HISTORY_SIZE = 10; 
// The minimum number of times a note must appear in the history to be considered "stable".
const STABLE_NOTE_THRESHOLD = 5; 
// The delay in milliseconds before the tuner display clears after silence.
const SILENCE_CLEAR_DELAY = 500; 


export const useTuner = () => {
  const [tunerData, setTunerData] = useState<TunerData | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Refs for stability logic
  const frequencyHistoryRef = useRef<number[]>([]);
  const silenceTimeoutRef = useRef<number | null>(null);


  const updatePitch = useCallback(() => {
    if (!analyserNodeRef.current || !audioContextRef.current) {
      return;
    }

    const buffer = new Float32Array(analyserNodeRef.current.fftSize);
    analyserNodeRef.current.getFloatTimeDomainData(buffer);
    const frequency = autoCorrelate(buffer, audioContextRef.current.sampleRate);

    // --- New Stability Logic ---
    if (frequency !== -1) {
      // If a note is detected, cancel any pending timeout to clear the display.
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }

      const history = frequencyHistoryRef.current;
      history.push(frequency);
      if (history.length > FREQUENCY_HISTORY_SIZE) {
        history.shift(); // Keep the history buffer at a fixed size.
      }

      // Analyze the history buffer to find a stable note.
      if (history.length >= STABLE_NOTE_THRESHOLD) {
        const noteNumbers = history.map(f => 12 * (Math.log(f / 440) / Math.log(2)) + 69).map(Math.round);
        
        // Find the most frequent note number (mode) in the history.
        const noteCounts = noteNumbers.reduce((acc, note) => {
          acc[note] = (acc[note] || 0) + 1;
          return acc;
        }, {} as { [key: number]: number });

        let stableNote: number | null = null;
        let maxCount = 0;
        for (const note in noteCounts) {
          if (noteCounts[note] > maxCount) {
            maxCount = noteCounts[note];
            stableNote = parseInt(note, 10);
          }
        }

        // If the most frequent note appears enough times, it's considered stable.
        if (stableNote !== null && maxCount >= STABLE_NOTE_THRESHOLD) {
          // Average the frequencies that correspond to the stable note for a smoother reading.
          const stableFrequencies = history.filter((_f, index) => noteNumbers[index] === stableNote);
          const averageFrequency = stableFrequencies.reduce((sum, f) => sum + f, 0) / stableFrequencies.length;
          
          const noteDetails = frequencyToNoteDetails(averageFrequency);
          setTunerData(noteDetails);
        }
      }
    } else {
      // If no note is detected (silence), start a timer to clear the display.
      if (!silenceTimeoutRef.current) {
        silenceTimeoutRef.current = window.setTimeout(() => {
          setTunerData(null);
          frequencyHistoryRef.current = []; // Clear history on silence.
        }, SILENCE_CLEAR_DELAY);
      }
    }
    // --- End of New Stability Logic ---

    animationFrameRef.current = requestAnimationFrame(updatePitch);
  }, []);

  const startListening = useCallback(async () => {
    if (isListening) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = context;

      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserNodeRef.current = analyser;
      
      frequencyHistoryRef.current = []; // Reset history on start
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);

      setIsListening(true);
      setError(null);
      animationFrameRef.current = requestAnimationFrame(updatePitch);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Microphone access denied. Please allow microphone access in your browser settings.");
      setIsListening(false);
    }
  }, [isListening, updatePitch]);

  const stopListening = useCallback(() => {
    if (!isListening) return;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
    }
    
    analyserNodeRef.current = null;
    frequencyHistoryRef.current = [];
    
    setIsListening(false);
    setTunerData(null);
  }, [isListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return { tunerData, isListening, error, startListening, stopListening };
};