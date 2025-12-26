import React, { useState, useMemo } from 'react';
import type { ChordProgression } from '../types';
import { TrashIcon, XIcon, SearchIcon, BookmarkIcon } from './icons';

interface HistoryPanelProps {
  savedProgressions: ChordProgression[];
  onDelete: (id: string) => void;
  onLoad: (progression: ChordProgression) => void;
  onClose: () => void;
  isOpen: boolean;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ savedProgressions, onDelete, onLoad, onClose, isOpen }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'key-asc'>('date-desc');

  const filteredAndSortedProgressions = useMemo(() => {
    return savedProgressions
      .filter(p =>
        p.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.mood.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.chords.join(' ').toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'date-asc':
            return (a.savedAt || 0) - (b.savedAt || 0);
          case 'key-asc':
            return a.key.localeCompare(b.key);
          case 'date-desc':
          default:
            return (b.savedAt || 0) - (a.savedAt || 0);
        }
      });
  }, [savedProgressions, searchTerm, sortBy]);

  return (
    <>
        {/* Backdrop */}
        <div 
            className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={onClose}
        />
        
        {/* Panel */}
        <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white/90 dark:bg-[#0a0f1e]/90 backdrop-blur-xl shadow-2xl z-50 transform transition-transform duration-300 ease-out border-l border-white/20 dark:border-white/5 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full text-slate-800 dark:text-slate-200">
            <header className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/5">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Library</h2>
            <button 
                onClick={onClose} 
                title="Close Panel"
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
                <XIcon className="h-6 w-6" />
            </button>
            </header>

            <div className="p-6 border-b border-slate-200 dark:border-white/5 space-y-4">
            <div className="relative">
                <input
                type="text"
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white rounded-xl pl-10 pr-4 py-3 border border-slate-200 dark:border-white/5 focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>
            <div className="flex items-center gap-3">
                <label htmlFor="sort-by" className="text-sm font-medium text-slate-500 dark:text-slate-400">Sort by</label>
                <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-slate-700 dark:text-slate-300 text-sm font-semibold border-none focus:ring-0 cursor-pointer hover:text-[#fbbf24] transition-colors"
                >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="key-asc">Key (A-Z)</option>
                </select>
            </div>
            </div>

            <div className="flex-grow overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
            {filteredAndSortedProgressions.length > 0 ? (
                <ul className="space-y-4">
                {filteredAndSortedProgressions.map(p => (
                    <li key={p.id} className="group bg-white dark:bg-white/5 p-4 rounded-2xl flex flex-col gap-3 border border-slate-200 dark:border-white/5 hover:border-[#fbbf24]/50 dark:hover:border-[#fbbf24]/50 transition-colors shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">{p.key}</p>
                            <p className="text-xs uppercase tracking-wide font-semibold text-[#fbbf24] mt-0.5">{p.mood}</p>
                        </div>
                         <button
                        onClick={() => onDelete(p.id)}
                        title="Delete"
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        >
                        <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                        {p.chords.map((c, i) => (
                             <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-white/10 rounded-md text-xs font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5">{c}</span>
                        ))}
                    </div>

                    <button
                        onClick={() => onLoad(p)}
                        className="w-full mt-1 bg-slate-100 dark:bg-white/10 hover:bg-[#fbbf24] hover:text-black dark:hover:bg-[#fbbf24] dark:hover:text-black text-slate-600 dark:text-slate-300 font-semibold py-2 px-4 rounded-xl transition-all text-sm"
                    >
                        Load Progression
                    </button>
                   
                    </li>
                ))}
                </ul>
            ) : (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 dark:text-slate-500 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                         <BookmarkIcon className="h-8 w-8 opacity-50"/>
                    </div>
                    <p className="font-medium">No saved progressions</p>
                    <p className="text-sm mt-1 opacity-70">Your library is empty.</p>
                </div>
            )}
            </div>
        </div>
        </div>
    </>
  );
};

export default HistoryPanel;