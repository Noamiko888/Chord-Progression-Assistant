import { GoogleGenAI, Type } from "@google/genai";
import type { ChordProgression, TransposeResult, Melody } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const PROGRESSION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    mood: { type: Type.STRING, description: "A one or two-word mood description for the progression (e.g., 'Uplifting', 'Melancholy')." },
    chords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "An array of chord symbols as strings (e.g., ['C', 'G', 'Am', 'F'])."
    },
    romanNumerals: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "An array of corresponding Roman numerals as strings (e.g., ['I', 'V', 'vi', 'IV'])."
    },
    tips: { type: Type.STRING, description: "A short, practical tip on harmony or voice leading for this progression." }
  },
  required: ['mood', 'chords', 'romanNumerals', 'tips']
};

const MOOD_PROGRESSION_SCHEMA = {
  ...PROGRESSION_SCHEMA,
  properties: {
    ...PROGRESSION_SCHEMA.properties,
    key: { type: Type.STRING, description: "The musical key of the progression (e.g., 'C Major', 'A Minor')." }
  },
  required: [...PROGRESSION_SCHEMA.required, 'key']
};


const GENERATE_PROGRESSIONS_SCHEMA = { type: Type.ARRAY, items: PROGRESSION_SCHEMA };
const SEARCH_BY_MOOD_SCHEMA = { type: Type.ARRAY, items: MOOD_PROGRESSION_SCHEMA };

const TRANSPOSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    chords: { type: Type.ARRAY, items: { type: Type.STRING } },
    romanNumerals: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ['chords', 'romanNumerals']
};

const MELODY_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        notes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of musical note names as strings (e.g., ['C4', 'E4', 'G4']). Keep it simple and short (4-8 notes)."
        },
        tips: { type: Type.STRING, description: "A short, practical tip for playing this melody over the chords." }
    },
    required: ['notes', 'tips']
};


export const generateProgressions = async (rootNote: string, mode: string): Promise<Omit<ChordProgression, 'id' | 'key'>[]> => {
  const prompt = `You are an expert music theory assistant. Generate 5 creative and musically sound chord progressions for a song in the key of ${rootNote} ${mode}. For each progression, provide a mood description, the chord symbols, the corresponding Roman numerals, and a short, practical tip on harmony or voice leading.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: GENERATE_PROGRESSIONS_SCHEMA,
    },
  });

  try {
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (e) {
    console.error("Failed to parse Gemini response:", response.text);
    throw new Error("Received an invalid format from the AI. Please try again.");
  }
};

export const generateVariation = async (progression: ChordProgression): Promise<Omit<ChordProgression, 'id' | 'key'>> => {
  const prompt = `Given the chord progression "${progression.chords.join(' - ')}" in the key of ${progression.key} with a "${progression.mood}" mood, generate a creative variation. Introduce a new chord, reorder existing ones, or use a chord substitution to create a fresh but related sound. Provide the new chord symbols, Roman numerals, a new mood description, and a new practical tip.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: PROGRESSION_SCHEMA,
    },
  });

  try {
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (e) {
    console.error("Failed to parse Gemini variation response:", response.text);
    throw new Error("Received an invalid format from the AI. Please try again.");
  }
};

export const transposeProgression = async (progression: ChordProgression, newKey: string): Promise<TransposeResult> => {
  const prompt = `Transpose the chord progression "${progression.chords.join(' - ')}" from its original key of ${progression.key} to the new key of ${newKey}. Provide only the new chord symbols and their corresponding Roman numerals for the new key.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: TRANSPOSE_SCHEMA,
    },
  });

  try {
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (e) {
    console.error("Failed to parse Gemini transpose response:", response.text);
    throw new Error("Received an invalid format from the AI. Please try again.");
  }
};

export const generateMelody = async (progression: ChordProgression, style: string): Promise<Omit<Melody, 'style'>> => {
    const prompt = `You are a creative melody composer. Given the chord progression "${progression.chords.join(' - ')}" in the key of ${progression.key}, compose a short, harmonically appropriate melodic phrase in a "${style}" style. Provide an array of note names and a helpful performance tip.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: MELODY_SCHEMA,
        },
    });

    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse Gemini melody response:", response.text);
        throw new Error("Received an invalid format from the AI. Please try again.");
    }
};

export const searchByMood = async (mood: string): Promise<Omit<ChordProgression, 'id'>[]> => {
    const prompt = `You are an expert music theory assistant. Generate 5 creative and musically sound chord progressions that evoke a "${mood}" mood. For each progression, provide its musical key, a mood description, the chord symbols, the corresponding Roman numerals, and a short, practical tip on harmony.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: SEARCH_BY_MOOD_SCHEMA,
        },
    });

    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse Gemini mood search response:", response.text);
        throw new Error("Received an invalid format from the AI. Please try again.");
    }
};
