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
    <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl shadow-lg w-full max-w-2xl">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full flex-grow">
          <label htmlFor="mood-search" className="sr-only">Search by Mood</label>
          <input
            id="mood-search"
            type="text"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder="e.g., 'Cinematic', 'Nostalgic', 'Energetic'..."
            disabled={isLoading}
            className="w-full h-10 px-3 bg-slate-700 text-white border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 transition"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !mood.trim()}
          className="w-full sm:w-auto h-10 flex items-center justify-center bg-sky-500 hover:bg-sky-600 disabled:bg-sky-800 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-all duration-200 shadow-lg hover:shadow-sky-500/30"
        >
          {isLoading ? (
            <>
              <LoadingSpinnerIcon className="h-5 w-5 mr-2" />
              Searching...
            </>
          ) : (
            <>
              <SearchIcon className="h-5 w-5 mr-2" />
              Search
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default MoodSearch;
