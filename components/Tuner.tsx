import React, { useEffect } from 'react';
import { useTuner } from '../hooks/useTuner';
import { XIcon, LoadingSpinnerIcon } from './icons';

interface TunerProps {
  isOpen: boolean;
  onClose: () => void;
}

const Tuner: React.FC<TunerProps> = ({ isOpen, onClose }) => {
  const { tunerData, isListening, error, startListening, stopListening } = useTuner();

  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      stopListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const cents = tunerData ? parseFloat(tunerData.cents) : 0;
  const rotation = Math.max(-45, Math.min(45, cents * 0.9)); // Clamp between -45 and 45 degrees
  const isInTune = Math.abs(cents) < 5;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm bg-slate-200 dark:bg-slate-800 rounded-2xl shadow-2xl p-6 border border-slate-300 dark:border-slate-700">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          title="Close Tuner"
        >
          <XIcon className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-4">Instrument Tuner</h2>

        {error && (
            <div className="text-center text-red-600 dark:text-red-400 bg-red-500/10 p-3 rounded-lg">
                <p className="font-semibold">Error</p>
                <p className="text-sm">{error}</p>
            </div>
        )}

        {!isListening && !error && (
             <div className="flex flex-col items-center justify-center h-48">
                <LoadingSpinnerIcon className="h-10 w-10 text-sky-500"/>
                <p className="mt-3 text-slate-600 dark:text-slate-400">Initializing microphone...</p>
            </div>
        )}

        {isListening && (
            <div className="flex flex-col items-center gap-4">
                {/* Visual Meter */}
                <div className="w-64 h-32 rounded-t-full bg-slate-300 dark:bg-slate-700 overflow-hidden relative border-t-2 border-x-2 border-slate-400 dark:border-slate-600">
                    <div
                        className="absolute bottom-0 left-1/2 w-0.5 h-full bg-slate-500 dark:bg-slate-400 transition-transform duration-200 ease-linear origin-bottom"
                        style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
                    >
                         <div className="w-2 h-2 bg-slate-500 dark:bg-slate-400 rounded-full absolute -top-1 -left-[3px]"></div>
                    </div>
                    {/* In-tune zone */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-green-500/50 rounded-t-sm"></div>
                </div>

                {/* Note Display */}
                <div className={`text-center p-4 rounded-lg w-full transition-colors ${isInTune && tunerData ? 'bg-green-500/10' : 'bg-transparent'}`}>
                    {tunerData ? (
                        <>
                            <div className="flex items-baseline justify-center">
                                <span className="text-7xl font-bold text-slate-900 dark:text-white">{tunerData.noteName}</span>
                                <span className="text-3xl font-semibold text-slate-600 dark:text-slate-400 ml-1">{tunerData.octave}</span>
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 font-mono mt-1">
                                {tunerData.frequency} Hz / {tunerData.cents} cents
                            </div>
                        </>
                    ) : (
                         <div className="h-[124px] flex items-center justify-center">
                            <p className="text-slate-500 dark:text-slate-400 text-lg">---</p>
                        </div>
                    )}
                </div>

                {/* Flat/Sharp indicators */}
                 <div className="flex justify-between w-full max-w-[200px] text-sm font-semibold">
                    <span className={`transition-colors ${!isInTune && cents < 0 ? 'text-red-500' : 'text-slate-400'}`}>FLAT</span>
                    <span className={`transition-colors ${!isInTune && cents > 0 ? 'text-red-500' : 'text-slate-400'}`}>SHARP</span>
                 </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Tuner;
