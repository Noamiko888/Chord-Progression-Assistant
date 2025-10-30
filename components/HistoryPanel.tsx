import React, { useState, useMemo } from 'react';
import type { ChordProgression } from '../types';
import { TrashIcon, XIcon, SearchIcon } from './icons';

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
    <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-slate-800/90 backdrop-blur-md shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Saved Progressions</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white">
            <XIcon className="h-6 w-6" />
          </button>
        </header>

        <div className="p-4 border-b border-slate-700">
          <div className="relative mb-2">
            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-md pl-9 pr-3 py-2 focus:ring-sky-500 focus:border-sky-500"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="sort-by" className="text-sm text-slate-400">Sort by:</label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-700 text-white rounded-md py-1 text-sm border-slate-600 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="key-asc">Key (A-Z)</option>
            </select>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-4">
          {filteredAndSortedProgressions.length > 0 ? (
            <ul className="space-y-3">
              {filteredAndSortedProgressions.map(p => (
                <li key={p.id} className="bg-slate-700/50 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sky-400">{p.key} ({p.mood})</p>
                    <p className="text-sm text-slate-300 font-mono">{p.chords.join(' - ')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onLoad(p)}
                      className="text-sm bg-sky-600 hover:bg-sky-700 text-white font-semibold py-1 px-3 rounded-md transition-colors"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => onDelete(p.id)}
                      title="Delete"
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-600 rounded-full transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-slate-400 pt-10">
              <p>No saved progressions found.</p>
              <p className="text-sm mt-1">Generate and save some to see them here!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel;
