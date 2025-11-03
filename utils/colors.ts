export interface ChordColorClasses {
    button: string;
    text: string;
}

interface ColorTheme {
    text: string;
    bg: string;
    border: string;
    hoverBg: string;
    ring: string;
}

interface PaletteConfig {
    light: ColorTheme;
    dark: ColorTheme;
}

// A vibrant color palette designed to work well on both light and dark backgrounds.
const COLOR_PALETTE_CONFIG: PaletteConfig[] = [
  // C (Sky)
  { light: { text: 'text-sky-800', bg: 'bg-sky-100', border: 'border-sky-200', hoverBg: 'hover:bg-sky-200/70', ring: 'focus:ring-sky-500' },
    dark: { text: 'text-sky-100', bg: 'dark:bg-gradient-to-b dark:from-sky-700 dark:to-sky-900', border: 'dark:border-t-sky-500/80 dark:border-x-sky-800 dark:border-b-black/50', hoverBg: 'dark:hover:from-sky-600 dark:hover:to-sky-800', ring: 'dark:focus:ring-sky-400' } },
  // C# (Teal)
  { light: { text: 'text-teal-800', bg: 'bg-teal-100', border: 'border-teal-200', hoverBg: 'hover:bg-teal-200/70', ring: 'focus:ring-teal-500' },
    dark: { text: 'text-teal-100', bg: 'dark:bg-gradient-to-b dark:from-teal-700 dark:to-teal-900', border: 'dark:border-t-teal-500/80 dark:border-x-teal-800 dark:border-b-black/50', hoverBg: 'dark:hover:from-teal-600 dark:hover:to-teal-800', ring: 'dark:focus:ring-teal-400' } },
  // D (Emerald)
  { light: { text: 'text-emerald-800', bg: 'bg-emerald-100', border: 'border-emerald-200', hoverBg: 'hover:bg-emerald-200/70', ring: 'focus:ring-emerald-500' },
    dark: { text: 'text-emerald-100', bg: 'dark:bg-gradient-to-b dark:from-emerald-700 dark:to-emerald-900', border: 'dark:border-t-emerald-500/80 dark:border-x-emerald-800 dark:border-b-black/50', hoverBg: 'dark:hover:from-emerald-600 dark:hover:to-emerald-800', ring: 'dark:focus:ring-emerald-400' } },
  // D# (Lime)
  { light: { text: 'text-lime-800', bg: 'bg-lime-100', border: 'border-lime-200', hoverBg: 'hover:bg-lime-200/70', ring: 'focus:ring-lime-500' },
    dark: { text: 'text-lime-100', bg: 'dark:bg-gradient-to-b dark:from-lime-700 dark:to-lime-900', border: 'dark:border-t-lime-500/80 dark:border-x-lime-800 dark:border-b-black/50', hoverBg: 'dark:hover:from-lime-600 dark:hover:to-lime-800', ring: 'dark:focus:ring-lime-400' } },
  // E (Amber)
  { light: { text: 'text-amber-800', bg: 'bg-amber-100', border: 'border-amber-200', hoverBg: 'hover:bg-amber-200/70', ring: 'focus:ring-amber-500' },
    dark: { text: 'text-amber-100', bg: 'dark:bg-gradient-to-b dark:from-amber-700 dark:to-amber-900', border: 'dark:border-t-amber-500/80 dark:border-x-amber-800 dark:border-b-black/50', hoverBg: 'dark:hover:from-amber-600 dark:hover:to-amber-800', ring: 'dark:focus:ring-amber-400' } },
  // F (Rose)
  { light: { text: 'text-rose-800', bg: 'bg-rose-100', border: 'border-rose-200', hoverBg: 'hover:bg-rose-200/70', ring: 'focus:ring-rose-500' },
    dark: { text: 'text-rose-100', bg: 'dark:bg-gradient-to-b dark:from-rose-700 dark:to-rose-900', border: 'dark:border-t-rose-500/80 dark:border-x-rose-800 dark:border-b-black/50', hoverBg: 'dark:hover:from-rose-600 dark:hover:to-rose-800', ring: 'dark:focus:ring-rose-400' } },
  // F# (Pink)
  { light: { text: 'text-pink-800', bg: 'bg-pink-100', border: 'border-pink-200', hoverBg: 'hover:bg-pink-200/70', ring: 'focus:ring-pink-500' },
    dark: { text: 'text-pink-100', bg: 'dark:bg-gradient-to-b dark:from-pink-700 dark:to-pink-900', border: 'dark:border-t-pink-500/80 dark:border-x-pink-800 dark:border-b-black/50', hoverBg: 'dark:hover:from-pink-600 dark:hover:to-pink-800', ring: 'dark:focus:ring-pink-400' } },
  // G (Fuchsia)
  { light: { text: 'text-fuchsia-800', bg: 'bg-fuchsia-100', border: 'border-fuchsia-200', hoverBg: 'hover:bg-fuchsia-200/70', ring: 'focus:ring-fuchsia-500' },
    dark: { text: 'text-fuchsia-100', bg: 'dark:bg-gradient-to-b dark:from-fuchsia-700 dark:to-fuchsia-900', border: 'dark:border-t-fuchsia-500/80 dark:border-x-fuchsia-800 dark:border-b-black/50', hoverBg: 'dark:hover:from-fuchsia-600 dark:hover:to-fuchsia-800', ring: 'dark:focus:ring-fuchsia-400' } },
  // G# (Purple)
  { light: { text: 'text-purple-800', bg: 'bg-purple-100', border: 'border-purple-200', hoverBg: 'hover:bg-purple-200/70', ring: 'focus:ring-purple-500' },
    dark: { text: 'text-purple-100', bg: 'dark:bg-gradient-to-b dark:from-purple-700 dark:to-purple-900', border: 'dark:border-t-purple-500/80 dark:border-x-purple-800 dark:border-b-black/50', hoverBg: 'dark:hover:from-purple-600 dark:hover:to-purple-800', ring: 'dark:focus:ring-purple-400' } },
  // A (Violet)
  { light: { text: 'text-violet-800', bg: 'bg-violet-100', border: 'border-violet-200', hoverBg: 'hover:bg-violet-200/70', ring: 'focus:ring-violet-500' },
    dark: { text: 'text-violet-100', bg: 'dark:bg-gradient-to-b dark:from-violet-700 dark:to-violet-900', border: 'dark:border-t-violet-500/80 dark:border-x-violet-800 dark:border-b-black/50', hoverBg: 'dark:hover:from-violet-600 dark:hover:to-violet-800', ring: 'dark:focus:ring-violet-400' } },
  // A# (Indigo)
  { light: { text: 'text-indigo-800', bg: 'bg-indigo-100', border: 'border-indigo-200', hoverBg: 'hover:bg-indigo-200/70', ring: 'focus:ring-indigo-500' },
    dark: { text: 'text-indigo-100', bg: 'dark:bg-gradient-to-b dark:from-indigo-700 dark:to-indigo-900', border: 'dark:border-t-indigo-500/80 dark:border-x-indigo-800 dark:border-b-black/50', hoverBg: 'dark:hover:from-indigo-600 dark:hover:to-indigo-800', ring: 'dark:focus:ring-indigo-400' } },
  // B (Blue)
  { light: { text: 'text-blue-800', bg: 'bg-blue-100', border: 'border-blue-200', hoverBg: 'hover:bg-blue-200/70', ring: 'focus:ring-blue-500' },
    dark: { text: 'text-blue-100', bg: 'dark:bg-gradient-to-b dark:from-blue-700 dark:to-blue-900', border: 'dark:border-t-blue-500/80 dark:border-x-blue-800 dark:border-b-black/50', hoverBg: 'dark:hover:from-blue-600 dark:hover:to-blue-800', ring: 'dark:focus:ring-blue-400' } },
];


const FALLBACK_COLOR: PaletteConfig = {
    light: { text: 'text-slate-800', bg: 'bg-slate-200', border: 'border-slate-300', hoverBg: 'hover:bg-slate-300', ring: 'focus:ring-sky-500' },
    dark: { text: 'text-slate-300', bg: 'dark:bg-slate-900', border: 'dark:border-slate-700', hoverBg: 'dark:hover:bg-slate-800', ring: 'dark:focus:ring-sky-500' }
};

const ROOT_NOTE_ORDER = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const ALIAS_MAP: { [key: string]: string } = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
};

/**
 * Gets a consistent set of color classes for a chord based on its root note.
 * @param chord The chord name string (e.g., "Cmaj7", "F#m").
 * @returns An object with Tailwind classes for the button and its text, supporting both themes.
 */
export const getChordColor = (chord: string): ChordColorClasses => {
    const rootMatch = chord.match(/^[A-G][#b]?/);
    if (!rootMatch) {
        return {
            button: `${FALLBACK_COLOR.light.bg} ${FALLBACK_COLOR.light.border} ${FALLBACK_COLOR.light.hoverBg} ${FALLBACK_COLOR.light.ring} ${FALLBACK_COLOR.dark.bg} ${FALLBACK_COLOR.dark.border} ${FALLBACK_COLOR.dark.hoverBg} ${FALLBACK_COLOR.dark.ring}`,
            text: `${FALLBACK_COLOR.light.text} ${FALLBACK_COLOR.dark.text}`
        };
    }

    let rootName = rootMatch[0];
    if (ALIAS_MAP[rootName]) {
        rootName = ALIAS_MAP[rootName];
    }

    const index = ROOT_NOTE_ORDER.indexOf(rootName);
    const color = index !== -1 ? COLOR_PALETTE_CONFIG[index] : FALLBACK_COLOR;
    
    return {
        button: `${color.light.bg} ${color.light.border} ${color.light.hoverBg} ${color.light.ring} ${color.dark.bg} ${color.dark.border} ${color.dark.hoverBg} ${color.dark.ring}`,
        text: `${color.light.text} ${color.dark.text}`
    };
};