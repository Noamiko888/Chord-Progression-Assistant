import React from 'react';
import { ROOT_NOTES, MODES } from '../constants';
import { LoadingSpinnerIcon, SparklesIcon } from './icons';

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
    <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-2xl mx-auto border border-white/40 dark:border-white/10 ring-1 ring-black/5">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-end">
        <div className="sm:col-span-3">
          <label htmlFor="root-note" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 ml-1">Key</label>
          <div className="relative">
            <select
                id="root-note"
                value={rootNote}
                onChange={(e) => setRootNote(e.target.value)}
                disabled={isLoading}
                className="w-full appearance-none bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl py-3 px-4 shadow-inner focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent transition-all outline-none text-center font-semibold cursor-pointer hover:bg-white dark:hover:bg-white/10"
            >
                {ROOT_NOTES.map(note => <option key={note} value={note}>{note}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500 dark:text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>
        
        <div className="sm:col-span-5">
          <label htmlFor="mode" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 ml-1">Mode</label>
           <div className="relative">
            <select
                id="mode"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                disabled={isLoading}
                className="w-full appearance-none bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl py-3 px-4 shadow-inner focus:ring-2 focus:ring-[#fbbf24] focus:border-transparent transition-all outline-none font-semibold cursor-pointer hover:bg-white dark:hover:bg-white/10"
            >
                {MODES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500 dark:text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>

        <div className="sm:col-span-4">
          <button
            onClick={onGenerate}
            disabled={isLoading}
            className="group w-full h-[50px] flex items-center justify-center gap-2 bg-gradient-to-r from-[#fbbf24] to-amber-500 hover:from-[#fcd34d] hover:to-amber-400 disabled:from-slate-300 disabled:to-slate-400 dark:disabled:from-slate-800 dark:disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-black font-bold py-3 px-6 rounded-2xl transition-all duration-300 shadow-[0_4px_20px_rgba(251,191,36,0.3)] hover:shadow-[0_4px_25px_rgba(251,191,36,0.5)] transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {isLoading ? (
              <LoadingSpinnerIcon className="h-5 w-5 animate-spin text-black/70" />
            ) : (
                <>
                <span>Generate</span>
                <SparklesIcon className="h-5 w-5 text-black/70 group-hover:rotate-12 transition-transform" />
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;