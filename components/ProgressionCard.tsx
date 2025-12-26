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
        className={`p-2.5 rounded-xl transition-all duration-200 border ${active ? 'bg-[#fbbf24] border-[#fbbf24] text-black shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'bg-transparent border-slate-300 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-white/10 hover:text-slate-700 dark:hover:text-white'}`}
      >
        {children}
      </button>
  );

  return (
    <div className={`group relative bg-white/40 dark:bg-black/40 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col gap-8 border border-white/50 dark:border-white/10 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${isPlaying ? 'ring-1 ring-[#fbbf24]/50' : ''}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{progression.key}</h3>
            {isPlaying && (
                <div className="flex gap-1 h-3 items-end">
                    <div className="w-1 bg-[#fbbf24] animate-[pulse_1s_ease-in-out_infinite] h-full"></div>
                    <div className="w-1 bg-[#fbbf24] animate-[pulse_1.2s_ease-in-out_infinite] h-2/3"></div>
                    <div className="w-1 bg-[#fbbf24] animate-[pulse_0.8s_ease-in-out_infinite] h-3/4"></div>
                </div>
            )}
          </div>
          <span className="inline-block mt-2 text-sm font-semibold tracking-wide uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#fbbf24] to-amber-600">{progression.mood}</span>
        </div>
        
        <div className="flex gap-2 relative" ref={popoverRef}>
           <button
            onClick={() => onSave(progression.id)}
            disabled={isProcessing}
            className={`p-3 rounded-full transition-all border ${isSaved ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]' : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-white/10'}`}
            title={isSaved ? "Remove from History" : "Save to History"}
          >
            <BookmarkIcon className="h-5 w-5" solid={isSaved} />
          </button>
           <button
            onClick={() => { setShowTranspose(false); setShowMelody(!showMelody); }}
            disabled={isProcessing}
            className="p-3 bg-transparent hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all disabled:opacity-50"
            title="Generate Melody"
          >
            <MusicNoteIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onGenerateVariation(progression.id)}
            disabled={isProcessing}
            className="p-3 bg-transparent hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all disabled:opacity-50 disabled:cursor-wait"
            title="Generate Variation"
          >
            {isProcessing ? <LoadingSpinnerIcon className="h-5 w-5" /> : <SparklesIcon className="h-5 w-5" />}
          </button>
          <button
            onClick={() => { setShowMelody(false); setShowTranspose(!showTranspose); }}
            disabled={isProcessing}
            className="p-3 bg-transparent hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all disabled:opacity-50"
            title="Transpose Key"
          >
            <MusicKeyIcon className="h-5 w-5" />
          </button>
          
          {/* Popovers */}
          {showTranspose && (
            <div className="absolute top-full right-0 mt-3 bg-white dark:bg-[#0f172a] p-4 rounded-2xl shadow-2xl z-20 w-64 border border-slate-100 dark:border-white/10 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
              <p className="text-xs font-bold uppercase tracking-wider mb-3 text-slate-500 dark:text-slate-400">Transpose to</p>
              <div className="flex gap-2 mb-3">
                <select value={transposeRoot} onChange={e => setTransposeRoot(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl text-sm p-2 focus:ring-2 focus:ring-[#fbbf24] outline-none">
                  {ROOT_NOTES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <select value={transposeMode} onChange={e => setTransposeMode(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl text-sm p-2 focus:ring-2 focus:ring-[#fbbf24] outline-none">
                  {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <button onClick={handleTransposeClick} className="w-full bg-[#fbbf24] hover:bg-[#fcd34d] text-black text-sm font-bold py-2 px-3 rounded-xl transition-colors shadow-lg shadow-amber-500/20">
                Apply
              </button>
            </div>
          )}

          {showMelody && (
             <div className="absolute top-full right-0 mt-3 bg-white dark:bg-[#0f172a] p-4 rounded-2xl shadow-2xl z-20 w-64 border border-slate-100 dark:border-white/10 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
              <p className="text-xs font-bold uppercase tracking-wider mb-3 text-slate-500 dark:text-slate-400">Melody Style</p>
              <div className="flex gap-2 mb-3">
                <select value={melodyStyle} onChange={e => setMelodyStyle(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl text-sm p-2 focus:ring-2 focus:ring-[#fbbf24] outline-none">
                  {MELODY_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button onClick={handleGenerateMelody} className="w-full bg-[#fbbf24] hover:bg-[#fcd34d] text-black text-sm font-bold py-2 px-3 rounded-xl transition-colors shadow-lg shadow-amber-500/20">
                Generate
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chord Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center py-2">
        {progression.chords.map((chord, index) => {
          const chordColors = getChordColor(chord);
          const isHighlighted = highlightedIndex === index;
          return (
            <div key={`${chord}-${index}`} className="flex flex-col items-center gap-4 group/chord">
                 <button
                    onClick={() => playChord(chord, instrumentType)} 
                    className={`
                        w-full aspect-square rounded-[2rem] flex flex-col items-center justify-center
                        transition-all duration-300 ease-out cursor-pointer relative overflow-hidden
                        ${chordColors.button}
                        ${isHighlighted ? `ring-2 ring-[#fbbf24] scale-105 ${chordColors.glow}` : 'hover:scale-[1.02]'}
                    `}
                    aria-label={`Play chord ${chord}`}
                  >
                     <div className={`absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none`} />
                    <div className={`text-3xl sm:text-4xl font-black tracking-tight mb-1 relative z-10 ${chordColors.text} ${isHighlighted ? 'scale-110' : ''} transition-transform`}>{chord}</div>
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400 relative z-10">{progression.romanNumerals[index]}</div>
                </button>
                <div className="w-full h-24 opacity-60 hover:opacity-100 transition-opacity">
                    {visualAid === 'guitar' && <GuitarChordDiagram chordName={chord} />}
                    {visualAid === 'piano' && <PianoChordDiagram chordName={chord} />}
                </div>
            </div>
          );
        })}
      </div>
      
      {/* Controls Bar */}
      <div className="bg-slate-50/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
              <button 
                onClick={() => onTogglePlay(progression.id)} 
                title={isPlaying ? "Stop Progression" : "Play Progression"}
                className={`p-3 rounded-full transition-all shadow-lg active:scale-95 ${isPlaying ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30' : 'bg-[#fbbf24] hover:bg-[#fcd34d] text-black shadow-amber-500/30'}`}
              >
                  {isPlaying ? <StopIcon className="h-6 w-6"/> : <PlayIcon className="h-6 w-6 pl-0.5"/>}
              </button>
              <div className="w-px h-8 bg-slate-300 dark:bg-white/10 mx-1"></div>
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
                  <span className="text-xs font-bold px-1">ARP</span>
              </ToggleButton>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Instrument Toggle */}
             <div className="flex bg-slate-200/50 dark:bg-black/30 p-1 rounded-xl border border-slate-300/50 dark:border-white/5">
                <button onClick={() => setInstrumentType('synth')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${instrumentType === 'synth' ? 'bg-white dark:bg-white/10 text-black dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-500'}`}>Synth</button>
                <button onClick={() => setInstrumentType('piano')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${instrumentType === 'piano' ? 'bg-white dark:bg-white/10 text-black dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-500'}`}>Piano</button>
             </div>

             {/* Visual Aid Toggle */}
             <div className="flex bg-slate-200/50 dark:bg-black/30 p-1 rounded-xl border border-slate-300/50 dark:border-white/5">
                  <button onClick={() => setVisualAid('none')} title="Hide" className={`p-1.5 rounded-lg transition-colors ${visualAid === 'none' ? 'bg-white dark:bg-white/10 text-black dark:text-white shadow-sm' : 'text-slate-500'}`}><EyeOffIcon className="h-4 w-4"/></button>
                  <button onClick={() => setVisualAid('guitar')} title="Guitar" className={`p-1.5 rounded-lg transition-colors ${visualAid === 'guitar' ? 'bg-white dark:bg-white/10 text-black dark:text-white shadow-sm' : 'text-slate-500'}`}><GuitarIcon className="h-4 w-4"/></button>
                  <button onClick={() => setVisualAid('piano')} title="Piano" className={`p-1.5 rounded-lg transition-colors ${visualAid === 'piano' ? 'bg-white dark:bg-white/10 text-black dark:text-white shadow-sm' : 'text-slate-500'}`}><PianoIcon className="h-4 w-4"/></button>
             </div>
          </div>

          <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase text-slate-400">Tempo</span>
              <input 
                type="range" 
                min="40" 
                max="240" 
                value={globalTempo} 
                onChange={e => setGlobalTempo(Number(e.target.value))} 
                className="w-24 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-[#fbbf24]"
              />
              <span className="font-mono text-xs font-bold w-8 text-right text-slate-600 dark:text-slate-300">{globalTempo}</span>
          </div>
      </div>
      
      {/* Tips */}
      <div className="flex items-start gap-3 text-slate-600 dark:text-slate-300 text-sm leading-relaxed bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-500/10">
        <InfoIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p>{progression.tips}</p>
      </div>

      {/* Melody Section */}
      {progression.melody && (
        <div className="mt-2 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2">
                 <div className="h-px flex-grow bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent"></div>
                 <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Melody ({progression.melody.style})</h4>
                 <div className="h-px flex-grow bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent"></div>
            </div>
            
            <div className="bg-white/50 dark:bg-black/20 p-6 rounded-2xl border border-slate-200 dark:border-white/5 text-center flex flex-wrap justify-center gap-x-3 gap-y-2 shadow-inner">
                {progression.melody.notes.map((note, idx) => (
                    <span 
                        key={`melody-note-${idx}`}
                        className={`text-xl sm:text-2xl font-mono transition-all duration-100 ${
                            highlightedMelodyNoteIndex === idx 
                                ? 'text-[#fbbf24] font-bold scale-125 shadow-amber-500/50 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' 
                                : 'text-slate-700 dark:text-slate-400'
                        }`}
                    >
                        {note}
                        {idx < progression.melody.notes.length - 1 && <span className="text-slate-300 dark:text-white/10 mx-2 text-base">•</span>}
                    </span>
                ))}
            </div>
             <div className="flex items-start gap-3 text-slate-600 dark:text-slate-300 text-sm leading-relaxed bg-purple-50/50 dark:bg-purple-900/10 p-4 rounded-2xl border border-purple-100 dark:border-purple-500/10">
                <MusicNoteIcon className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <p>{progression.melody.tips}</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default ProgressionCard;