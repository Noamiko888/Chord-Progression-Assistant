
import React, { useState, useEffect } from 'react';
import { generateProgressions, generateVariation, transposeProgression, generateMelody, searchByMood } from './services/geminiService';
import type { ChordProgression } from './types';
import { ROOT_NOTES, MODES } from './constants';
import Controls from './components/Controls';
import ProgressionCard from './components/ProgressionCard';
import MoodSearch from './components/MoodSearch';
import HistoryPanel from './components/HistoryPanel';
import { LoadingSpinnerIcon, HistoryIcon, SunIcon, MoonIcon, TunerIcon } from './components/icons';
import { useTheme } from './hooks/useTheme';
import Tuner from './components/Tuner';

type ViewMode = 'key' | 'mood';

const App: React.FC = () => {
  const [rootNote, setRootNote] = useState<string>(ROOT_NOTES[0]);
  const [mode, setMode] = useState<string>(MODES[0]);
  const [progressions, setProgressions] = useState<ChordProgression[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('key');
  
  const [savedProgressions, setSavedProgressions] = useState<ChordProgression[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);

  // Global playback settings
  const [globalTempo, setGlobalTempo] = useState(120);
  const [instrumentType, setInstrumentType] = useState<'synth' | 'piano'>('piano');
  
  const [theme, toggleTheme] = useTheme();
  const [isTunerOpen, setIsTunerOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('chordAppHistory');
      if (saved) {
        setSavedProgressions(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load history from localStorage", e);
    }
  }, []);
  
  const handleTogglePlay = (id: string) => {
    setCurrentlyPlayingId(prevId => (prevId === id ? null : id));
  };


  const updateSavedProgressions = (newSaved: ChordProgression[]) => {
    setSavedProgressions(newSaved);
    try {
      localStorage.setItem('chordAppHistory', JSON.stringify(newSaved));
    } catch (e) {
      console.error("Failed to save history to localStorage", e);
    }
  };

  const handleApiCall = async (apiFunc: () => Promise<any>, successCallback: (result: any) => void) => {
    setIsLoading(true);
    setError(null);
    setProgressions([]);
    setCurrentlyPlayingId(null); // Stop playback on new generation
    try {
      const results = await apiFunc();
      successCallback(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateProgressions = () => {
    handleApiCall(
      () => generateProgressions(rootNote, mode),
      (results) => {
        const newProgressions = results.map((p: Omit<ChordProgression, 'id'>) => ({
          ...p,
          id: crypto.randomUUID(),
          key: `${rootNote} ${mode}`
        }));
        setProgressions(newProgressions);
      }
    );
  };

  const handleMoodSearch = (moodQuery: string) => {
    handleApiCall(
        () => searchByMood(moodQuery),
        (results) => {
            const newProgressions = results.map((p: Omit<ChordProgression, 'id'>) => ({
                ...p,
                id: crypto.randomUUID(),
            }));
            setProgressions(newProgressions);
        }
    );
  };
  
  const handleCardAction = async (id: string, action: () => Promise<any>, updateLogic: (prog: ChordProgression, result: any) => ChordProgression) => {
    setProcessingId(id);
    setError(null);
    const originalProgression = progressions.find(p => p.id === id);
    if (!originalProgression) return;

    try {
      const result = await action();
      setProgressions(prev => prev.map(p => 
        p.id === id ? updateLogic(p, result) : p
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleGenerateVariation = (id: string) => {
    const originalProgression = progressions.find(p => p.id === id);
    if (!originalProgression) return;
    handleCardAction(
        id,
        () => generateVariation(originalProgression),
        (p, variation) => ({ ...variation, id: p.id, key: p.key })
    );
  };

  const handleTranspose = (id: string, newKey: string) => {
    const originalProgression = progressions.find(p => p.id === id);
    if (!originalProgression) return;
    handleCardAction(
        id,
        () => transposeProgression(originalProgression, newKey),
        (p, { chords, romanNumerals }) => ({ ...p, key: newKey, chords, romanNumerals })
    );
  };
  
  const handleGenerateMelody = (id: string, style: string) => {
    const originalProgression = progressions.find(p => p.id === id);
    if (!originalProgression) return;
    handleCardAction(
        id,
        () => generateMelody(originalProgression, style),
        (p, melodyResult) => ({ ...p, melody: { ...melodyResult, style }})
    );
  };

  const handleSaveProgression = (id: string) => {
    const progressionToSave = progressions.find(p => p.id === id);
    if (!progressionToSave) return;
    
    const isAlreadySaved = savedProgressions.some(p => p.id === id);
    let newSaved;
    if (isAlreadySaved) {
      newSaved = savedProgressions.filter(p => p.id !== id);
    } else {
      newSaved = [...savedProgressions, { ...progressionToSave, savedAt: Date.now() }];
    }
    updateSavedProgressions(newSaved);
  };

  const handleDeleteFromHistory = (id: string) => {
    updateSavedProgressions(savedProgressions.filter(p => p.id !== id));
  };

  const handleLoadFromHistory = (progression: ChordProgression) => {
    setProgressions([progression]);
    setShowHistory(false);
    setError(null);
    setCurrentlyPlayingId(null);
  };

  const TabButton: React.FC<{active: boolean, onClick: () => void, children: React.ReactNode}> = ({ active, onClick, children }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${active ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'}`}>
        {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans p-4 sm:p-8 transition-colors duration-300">
      <div className="container mx-auto max-w-4xl">
        <header className="text-center mb-8">
            <div className="flex justify-center items-center gap-4 mb-4">
                 <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600 dark:from-sky-400 dark:to-blue-500">
                    AI Chord Progression Assistant
                </h1>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsTunerOpen(true)} className="relative p-2 rounded-full text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition-colors" title="Open Tuner">
                        <TunerIcon className="h-6 w-6"/>
                    </button>
                    <button onClick={toggleTheme} className="relative p-2 rounded-full text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition-colors" title="Toggle Theme">
                       {theme === 'dark' ? <SunIcon className="h-6 w-6"/> : <MoonIcon className="h-6 w-6"/>}
                    </button>
                    <button onClick={() => setShowHistory(true)} className="relative p-2 rounded-full text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition-colors" title="Open History">
                        <HistoryIcon className="h-7 w-7"/>
                        {savedProgressions.length > 0 && <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-sky-500 ring-2 ring-slate-100 dark:ring-slate-900"></span>}
                    </button>
                </div>
            </div>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Spark your creativity. Generate unique and inspiring chord progressions for your next masterpiece.
          </p>
        </header>

        <main className="flex flex-col items-center gap-8">
            <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-lg flex gap-2">
                <TabButton active={viewMode === 'key'} onClick={() => setViewMode('key')}>Generate by Key</TabButton>
                <TabButton active={viewMode === 'mood'} onClick={() => setViewMode('mood')}>Search by Mood</TabButton>
            </div>

            {viewMode === 'key' ? (
                <Controls 
                    rootNote={rootNote}
                    setRootNote={setRootNote}
                    mode={mode}
                    setMode={setMode}
                    onGenerate={handleGenerateProgressions}
                    isLoading={isLoading}
                />
            ) : (
                <MoodSearch onSearch={handleMoodSearch} isLoading={isLoading} />
            )}


          {error && (
            <div className="bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative w-full max-w-2xl" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="w-full">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl">
                <LoadingSpinnerIcon className="h-12 w-12 text-sky-500" />
                <p className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-300">Crafting your progressions...</p>
                <p className="text-slate-500 dark:text-slate-400">This might take a moment.</p>
              </div>
            ) : progressions.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {progressions.map(p => (
                  <ProgressionCard 
                    key={p.id} 
                    progression={p}
                    onGenerateVariation={handleGenerateVariation}
                    onTranspose={handleTranspose}
                    onGenerateMelody={handleGenerateMelody}
                    onSave={handleSaveProgression}
                    isProcessing={processingId === p.id}
                    isSaved={savedProgressions.some(sp => sp.id === p.id)}
                    isPlaying={currentlyPlayingId === p.id}
                    onTogglePlay={handleTogglePlay}
                    globalTempo={globalTempo}
                    setGlobalTempo={setGlobalTempo}
                    instrumentType={instrumentType}
                    setInstrumentType={setInstrumentType}
                  />
                ))}
              </div>
            ) : (
               !error && (
                <div className="text-center p-12 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Ready to Compose?</h2>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                        {viewMode === 'key' 
                            ? 'Select a root note and mode, then click "Generate Progressions".'
                            : 'Enter a mood like "happy" or "dramatic" to find matching progressions.'
                        }
                    </p>
                </div>
               )
            )}
          </div>
        </main>
        <footer className="text-center mt-12 text-slate-500 dark:text-slate-500 text-sm">
            <p>Powered by Gemini. Built for musicians and songwriters by Noam Cohen.</p>
        </footer>
      </div>
       <HistoryPanel 
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        savedProgressions={savedProgressions}
        onDelete={handleDeleteFromHistory}
        onLoad={handleLoadFromHistory}
      />
      <Tuner isOpen={isTunerOpen} onClose={() => setIsTunerOpen(false)} />
    </div>
  );
};

export default App;