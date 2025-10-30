export interface ChordColorClasses {
    button: string;
    text: string;
}

// A vibrant color palette designed to work well on a dark background.
// The order corresponds to the chromatic scale starting from C.
const COLOR_PALETTE_CONFIG = [
  { text: 'text-sky-300', bg: 'bg-sky-900/60', border: 'border-sky-700/80', hoverBg: 'hover:bg-sky-800/60', ring: 'focus:ring-sky-500' }, // C
  { text: 'text-teal-300', bg: 'bg-teal-900/60', border: 'border-teal-700/80', hoverBg: 'hover:bg-teal-800/60', ring: 'focus:ring-teal-500' }, // C#
  { text: 'text-emerald-300', bg: 'bg-emerald-900/60', border: 'border-emerald-700/80', hoverBg: 'hover:bg-emerald-800/60', ring: 'focus:ring-emerald-500' }, // D
  { text: 'text-lime-300', bg: 'bg-lime-900/60', border: 'border-lime-700/80', hoverBg: 'hover:bg-lime-800/60', ring: 'focus:ring-lime-500' }, // D#
  { text: 'text-amber-300', bg: 'bg-amber-900/60', border: 'border-amber-700/80', hoverBg: 'hover:bg-amber-800/60', ring: 'focus:ring-amber-500' }, // E
  { text: 'text-rose-300', bg: 'bg-rose-900/60', border: 'border-rose-700/80', hoverBg: 'hover:bg-rose-800/60', ring: 'focus:ring-rose-500' }, // F
  { text: 'text-pink-300', bg: 'bg-pink-900/60', border: 'border-pink-700/80', hoverBg: 'hover:bg-pink-800/60', ring: 'focus:ring-pink-500' }, // F#
  { text: 'text-fuchsia-300', bg: 'bg-fuchsia-900/60', border: 'border-fuchsia-700/80', hoverBg: 'hover:bg-fuchsia-800/60', ring: 'focus:ring-fuchsia-500' }, // G
  { text: 'text-purple-300', bg: 'bg-purple-900/60', border: 'border-purple-700/80', hoverBg: 'hover:bg-purple-800/60', ring: 'focus:ring-purple-500' }, // G#
  { text: 'text-violet-300', bg: 'bg-violet-900/60', border: 'border-violet-700/80', hoverBg: 'hover:bg-violet-800/60', ring: 'focus:ring-violet-500' }, // A
  { text: 'text-indigo-300', bg: 'bg-indigo-900/60', border: 'border-indigo-700/80', hoverBg: 'hover:bg-indigo-800/60', ring: 'focus:ring-indigo-500' }, // A#
  { text: 'text-blue-300', bg: 'bg-blue-900/60', border: 'border-blue-700/80', hoverBg: 'hover:bg-blue-800/60', ring: 'focus:ring-blue-500' }, // B
];

const FALLBACK_COLOR = { text: 'text-slate-300', bg: 'bg-slate-900', border: 'border-slate-700', hoverBg: 'hover:bg-slate-800', ring: 'focus:ring-sky-500' };

const ROOT_NOTE_ORDER = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const ALIAS_MAP: { [key: string]: string } = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
};

/**
 * Gets a consistent set of color classes for a chord based on its root note.
 * @param chord The chord name string (e.g., "Cmaj7", "F#m").
 * @returns An object with Tailwind classes for the button and its text.
 */
export const getChordColor = (chord: string): ChordColorClasses => {
    const rootMatch = chord.match(/^[A-G][#b]?/);
    if (!rootMatch) {
        return {
            button: `${FALLBACK_COLOR.bg} ${FALLBACK_COLOR.border} ${FALLBACK_COLOR.hoverBg} ${FALLBACK_COLOR.ring}`,
            text: FALLBACK_COLOR.text
        };
    }

    let rootName = rootMatch[0];
    // Normalize enharmonic equivalents (e.g., Db is treated as C# for color)
    if (ALIAS_MAP[rootName]) {
        rootName = ALIAS_MAP[rootName];
    }

    const index = ROOT_NOTE_ORDER.indexOf(rootName);
    const color = index !== -1 ? COLOR_PALETTE_CONFIG[index] : FALLBACK_COLOR;
    
    return {
        button: `${color.bg} ${color.border} ${color.hoverBg} ${color.ring}`,
        text: color.text
    };
};
