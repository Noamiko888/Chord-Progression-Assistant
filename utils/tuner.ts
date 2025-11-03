const A4 = 440;
const C0 = A4 * Math.pow(2, -4.75); // Frequency of C0
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const MIN_SAMPLES = 0; // Number of samples to discard at the start of the buffer
const GOOD_ENOUGH_CORRELATION = 0.9; // A correlation value that is "good enough"

/**
 * Converts a frequency in Hz to the nearest musical note details.
 * @param frequency The frequency in Hz.
 * @returns An object with note details or null if frequency is invalid.
 */
export const frequencyToNoteDetails = (frequency: number) => {
    if (frequency <= 0) return null;

    const noteNumber = 12 * (Math.log(frequency / C0) / Math.log(2));
    const midiNote = Math.round(noteNumber);
    const noteName = NOTE_NAMES[midiNote % 12];
    const octave = Math.floor(midiNote / 12);
    
    // Calculate cents deviation
    const idealFrequency = C0 * Math.pow(2, midiNote / 12);
    const cents = 1200 * Math.log2(frequency / idealFrequency);

    return {
        noteName,
        octave,
        frequency: frequency.toFixed(2),
        idealFrequency: idealFrequency.toFixed(2),
        cents: cents.toFixed(1),
    };
};

/**
 * Finds the fundamental frequency of an audio signal using autocorrelation.
 * @param buffer The audio time-domain data.
 * @param sampleRate The sample rate of the audio context.
 * @returns The detected frequency in Hz, or -1 if no clear frequency is found.
 */
export const autoCorrelate = (buffer: Float32Array, sampleRate: number): number => {
    // 1. Calculate RMS to filter out silence
    let rms = 0;
    for (let i = 0; i < buffer.length; i++) {
        rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / buffer.length);
    if (rms < 0.01) { // Not enough signal
        return -1;
    }

    // 2. Find the correlations
    const correlations = new Array(buffer.length).fill(0);
    for (let lag = MIN_SAMPLES; lag < buffer.length; lag++) {
        for (let i = 0; i < buffer.length - lag; i++) {
            correlations[lag] += buffer[i] * buffer[i + lag];
        }
    }

    // 3. Find the first peak
    let d = 0;
    while (correlations[d] > correlations[d + 1]) {
        d++;
    }

    // 4. Find the max correlation value
    let maxValue = -1;
    let maxLag = -1;
    for (let i = d; i < buffer.length; i++) {
        if (correlations[i] > maxValue) {
            maxValue = correlations[i];
            maxLag = i;
        }
    }
    
    // 5. If the max correlation is strong enough, use it
    let T0 = maxLag;
    const peak = correlations[T0] / correlations[0];
    if (peak > GOOD_ENOUGH_CORRELATION) {
        return sampleRate / T0;
    }

    return -1; // No clear frequency
};
