# AI Chord Progression Assistant

An interactive music tutoring and songwriting assistant powered by Google's Gemini AI. This application helps musicians, songwriters, and students explore chord progressions, understand music theory, and spark creative ideas through an intuitive, web-based interface.

## 🎵 Features

### AI-Powered Generation
*   **Key & Mode Generation:** Generate musically sound chord progressions based on a specific root note and mode (Major, Minor, Dorian, Phrygian, etc.).
*   **Mood Search:** Find progressions by describing a feeling (e.g., "Nostalgic sunset," "Cyberpunk chase," "Melancholy jazz").
*   **Smart Variations:** Create creative variations of existing progressions using chord substitutions and reordering.
*   **Melody Generation:** AI-composed melodic phrases to accompany your chords in various styles (Simple, Complex, Rhythmic).
*   **Intelligent Transposition:** Instantly transpose progressions to any key with accurate Roman numeral analysis.

### Interactive Playback Engine
*   **Web Audio API Engine:** Custom-built audio synthesis (no heavy external samples required).
*   **Dual Instruments:** Switch between a warm **Piano** sound and a modern **Synth**.
*   **Rhythmic Tools:**
    *   **Metronome:** Keep time with visual and audio cues.
    *   **Drum Backing:** Simple rock/pop beat generation.
    *   **Arpeggiator:** Play chords as broken notes for a different texture.
*   **Tempo Control:** Adjustable BPM (40-240) for all playback modes.
*   **Looping:** Seamlessly loop progressions for practicing improvisation.

### Visual Learning Tools
*   **Chord Diagrams:** Dynamic SVG rendering for:
    *   **Guitar:** Fingering charts including open and muted strings.
    *   **Piano:** Keyboard visualization highlighting specific keys.
*   **Real-time Highlighting:** Visual cues follow the playback beat by beat.
*   **Roman Numeral Analysis:** Learn the function of each chord (e.g., ii - V - I).
*   **Theory Tips:** Context-aware tips provided by Gemini for every progression and melody.

### User Experience
*   **History System:** Save your favorite progressions to LocalStorage to revisit them later.
*   **Dark/Light Mode:** Fully responsive UI with automatic system preference detection and manual toggle.
*   **Responsive Design:** Works smoothly on desktop and mobile devices.

## 🛠️ Tech Stack

*   **Frontend Framework:** React 19
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **AI Model:** Google Gemini 2.5 Flash (via `@google/genai` SDK)
*   **Audio:** Native Web Audio API (Oscillators, Gain nodes, Filters)
*   **Icons:** Custom SVG components

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   A Google Cloud Project with the Gemini API enabled.
*   An API Key from [Google AI Studio](https://aistudio.google.com/).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/chord-progression-assistant.git
    cd chord-progression-assistant
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory and add your Google Gemini API key:
    ```env
    API_KEY=your_actual_api_key_here
    ```
    *Note: The application expects the API key to be available via `process.env.API_KEY`.*

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

## 📂 Project Structure

*   **`/components`**: UI components (Controls, ProgressionCard, Visual Aids, Icons).
*   **`/services`**: Integration with Google Gemini API (`geminiService.ts`).
*   **`/utils`**:
    *   `audio.ts`: Web Audio API logic for synth/piano synthesis.
    *   `chords-library.ts`: Data structures for guitar chord voicings.
    *   `colors.ts`: Dynamic color mapping for chord buttons.
*   **`types.ts`**: TypeScript interfaces for data models.
*   **`constants.ts`**: Musical constants (Notes, Modes, Styles).

## 🎹 Music Theory Implementation

The app uses standard Western music theory conventions:
*   **Audio:** Pitch calculation uses Equal Temperament based on A4 = 440Hz.
*   **Chord Colors:** Uses a color-coding system (Circle of Fifths adjacency) to visually distinguish root notes.
*   **Voicings:**
    *   Piano visualizations display 2 octaves.
    *   Guitar diagrams utilize standard open chord positions where possible.

## 📄 License

This project is open-source and available under the MIT License.
