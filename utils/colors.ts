export interface ChordColorClasses {
    button: string;
    text: string;
    glow: string;
}

interface ColorTheme {
    text: string; // The text color
    border: string; // The border color
    glow: string; // The shadow/glow color
}

interface PaletteConfig {
    light: ColorTheme;
    dark: ColorTheme;
}

// Helper to generate the glossy glass styles
const glassBase = "backdrop-blur-md transition-all duration-300 border shadow-lg";

// Define the color mappings. 
// For this new "Dark Blue & Yellow" theme, we will keep the semantic colors for the notes (so C is distinct from G),
// but we will apply them as subtle glows and borders on a dark glass background, rather than full colored backgrounds.

const NEON_PALETTE: PaletteConfig[] = [
  // C (Sky)
  { light: { text: 'text-sky-700', border: 'border-sky-300', glow: 'shadow-sky-500/20' },
    dark: { text: 'text-sky-300', border: 'border-sky-500/50', glow: 'shadow-sky-500/40' } },
  // C# (Teal)
  { light: { text: 'text-teal-700', border: 'border-teal-300', glow: 'shadow-teal-500/20' },
    dark: { text: 'text-teal-300', border: 'border-teal-500/50', glow: 'shadow-teal-500/40' } },
  // D (Emerald)
  { light: { text: 'text-emerald-700', border: 'border-emerald-300', glow: 'shadow-emerald-500/20' },
    dark: { text: 'text-emerald-300', border: 'border-emerald-500/50', glow: 'shadow-emerald-500/40' } },
  // D# (Lime)
  { light: { text: 'text-lime-700', border: 'border-lime-300', glow: 'shadow-lime-500/20' },
    dark: { text: 'text-lime-300', border: 'border-lime-500/50', glow: 'shadow-lime-500/40' } },
  // E (Amber - Keeping this distinct from the UI Yellow)
  { light: { text: 'text-orange-700', border: 'border-orange-300', glow: 'shadow-orange-500/20' },
    dark: { text: 'text-orange-300', border: 'border-orange-500/50', glow: 'shadow-orange-500/40' } },
  // F (Rose)
  { light: { text: 'text-rose-700', border: 'border-rose-300', glow: 'shadow-rose-500/20' },
    dark: { text: 'text-rose-300', border: 'border-rose-500/50', glow: 'shadow-rose-500/40' } },
  // F# (Pink)
  { light: { text: 'text-pink-700', border: 'border-pink-300', glow: 'shadow-pink-500/20' },
    dark: { text: 'text-pink-300', border: 'border-pink-500/50', glow: 'shadow-pink-500/40' } },
  // G (Fuchsia)
  { light: { text: 'text-fuchsia-700', border: 'border-fuchsia-300', glow: 'shadow-fuchsia-500/20' },
    dark: { text: 'text-fuchsia-300', border: 'border-fuchsia-500/50', glow: 'shadow-fuchsia-500/40' } },
  // G# (Purple)
  { light: { text: 'text-purple-700', border: 'border-purple-300', glow: 'shadow-purple-500/20' },
    dark: { text: 'text-purple-300', border: 'border-purple-500/50', glow: 'shadow-purple-500/40' } },
  // A (Violet)
  { light: { text: 'text-violet-700', border: 'border-violet-300', glow: 'shadow-violet-500/20' },
    dark: { text: 'text-violet-300', border: 'border-violet-500/50', glow: 'shadow-violet-500/40' } },
  // A# (Indigo)
  { light: { text: 'text-indigo-700', border: 'border-indigo-300', glow: 'shadow-indigo-500/20' },
    dark: { text: 'text-indigo-300', border: 'border-indigo-500/50', glow: 'shadow-indigo-500/40' } },
  // B (Blue)
  { light: { text: 'text-blue-700', border: 'border-blue-300', glow: 'shadow-blue-500/20' },
    dark: { text: 'text-blue-300', border: 'border-blue-500/50', glow: 'shadow-blue-500/40' } },
];

const FALLBACK_COLOR: PaletteConfig = {
    light: { text: 'text-slate-700', border: 'border-slate-300', glow: 'shadow-slate-500/20' },
    dark: { text: 'text-slate-300', border: 'border-slate-600', glow: 'shadow-white/10' }
};

const ROOT_NOTE_ORDER = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const ALIAS_MAP: { [key: string]: string } = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
};

export const getChordColor = (chord: string): ChordColorClasses => {
    const rootMatch = chord.match(/^[A-G][#b]?/);
    if (!rootMatch) {
        return {
             button: `bg-white/50 dark:bg-slate-900/50 ${FALLBACK_COLOR.light.border} dark:${FALLBACK_COLOR.dark.border}`,
             text: `${FALLBACK_COLOR.light.text} dark:${FALLBACK_COLOR.dark.text}`,
             glow: ''
        };
    }

    let rootName = rootMatch[0];
    if (ALIAS_MAP[rootName]) {
        rootName = ALIAS_MAP[rootName];
    }

    const index = ROOT_NOTE_ORDER.indexOf(rootName);
    const color = index !== -1 ? NEON_PALETTE[index] : FALLBACK_COLOR;
    
    // The glossy button style
    // Light: White-ish transparent background, colored border, colored text.
    // Dark: Black-ish transparent background, colored glowing border, colored neon text.
    
    const lightClasses = `bg-white/60 hover:bg-white/90 ${color.light.border} hover:${color.light.glow}`;
    const darkClasses = `dark:bg-black/40 dark:hover:bg-slate-900/80 dark:${color.dark.border} dark:hover:${color.dark.glow}`;
    
    return {
        button: `${glassBase} ${lightClasses} ${darkClasses}`,
        text: `${color.light.text} ${color.dark.text}`,
        glow: `${color.light.glow} ${color.dark.glow}`
    };
};