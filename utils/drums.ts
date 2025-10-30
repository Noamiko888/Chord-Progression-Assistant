let audioContext: AudioContext | null = null;

const initAudioContext = () => {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error("Web Audio API is not supported in this browser");
    }
  }
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
};

// --- Sound Synthesis Functions ---

function createKick(ctx: AudioContext, time: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.frequency.setValueAtTime(150, time);
  osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.1);
  gain.gain.setValueAtTime(1, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

  osc.start(time);
  osc.stop(time + 0.15);
}

function createSnare(ctx: AudioContext, time: number) {
  const noise = ctx.createBufferSource();
  const bufferSize = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  noise.buffer = buffer;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.value = 1000;
  noise.connect(noiseFilter);

  const noiseEnvelope = ctx.createGain();
  noiseFilter.connect(noiseEnvelope);
  noiseEnvelope.connect(ctx.destination);
  noiseEnvelope.gain.setValueAtTime(0.5, time);
  noiseEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
  
  noise.start(time);
  noise.stop(time + 0.15);
}

function createHiHat(ctx: AudioContext, time: number) {
    const noise = ctx.createBufferSource();
    const bufferSize = ctx.sampleRate * 0.1; // Short buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    noise.buffer = buffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 10000;
    
    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 7000;
    
    noise.connect(bandpass);
    bandpass.connect(highpass);

    const envelope = ctx.createGain();
    highpass.connect(envelope);
    envelope.connect(ctx.destination);
    envelope.gain.setValueAtTime(0.2, time);
    envelope.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

    noise.start(time);
    noise.stop(time + 0.1);
}

// --- Main Playback Function ---

/**
 * Plays a drum sound based on the current beat in a 4/4 pattern.
 * @param beat The current beat (0-indexed).
 */
export const playDrumSound = (beat: number) => {
  const ctx = initAudioContext();
  if (!ctx) return;
  
  const time = ctx.currentTime;
  const beatInMeasure = beat % 4; // Simple 4/4 time

  // Basic rock beat: kick on 1 & 3, snare on 2 & 4, hi-hat on all beats
  if (beatInMeasure === 0 || beatInMeasure === 2) {
    createKick(ctx, time);
  }
  if (beatInMeasure === 1 || beatInMeasure === 3) {
    createSnare(ctx, time);
  }
  createHiHat(ctx, time);
};