# Manolo - AI Chord Progression Assistant

**Manolo** is an interactive music tutoring and songwriting assistant powered by Google's Gemini 2.5 Flash model. It helps musicians, songwriters, and students explore chord progressions, understand music theory, and spark creative ideas through a beautiful, dark-themed web interface.

## ✨ Features

### 🧠 AI-Powered Generation
*   **Harmonic Exploration:** Generate musically sound chord progressions based on a specific root note and mode (Major, Minor, Dorian, Phrygian, etc.).
*   **Mood-Based Discovery:** Describe a vibe (e.g., "Cyberpunk City," "Nostalgic Summer") to get tailored chord sequences.
*   **Creative Variations:** Ask Manolo to generate variations of a progression to break out of writer's block.
*   **Melody Composition:** Generate short, harmonically appropriate melodic phrases with performance tips.
*   **Smart Transposition:** Instantly transpose progressions to any key with updated Roman numeral analysis.

### 🎹 Interactive Playback Engine
*   **Web Audio API:** High-performance, low-latency audio synthesis directly in the browser.
*   **Dual Instrument Modes:** Switch between a warm **Piano** and a modern **Synth** sound.
*   **Rhythmic Tools:**
    *   **Metronome:** Adjustable click track.
    *   **Drum Backing:** Generative drum patterns (Kick/Snare/Hi-hat) to play along with.
    *   **Arpeggiator:** Automatically arpeggiate chords for a flowing texture.
*   **Looping & Tempo:** Seamless looping with adjustable BPM (40-240).

### 🎸 Visual Learning Tools
*   **Chord Diagrams:**
    *   **Guitar:** Accurate fingering charts including open and muted strings.
    *   **Piano:** Keyboard visualization highlighting specific keys.
*   **Real-time Visualization:** Watch chords light up as they play.
*   **Roman Numeral Analysis:** Understand harmonic function (e.g., ii - V - I).

### 💾 Personal Library
*   **History:** Automatically saves generated progressions.
*   **Favorites:** Bookmark your favorite progressions to LocalStorage.
*   **Search & Sort:** Filter your history by key, mood, or date.

## 🛠️ Tech Stack

*   **Frontend:** React 19, TypeScript
*   **Styling:** Tailwind CSS (Custom "Manolo" Dark/Amber theme)
*   **AI Integration:** Google Gemini API (`@google/genai`)
*   **Audio:** Native Web Audio API (No external sample libraries required)

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   A Google Cloud Project with the Gemini API enabled.
*   An API Key from [Google AI Studio](https://aistudio.google.com/).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/manolo-chord-assistant.git
    cd manolo-chord-assistant
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup (Crucial for Security):**
    
    Create a `.env` file in the root directory of the project.
    
    ```bash
    touch .env
    ```

    Add your Google Gemini API key to this file:
    
    ```env
    API_KEY=your_actual_api_key_here
    ```

    > **⚠️ IMPORTANT:** Ensure `.env` is listed in your `.gitignore` file to prevent your API key from being exposed to the public repository.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

## 🛡️ Security Note

This application uses the `process.env.API_KEY` to access the Google Gemini API.
*   **Never** commit your `.env` file to version control.
*   For production deployments, set the `API_KEY` as an environment variable in your hosting provider's settings (e.g., Vercel, Netlify).

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

*   Powered by [Google Gemini](https://deepmind.google/technologies/gemini/)
*   UI Icons by [Heroicons](https://heroicons.com/)
