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
    <div className="bg-slate-300/20 dark:bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl shadow-lg w-full max-w-2xl border border-slate-300/30 dark:border-transparent">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="root-note" className="block text-sm font-medium text-sky-700 dark:text-sky-300 mb-1">Root Note</label>
          <select
            id="root-note"
            value={rootNote}
            onChange={(e) => setRootNote(e.target.value)}
            disabled={isLoading}
            className="w-full bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 transition"
          >
            {ROOT_NOTES.map(note => <option key={note} value={note}>{note}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="mode" className="block text-sm font-medium text-sky-700 dark:text-sky-300 mb-1">Mode</label>
          <select
            id="mode"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            disabled={isLoading}
            className="w-full bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 transition"
          >
            {MODES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="sm:self-end">
          <button
            onClick={onGenerate}
            disabled={isLoading}
            className="w-full h-full min-h-[50px] flex items-center justify-center bg-sky-500 hover:bg-sky-600 disabled:bg-sky-500/50 dark:disabled:bg-sky-800 disabled:text-slate-100 dark:disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-all duration-200 shadow-lg hover:shadow-sky-500/30 text-center"
          >
            {isLoading ? (
              <>
                <LoadingSpinnerIcon className="h-5 w-5 mr-2" />
                <span>Generating...</span>
              </>
            ) : (
                <div className="leading-tight">
                    <div>Generate</div>
                    <div>Progressions</div>
                </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;