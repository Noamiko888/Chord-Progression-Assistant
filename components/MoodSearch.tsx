import React, { useState } from 'react';
import { LoadingSpinnerIcon, SearchIcon } from './icons';

interface MoodSearchProps {
  onSearch: (mood: string) => void;
  isLoading: boolean;
}

const MoodSearch: React.FC<MoodSearchProps> = ({ onSearch, isLoading }) => {
  const [mood, setMood] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mood.trim() && !isLoading) {
      onSearch(mood.trim());
    }
  };

  return (
    <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-2xl mx-auto border border-white/40 dark:border-white/10 ring-1 ring-black/5">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch gap-4">
        <div className="w-full flex-grow relative">
          <label htmlFor="mood-search" className="sr-only">Search by Mood</label>
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
             <SearchIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            id="mood-search"
            type="text"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder="Describe a vibe (e.g., 'Cyberpunk City', 'Sad Piano')"
            disabled={isLoading}
            className="w-full h-[50px] pl-11 pr-4 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl shadow-inner focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !mood.trim()}
          className="h-[50px] min-w-[120px] flex items-center justify-center gap-2 bg-gradient-to-r from-[#fbbf24] to-amber-500 hover:from-[#fcd34d] hover:to-amber-400 disabled:from-slate-300 disabled:to-slate-400 dark:disabled:from-slate-800 dark:disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-black font-bold px-6 rounded-2xl transition-all duration-300 shadow-[0_4px_20px_rgba(251,191,36,0.3)] hover:shadow-[0_4px_25px_rgba(251,191,36,0.5)] transform hover:-translate-y-0.5 active:translate-y-0"
        >
          {isLoading ? (
            <>
              <LoadingSpinnerIcon className="h-5 w-5 animate-spin text-black/70" />
            </>
          ) : (
            <>
              <span>Search</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default MoodSearch;