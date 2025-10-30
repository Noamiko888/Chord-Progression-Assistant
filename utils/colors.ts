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
    dark: { text: 'text-sky-300', bg: 'dark:bg-sky-900/60', border: 'dark:border-sky-700/80', hoverBg: 'dark:hover:bg-sky-800/60', ring: 'dark:focus:ring-sky-500' } },
  // C# (Teal)
  { light: { text: 'text-teal-800', bg: 'bg-teal-100', border: 'border-teal-200', hoverBg: 'hover:bg-teal-200/70', ring: 'focus:ring-teal-500' },
    dark: { text: 'text-teal-300', bg: 'dark:bg-teal-900/60', border: 'dark:border-teal-700/80', hoverBg: 'dark:hover:bg-teal-800/60', ring: 'dark:focus:ring-teal-500' } },
  // D (Emerald)
  { light: { text: 'text-emerald-800', bg: 'bg-emerald-100', border: 'border-emerald-200', hoverBg: 'hover:bg-emerald-200/70', ring: 'focus:ring-emerald-500' },
    dark: { text: 'text-emerald-300', bg: 'dark:bg-emerald-900/60', border: 'dark:border-emerald-700/80', hoverBg: 'dark:hover:bg-emerald-800/60', ring: 'dark:focus:ring-emerald-500' } },
  // D# (Lime)
  { light: { text: 'text-lime-800', bg: 'bg-lime-100', border: 'border-lime-200', hoverBg: 'hover:bg-lime-200/70', ring: 'focus:ring-lime-500' },
    dark: { text: 'text-lime-300', bg: 'dark:bg-lime-900/60', border: 'dark:border-lime-700/80', hoverBg: 'dark:hover:bg-lime-800/60', ring: 'dark:focus:ring-lime-500' } },
  // E (Amber)
  { light: { text: 'text-amber-800', bg: 'bg-amber-100', border: 'border-amber-200', hoverBg: 'hover:bg-amber-200/70', ring: 'focus:ring-amber-500' },
    dark: { text: 'text-amber-300', bg: 'dark:bg-amber-900/60', border: 'dark:border-amber-700/80', hoverBg: 'dark:hover:bg-amber-800/60', ring: 'dark:focus:ring-amber-500' } },
  // F (Rose)
  { light: { text: 'text-rose-800', bg: 'bg-rose-100', border: 'border-rose-200', hoverBg: 'hover:bg-rose-200/70', ring: 'focus:ring-rose-500' },
    dark: { text: 'text-rose-300', bg: 'dark:bg-rose-900/60', border: 'dark:border-rose-700/80', hoverBg: 'dark:hover:bg-rose-800/60', ring: 'dark:focus:ring-rose-500' } },
  // F# (Pink)
  { light: { text: 'text-pink-800', bg: 'bg-pink-100', border: 'border-pink-200', hoverBg: 'hover:bg-pink-200/70', ring: 'focus:ring-pink-500' },
    dark: { text: 'text-pink-300', bg: 'dark:bg-pink-900/60', border: 'dark:border-pink-700/80', hoverBg: 'dark:hover:bg-pink-800/60', ring: 'dark:focus:ring-pink-500' } },
  // G (Fuchsia)
  { light: { text: 'text-fuchsia-800', bg: 'bg-fuchsia-100', border: 'border-fuchsia-200', hoverBg: 'hover:bg-fuchsia-200/70', ring: 'focus:ring-fuchsia-500' },
    dark: { text: 'text-fuchsia-300', bg: 'dark:bg-fuchsia-900/60', border: 'dark:border-fuchsia-700/80', hoverBg: 'dark:hover:bg-fuchsia-800/60', ring: 'dark:focus:ring-fuchsia-500' } },
  // G# (Purple)
  { light: { text: 'text-purple-800', bg: 'bg-purple-100', border: 'border-purple-200', hoverBg: 'hover:bg-purple-200/70', ring: 'focus:ring-purple-500' },
    dark: { text: 'text-purple-300', bg: 'dark:bg-purple-900/60', border: 'dark:border-purple-700/80', hoverBg: 'dark:hover:bg-purple-800/60', ring: 'dark:focus:ring-purple-500' } },
  // A (Violet)
  { light: { text: 'text-violet-800', bg: 'bg-violet-100', border: 'border-violet-200', hoverBg: 'hover:bg-violet-200/70', ring: 'focus:ring-violet-500' },
    dark: { text: 'text-violet-300', bg: 'dark:bg-violet-900/60', border: 'dark:border-violet-700/80', hoverBg: 'dark:hover:bg-violet-800/60', ring: 'dark:focus:ring-violet-500' } },
  // A# (Indigo)
  { light: { text: 'text-indigo-800', bg: 'bg-indigo-100', border: 'border-indigo-200', hoverBg: 'hover:bg-indigo-200/70', ring: 'focus:ring-indigo-500' },
    dark: { text: 'text-indigo-300', bg: 'dark:bg-indigo-900/60', border: 'dark:border-indigo-700/80', hoverBg: 'dark:hover:bg-indigo-800/60', ring: 'dark:focus:ring-indigo-500' } },
  // B (Blue)
  { light: { text: 'text-blue-800', bg: 'bg-blue-100', border: 'border-blue-200', hoverBg: 'hover:bg-blue-200/70', ring: 'focus:ring-blue-500' },
    dark: { text: 'text-blue-300', bg: 'dark:bg-blue-900/60', border: 'dark:border-blue-700/80', hoverBg: 'dark:hover:bg-blue-800/60', ring: 'dark:focus:ring-blue-500' } },
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