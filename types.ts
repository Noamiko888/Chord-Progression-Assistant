export interface Melody {
  notes: string[];
  style: string;
  tips: string;
}

export interface ChordProgression {
  id: string;
  key: string;
  mood: string;
  chords: string[];
  romanNumerals: string[];
  tips: string;
  melody?: Melody;
  savedAt?: number;
}

export interface TransposeResult {
  chords: string[];
  romanNumerals: string[];
}
