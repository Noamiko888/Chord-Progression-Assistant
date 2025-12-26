import React, { useState, useEffect } from 'react';
import { generateProgressions, generateVariation, transposeProgression, generateMelody, searchByMood } from './services/geminiService';
import type { ChordProgression } from './types';
import { ROOT_NOTES, MODES } from './constants';
import Controls from './components/Controls';
import ProgressionCard from './components/ProgressionCard';
import MoodSearch from './components/MoodSearch';
import HistoryPanel from './components/HistoryPanel';
import { LoadingSpinnerIcon, HistoryIcon, SunIcon, MoonIcon } from './components/icons';
import { useTheme } from './hooks/useTheme';

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
    <button onClick={onClick} className={`relative px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${active ? 'text-black bg-[#fbbf24] shadow-[0_0_20px_rgba(251,191,36,0.4)]' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/10'}`}>
        {children}
    </button>
  );

  return (
    <div className="min-h-screen font-sans transition-colors duration-300 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 dark:bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 dark:bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-amber-400/5 dark:bg-amber-400/5 blur-[150px]" />
      </div>

      <div className="container mx-auto max-w-4xl p-4 sm:p-8 relative z-10">
        <header className="flex flex-col items-center justify-center mb-12">
            <div className="w-full flex justify-between items-center mb-16 px-2 sm:px-0">
               {/* Brand / Logo */}
               <div className="flex items-center gap-3">
                 {/* Vector Logo: Guitar Pick with Music Note */}
                 <div className="relative w-10 h-10 flex items-center justify-center filter drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <defs>
                            <linearGradient id="pickGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#fbbf24" />
                                <stop offset="100%" stopColor="#d97706" />
                            </linearGradient>
                        </defs>
                        {/* Guitar Pick Shape */}
                        <path d="M50 95 C 20 65 5 40 5 25 A 45 45 0 0 1 95 25 C 95 40 80 65 50 95 Z" fill="url(#pickGradient)" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-black/90 pb-0.5">
                         {/* Music Note Icon */}
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                             <path fillRule="evenodd" d="M19.957 4.297a.75.75 0 0 0-1.254-.775 24.29 24.29 0 0 0-5.183 2.662c-.37.247-.625.642-.665 1.085l-.364 4.022a10.02 10.02 0 0 0-3.195-1.254 5.98 5.98 0 1 0 1.958 11.53c1.996 0 3.82-1.047 4.86-2.613a7.485 7.485 0 0 0 .848-3.468l.492-5.454a25.792 25.792 0 0 1 2.403-2.91.75.75 0 0 0 0-1.056Z" clipRule="evenodd" />
                         </svg>
                    </div>
                 </div>
                 <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Manolo</span>
               </div>

               {/* Right Side Tools */}
               <div className="flex items-center gap-3">
                    <button onClick={toggleTheme} className="p-2.5 rounded-full bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 backdrop-blur-md border border-white/20 dark:border-white/10 text-slate-600 dark:text-slate-300 transition-all shadow-sm" title="Toggle Theme">
                       {theme === 'dark' ? <SunIcon className="h-5 w-5"/> : <MoonIcon className="h-5 w-5"/>}
                    </button>
                    <button onClick={() => setShowHistory(true)} className="relative p-2.5 rounded-full bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 backdrop-blur-md border border-white/20 dark:border-white/10 text-slate-600 dark:text-slate-300 transition-all shadow-sm" title="Open History">
                        <HistoryIcon className="h-5 w-5"/>
                        {savedProgressions.length > 0 && <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-[#fbbf24] shadow-[0_0_8px_rgba(251,191,36,0.8)]"></span>}
                    </button>
                </div>
            </div>

            {/* Hero Section - Text Only */}
            <div className="flex flex-col items-center mb-8">
                <h1 className="text-5xl sm:text-7xl font-bold text-center tracking-tight text-slate-900 dark:text-white mb-4 drop-shadow-xl">
                    Hello, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fbbf24] to-amber-500">Manolo</span>
                </h1>
            </div>
            
            <p className="text-lg sm:text-xl text-center text-slate-600 dark:text-slate-400 max-w-2xl font-light">
              Your Personal AI Chord Progression Assistant
            </p>
        </header>

        <main className="flex flex-col items-center gap-10">
            <div className="p-1.5 rounded-full bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-inner flex gap-1">
                <TabButton active={viewMode === 'key'} onClick={() => setViewMode('key')}>By Key</TabButton>
                <TabButton active={viewMode === 'mood'} onClick={() => setViewMode('mood')}>By Mood</TabButton>
            </div>

            <div className="w-full transition-all duration-500 ease-out transform">
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
            </div>

          {error && (
            <div className="bg-red-500/10 dark:bg-red-900/20 border border-red-500/20 text-red-600 dark:text-red-300 px-6 py-4 rounded-2xl relative w-full max-w-2xl backdrop-blur-md" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="w-full">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center text-center p-16 rounded-3xl bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-md">
                <div className="relative">
                    <div className="absolute inset-0 bg-[#fbbf24] blur-xl opacity-20 animate-pulse"></div>
                    <LoadingSpinnerIcon className="h-14 w-14 text-[#fbbf24] relative z-10" />
                </div>
                <p className="mt-6 text-xl font-medium text-slate-800 dark:text-white">Manolo is composing...</p>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Analyzing harmonic possibilities just for you.</p>
              </div>
            ) : progressions.length > 0 ? (
              <div className="grid grid-cols-1 gap-8">
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
                <div className="text-center p-16 rounded-3xl bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-md shadow-xl w-full max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Start Creating</h2>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                        {viewMode === 'key' 
                            ? 'Select a key and mode above to let Manolo suggest harmonies.'
                            : 'Tell Manolo a mood to discover evocative chord sequences.'
                        }
                    </p>
                </div>
               )
            )}
          </div>
        </main>
        <footer className="text-center mt-20 mb-8 text-slate-500 dark:text-slate-600 text-sm font-medium">
            <p>Created for musicians and composers by Noam Cohen</p>
        </footer>
      </div>
       <HistoryPanel 
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        savedProgressions={savedProgressions}
        onDelete={handleDeleteFromHistory}
        onLoad={handleLoadFromHistory}
      />
    </div>
  );
};

export default App;