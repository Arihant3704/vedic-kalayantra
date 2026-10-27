/**
 * Vedic Temple Bell & Singing Bowl Sound Synthesizer via Web Audio API.
 * Synthesizes harmonic overtone chimes offline without external audio files.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Play a sacred Ghanta (temple bell) chime
 * type 'shubha' | 'choghadiya' -> High pure harmonic bell (528 Hz - Solfeggio / Mi frequency)
 * type 'ashubha' -> Deep warning gong tone (220 Hz)
 * type 'transit' -> Resonant celestial chord (432 Hz)
 */
export function playAlertChime(type: 'shubha' | 'ashubha' | 'transit' | 'choghadiya' | 'neutral' = 'shubha') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    let baseFreq = 528; // Auspicious bell
    let decay = 2.4;
    let gainVal = 0.25;

    if (type === 'ashubha') {
      baseFreq = 220; // Deep warning tone
      decay = 2.8;
      gainVal = 0.3;
    } else if (type === 'transit') {
      baseFreq = 432; // Cosmic resonance
      decay = 3.0;
      gainVal = 0.28;
    }

    // Master Gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.linearRampToValueAtTime(gainVal, now + 0.02);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + decay);
    masterGain.connect(ctx.destination);

    // Harmonic partials for authentic bronze bell shimmer
    const partials = [
      { ratio: 1.0, amp: 1.0 },
      { ratio: 2.02, amp: 0.5 },
      { ratio: 3.01, amp: 0.25 },
      { ratio: 4.25, amp: 0.12 },
    ];

    partials.forEach((p) => {
      const osc = ctx.createOscillator();
      const pGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * p.ratio, now);

      pGain.gain.setValueAtTime(p.amp, now);
      pGain.gain.exponentialRampToValueAtTime(0.001, now + decay * 0.9);

      osc.connect(pGain);
      pGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + decay);
    });
  } catch (err) {
    console.warn('Audio chime playback failed:', err);
  }
}
