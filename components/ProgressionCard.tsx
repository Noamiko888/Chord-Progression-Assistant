import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { ChordProgression, Melody } from '../types';
import { 
    MusicKeyIcon, SparklesIcon, LoadingSpinnerIcon, InfoIcon, BookmarkIcon, MusicNoteIcon, 
    PlayIcon, StopIcon, LoopIcon, MetronomeIcon, DrumIcon, EyeOffIcon, GuitarIcon, PianoIcon
} from './icons';
import { ROOT_NOTES, MODES, MELODY_STYLES } from '../constants';
import { playChord, playSingleNote, playMetronomeClick, getChordMidiNotes, midiToNoteNameWithOctave } from '../utils/audio';
import { playDrumSound } from '../utils/drums';
import { getChordColor } from '../utils/colors';
import { GuitarChordDiagram } from './GuitarChordDiagram';
import { PianoChordDiagram } from './PianoChordDiagram';


interface ProgressionCardProps {
  progression: ChordProgression;
  onGenerateVariation: (id: string) => void;
  onTranspose: (id: string, newKey: string) => void;
  onGenerateMelody: (id: string, style: string) => void;
  onSave: (id: string) => void;
  isProcessing: boolean;
  isSaved: boolean;
  isPlaying: boolean;
  onTogglePlay: (id: string) => void;
  globalTempo: number; // New prop for global tempo
  setGlobalTempo: (tempo: number) => void; // New prop for setting global tempo
  instrumentType: 'synth' | 'piano'; // New prop for instrument type
  setInstrumentType: (type: 'synth' | 'piano') => void; // New prop for setting instrument type
}

type VisualAid = 'none' | 'guitar' | 'piano';

const ProgressionCard: React.FC<ProgressionCardProps> = ({ 
    progression, onGenerateVariation, onTranspose, onGenerateMelody, onSave, 
    isProcessing, isSaved, isPlaying, onTogglePlay, 
    globalTempo, setGlobalTempo, instrumentType, setInstrumentType
}) => {
  const [showTranspose, setShowTranspose] = useState(false);
  const [showMelody, setShowMelody] = useState(false);
  const [melodyStyle, setMelodyStyle] = useState(MELODY_STYLES[0]);
  const [transposeRoot, setTransposeRoot] = useState(ROOT_NOTES[0]);
  const [transposeMode, setTransposeMode] = useState(MODES[0]);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Playback state
  const [isLooping, setIsLooping] = useState(true);
  const [isMetronomeOn, setIsMetronomeOn] = useState(false);
  const [isDrumsOn, setIsDrumsOn] = useState(false);
  const [isArpeggioChordsOn, setIsArpeggioChordsOn] = useState(false); // New state for arpeggiated chords
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null); // Current chord index
  const [highlightedMelodyNoteIndex, setHighlightedMelodyNoteIndex] = useState<number | null>(null); // Current melody note index
  const [visualAid, setVisualAid] = useState<VisualAid>('none');

  // Playback reference object to keep track of indices and interval ID
  const playbackRef = useRef({ 
      eightNoteTick: 0, // Master tick count for eighth notes
      chordIndex: 0,
      melodyIndex: 0,
      arpeggioNoteIndex: 0, // For arpeggiated chords
      currentChordMidiNotes: [] as number[], // Pre-computed MIDI notes for current chord
      intervalId: null as number | null 
  });


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowTranspose(false);
        setShowMelody(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    // Cleanup playback interval on unmount
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        if (playbackRef.current.intervalId) {
            clearInterval(playbackRef.current.intervalId);
        }
    }
  }, []);

  // Reset melody highlight when melody changes
  useEffect(() => {
    setHighlightedMelodyNoteIndex(null);
  }, [progression.melody]);

  // Pre-compute MIDI notes for chords
  const precomputedChordMidiNotes = useMemo(() => {
    return progression.chords.map(chord => getChordMidiNotes(chord));
  }, [progression.chords]);

  // Main playback logic effect
  useEffect(() => {
    if (isPlaying) {
        // We'll use an eighth-note as the fundamental tick unit
        const eighthNoteDurationMs = (60000 / globalTempo) / 2; // Milliseconds per eighth note
        const eighthNoteDurationSeconds = eighthNoteDurationMs / 1000; // Convert to seconds
        const beatsPerChord = 4; // Assume 4/4 time, one chord per measure = 4 beats = 8 eighth-notes

        const tick = () => {
            const currentEightNoteTick = playbackRef.current.eightNoteTick;
            const currentChordIndex = Math.floor(currentEightNoteTick / beatsPerChord / 2); // 2 eighth notes per beat
            const eightNoteInChordCycle = currentEightNoteTick % (beatsPerChord * 2);

            // --- Chord Playback ---
            if (currentChordIndex !== playbackRef.current.chordIndex) {
                // New chord
                playbackRef.current.chordIndex = currentChordIndex;
                playbackRef.current.arpeggioNoteIndex = 0; // Reset arpeggio index for new chord
                playbackRef.current.currentChordMidiNotes = precomputedChordMidiNotes[currentChordIndex] || [];
                setHighlightedIndex(currentChordIndex);
            }

            if (isArpeggioChordsOn) {
                const midiNotesToArpeggiate = playbackRef.current.currentChordMidiNotes;
                if (midiNotesToArpeggiate.length > 0) {
                    const arpeggioNoteIndex = playbackRef.current.arpeggioNoteIndex;
                    const midiNoteToPlay = midiNotesToArpeggiate[arpeggioNoteIndex % midiNotesToArpeggiate.length];
                    
                    const noteNameForArpeggio = midiToNoteNameWithOctave(midiNoteToPlay); // Correctly convert MIDI to note string with octave
                    playSingleNote(noteNameForArpeggio, instrumentType, eighthNoteDurationSeconds * 0.8); // Play with duration

                    playbackRef.current.arpeggioNoteIndex = (arpeggioNoteIndex + 1) % midiNotesToArpeggiate.length;
                    if (playbackRef.current.arpeggioNoteIndex === 0) {
                        // If we finished arpeggiating the current chord, restart or move to next
                        // For a continuous arpeggio, this might not need a full reset, depends on desired effect
                    }
                }
            } else {
                // Block chord playback (only on the first eight-note of a new chord)
                if (eightNoteInChordCycle === 0) {
                    playChord(progression.chords[currentChordIndex], instrumentType, eighthNoteDurationSeconds * 0.6); // Sustain block chords for 60% of an eighth note
                }
            }

            // --- Melody Playback ---
            if (progression.melody && progression.melody.notes.length > 0) {
                const currentMelodyNoteIndex = playbackRef.current.melodyIndex;
                if (currentMelodyNoteIndex < progression.melody.notes.length) {
                    const melodyNote = progression.melody.notes[currentMelodyNoteIndex];
                    // Introduce slight duration variation for "soul"
                    const melodyNoteDurationSeconds = eighthNoteDurationSeconds * (0.3 + Math.random() * 0.2); 
                    playSingleNote(melodyNote, instrumentType, melodyNoteDurationSeconds);
                    setHighlightedMelodyNoteIndex(currentMelodyNoteIndex);
                    playbackRef.current.melodyIndex++;
                }
            }

            // --- Metronome and Drums ---
            // Play metronome/drums on quarter notes (every 2nd eighth-note tick)
            const isQuarterNote = eightNoteInChordCycle % 2 === 0;
            if (isMetronomeOn && isQuarterNote) {
                playMetronomeClick(eightNoteInChordCycle === 0); // Accent on the first beat of the measure
            }
            if (isDrumsOn && isQuarterNote) {
                playDrumSound(Math.floor(currentEightNoteTick / 2)); // Drums based on quarter notes
            }

            // --- Advance Tick ---
            let nextEightNoteTick = currentEightNoteTick + 1;
            const totalEightNotes = progression.chords.length * beatsPerChord * 2;

            if (nextEightNoteTick >= totalEightNotes) {
                if (isLooping) {
                    playbackRef.current.eightNoteTick = 0;
                    playbackRef.current.melodyIndex = 0; // Reset melody index on loop
                } else {
                    onTogglePlay(progression.id); // Signal parent to stop playback
                }
            } else {
                playbackRef.current.eightNoteTick = nextEightNoteTick;
            }
        };
        
        // Initialize playback state
        playbackRef.current.eightNoteTick = 0;
        playbackRef.current.chordIndex = 0;
        playbackRef.current.melodyIndex = 0;
        playbackRef.current.arpeggioNoteIndex = 0;
        playbackRef.current.currentChordMidiNotes = precomputedChordMidiNotes[0] || [];
        
        // Clear previous interval if any and set a new one
        if (playbackRef.current.intervalId) {
            clearInterval(playbackRef.current.intervalId);
        }
        playbackRef.current.intervalId = window.setInterval(tick, eighthNoteDurationMs);

    } else {
        // Stop playback
        if (playbackRef.current.intervalId) {
            clearInterval(playbackRef.current.intervalId);
            playbackRef.current.intervalId = null;
        }
        playbackRef.current.eightNoteTick = 0;
        playbackRef.current.chordIndex = 0;
        playbackRef.current.melodyIndex = 0;
        playbackRef.current.arpeggioNoteIndex = 0;
        playbackRef.current.currentChordMidiNotes = [];
        setHighlightedIndex(null);
        setHighlightedMelodyNoteIndex(null);
    }
    
    // Effect cleanup
    return () => {
        if (playbackRef.current.intervalId) {
            clearInterval(playbackRef.current.intervalId);
        }
    };
  }, [
      isPlaying, isLooping, isMetronomeOn, isDrumsOn, isArpeggioChordsOn, // New dependency
      globalTempo, progression.chords, progression.melody, onTogglePlay, 
      progression.id, instrumentType, precomputedChordMidiNotes // New dependencies
  ]);

  const handleTransposeClick = () => {
    const newKey = `${transposeRoot} ${transposeMode}`;
    if (newKey !== progression.key) {
      onTranspose(progression.id, newKey);
    }
    setShowTranspose(false);
  };
  
  const handleGenerateMelody = () => {
    onGenerateMelody(progression.id, melodyStyle);
    setShowMelody(false);
  }

  const ToggleButton: React.FC<{active: boolean, onToggle: () => void, children: React.ReactNode, title: string}> = ({ active, onToggle, children, title }) => (
      <button 
        onClick={onToggle}
        title={title}
        className={`p-2 rounded-full transition-colors ${active ? 'bg-sky-500 text-white' : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400/80 dark:hover:bg-slate-500 text-slate-600 dark:text-slate-300'}`}
      >
        {children}
      </button>
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 flex flex-col gap-4 border border-slate-200 dark:border-slate-700 transition-all hover:border-sky-500/50 dark:hover:shadow-sky-500/10">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{progression.key}</h3>
          <span className="bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">{progression.mood}</span>
        </div>
        <div className="flex gap-2 relative" ref={popoverRef}>
           <button
            onClick={() => onSave(progression.id)}
            disabled={isProcessing}
            className={`p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full transition-colors disabled:opacity-50 ${isSaved ? 'text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300' : 'text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white'}`}
            title={isSaved ? "Remove from History" : "Save to History"}
          >
            <BookmarkIcon className="h-5 w-5" solid={isSaved} />
          </button>
           <button
            onClick={() => { setShowTranspose(false); setShowMelody(!showMelody); }}
            disabled={isProcessing}
            className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white transition-colors disabled:opacity-50"
            title="Generate Melody"
          >
            <MusicNoteIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onGenerateVariation(progression.id)}
            disabled={isProcessing}
            className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-wait"
            title="Generate Variation"
          >
            {isProcessing ? <LoadingSpinnerIcon className="h-5 w-5" /> : <SparklesIcon className="h-5 w-5" />}
          </button>
          <button
            onClick={() => { setShowMelody(false); setShowTranspose(!showTranspose); }}
            disabled={isProcessing}
            className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white transition-colors disabled:opacity-50"
            title="Transpose Key"
          >
            <MusicKeyIcon className="h-5 w-5" />
          </button>
          
          {showTranspose && (
            <div className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-700 p-3 rounded-lg shadow-2xl z-10 w-64 border border-slate-200 dark:border-slate-600">
              <p className="text-sm font-semibold mb-2 text-slate-900 dark:text-white">Transpose to:</p>
              <div className="flex gap-2 mb-2">
                <select value={transposeRoot} onChange={e => setTransposeRoot(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-600 text-slate-900 dark:text-white border-slate-300 dark:border-slate-500 rounded-md text-sm focus:ring-sky-500 focus:border-sky-500">
                  {ROOT_NOTES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <select value={transposeMode} onChange={e => setTransposeMode(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-600 text-slate-900 dark:text-white border-slate-300 dark:border-slate-500 rounded-md text-sm focus:ring-sky-500 focus:border-sky-500">
                  {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <button onClick={handleTransposeClick} className="w-full bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold py-1 px-3 rounded-md transition-colors">
                Apply
              </button>
            </div>
          )}

          {showMelody && (
             <div className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-700 p-3 rounded-lg shadow-2xl z-10 w-64 border border-slate-200 dark:border-slate-600">
              <p className="text-sm font-semibold mb-2 text-slate-900 dark:text-white">Melody Style:</p>
              <div className="flex gap-2 mb-2">
                <select value={melodyStyle} onChange={e => setMelodyStyle(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-600 text-slate-900 dark:text-white border-slate-300 dark:border-slate-500 rounded-md text-sm focus:ring-sky-500 focus:border-sky-500">
                  {MELODY_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button onClick={handleGenerateMelody} className="w-full bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold py-1 px-3 rounded-md transition-colors">
                Generate
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        {progression.chords.map((chord, index) => {
          const chordColors = getChordColor(chord);
          const isHighlighted = highlightedIndex === index;
          return (
            <div key={`${chord}-${index}`} className="flex flex-col items-center gap-2">
                 <button
                    onClick={() => playChord(chord, instrumentType)} // Pass instrumentType
                    className={`w-full p-4 rounded-lg text-center focus:outline-none transition-all duration-150 ease-in-out shadow-sm hover:shadow-md hover:scale-[1.03] active:scale-100 cursor-pointer group border ${chordColors.button} ${isHighlighted ? 'ring-2 ring-offset-2 ring-sky-400 ring-offset-white dark:ring-offset-slate-800' : 'focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800'}`}
                    aria-label={`Play chord ${chord}`}
                    title={`Play ${chord} chord`}
                  >
                    <div className={`text-2xl font-bold transition-colors ${chordColors.text}`}>{chord}</div>
                    <div className="text-lg text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">{progression.romanNumerals[index]}</div>
                </button>
                <div className="w-full">
                    {visualAid === 'guitar' && <GuitarChordDiagram chordName={chord} />}
                    {visualAid === 'piano' && <PianoChordDiagram chordName={chord} />}
                </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
              <button 
                onClick={() => onTogglePlay(progression.id)} 
                title={isPlaying ? "Stop Progression" : "Play Progression"}
                className="p-2 bg-sky-600 hover:bg-sky-700 text-white rounded-full transition-transform active:scale-90"
              >
                  {isPlaying ? <StopIcon className="h-6 w-6"/> : <PlayIcon className="h-6 w-6"/>}
              </button>
              <ToggleButton active={isLooping} onToggle={() => setIsLooping(!isLooping)} title="Toggle Loop">
                  <LoopIcon className="h-5 w-5"/>
              </ToggleButton>
               <ToggleButton active={isMetronomeOn} onToggle={() => setIsMetronomeOn(!isMetronomeOn)} title="Toggle Metronome">
                  <MetronomeIcon className="h-5 w-5"/>
              </ToggleButton>
              <ToggleButton active={isDrumsOn} onToggle={() => setIsDrumsOn(!isDrumsOn)} title="Toggle Drums">
                  <DrumIcon className="h-5 w-5"/>
              </ToggleButton>
              <ToggleButton active={isArpeggioChordsOn} onToggle={() => setIsArpeggioChordsOn(!isArpeggioChordsOn)} title="Toggle Arpeggiated Chords">
                  Arpeggio
              </ToggleButton>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Sound:</span>
            <ToggleButton active={instrumentType === 'synth'} onToggle={() => setInstrumentType('synth')} title="Synth Sound">
                Synth
            </ToggleButton>
            <ToggleButton active={instrumentType === 'piano'} onToggle={() => setInstrumentType('piano')} title="Piano Sound">
                Piano
            </ToggleButton>
          </div>
          <div className="flex items-center gap-2">
             <ToggleButton active={visualAid === 'none'} onToggle={() => setVisualAid('none')} title="Hide Visual Aid">
                  <EyeOffIcon className="h-5 w-5"/>
              </ToggleButton>
              <ToggleButton active={visualAid === 'guitar'} onToggle={() => setVisualAid('guitar')} title="Show Guitar Chords">
                  <GuitarIcon className="h-5 w-5"/>
              </ToggleButton>
               <ToggleButton active={visualAid === 'piano'} onToggle={() => setVisualAid('piano')} title="Show Piano Chords">
                  <PianoIcon className="h-5 w-5"/>
              </ToggleButton>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <label htmlFor={`tempo-${progression.id}`} className="font-medium">Tempo</label>
              <input 
                id={`tempo-${progression.id}`}
                type="range" 
                min="40" 
                max="240" 
                value={globalTempo} // Use globalTempo
                onChange={e => setGlobalTempo(Number(e.target.value))} // Set globalTempo
                className="w-24 accent-sky-500"
              />
              <span className="font-mono w-8 text-center">{globalTempo}</span> {/* Display globalTempo */}
              <span>BPM</span>
          </div>
      </div>
      
      <div className="mt-2 bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg flex items-start gap-3">
        <InfoIcon className="h-5 w-5 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
        <p className="text-slate-700 dark:text-slate-300 text-sm">{progression.tips}</p>
      </div>

      {progression.melody && (
        <div className="mt-2 flex flex-col gap-3">
            <h4 className="font-bold text-sky-700 dark:text-sky-300">Generated Melody ({progression.melody.style})</h4>
            <div className="bg-slate-200 dark:bg-slate-900 p-4 rounded-lg text-center font-mono tracking-wider flex flex-wrap justify-center gap-x-2 gap-y-1">
                {progression.melody.notes.map((note, idx) => (
                    <span 
                        key={`melody-note-${idx}`}
                        className={`text-sky-700 dark:text-sky-400 text-lg sm:text-xl transition-colors duration-75 ${
                            highlightedMelodyNoteIndex === idx ? 'font-bold text-sky-900 dark:text-sky-100 scale-105' : ''
                        }`}
                    >
                        {note}
                        {idx < progression.melody.notes.length - 1 && <span className="text-slate-400 dark:text-slate-600 px-1">-</span>}
                    </span>
                ))}
            </div>
             <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg flex items-start gap-3">
                <MusicNoteIcon className="h-5 w-5 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700 dark:text-slate-300 text-sm">{progression.melody.tips}</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default ProgressionCard;