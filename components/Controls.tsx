
import React from 'react';
import { ROOT_NOTES, MODES } from '../constants';
import { LoadingSpinnerIcon } from './icons';

interface ControlsProps {
  rootNote: string;
  setRootNote: (note: string) => void;
  mode: string;
  setMode: (mode: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const Controls: React.FC<ControlsProps> = ({ rootNote, setRootNote, mode, setMode, onGenerate, isLoading }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl shadow-lg w-full max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="root-note" className="block text-sm font-medium text-sky-300 mb-1">Root Note</label>
          <select
            id="root-note"
            value={rootNote}
            onChange={(e) => setRootNote(e.target.value)}
            disabled={isLoading}
            className="w-full bg-slate-700 text-white border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 transition"
          >
            {ROOT_NOTES.map(note => <option key={note} value={note}>{note}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="mode" className="block text-sm font-medium text-sky-300 mb-1">Mode</label>
          <select
            id="mode"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            disabled={isLoading}
            className="w-full bg-slate-700 text-white border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 transition"
          >
            {MODES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="sm:mt-6">
          <button
            onClick={onGenerate}
            disabled={isLoading}
            className="w-full h-10 flex items-center justify-center bg-sky-500 hover:bg-sky-600 disabled:bg-sky-800 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-all duration-200 shadow-lg hover:shadow-sky-500/30"
          >
            {isLoading ? (
              <>
                <LoadingSpinnerIcon className="h-5 w-5 mr-2" />
                Generating...
              </>
            ) : "Generate Progressions"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;
