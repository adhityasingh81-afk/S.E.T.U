/**
 * Centralized Voice Service for Nexus Resilience Platform
 * Provides consistent, natural, executive AI narration across all modules.
 */

let selectedVoice = null;
let voicesLoaded = false;

// Curated list of premium, natural-sounding English voice models
const PREFERRED_VOICE_NAMES = [
  'Samantha (Enhanced)',
  'Samantha',
  'Ava (Enhanced)',
  'Ava (Premium)',
  'Ava',
  'Google US English',
  'Microsoft Jenny Online (Natural) - English (United States)',
  'Microsoft Aria Online (Natural) - English (United States)',
  'Karen (Enhanced)',
  'Karen',
  'Daniel (Enhanced)',
  'Daniel',
  'Serena',
  'Victoria',
  'Moira',
  'Tessa',
  'Alex'
];

function selectBestVoice(voices) {
  if (!voices || voices.length === 0) return null;

  // 1. Look for preferred named natural voices
  for (const preferred of PREFERRED_VOICE_NAMES) {
    const match = voices.find(v => v.name === preferred || v.name.includes(preferred));
    if (match) return match;
  }

  // 2. Look for any Enhanced or Natural English voice
  const enhancedVoice = voices.find(v =>
    v.lang.startsWith('en') &&
    (v.name.toLowerCase().includes('enhanced') ||
     v.name.toLowerCase().includes('natural') ||
     v.name.toLowerCase().includes('premium'))
  );
  if (enhancedVoice) return enhancedVoice;

  // 3. Look for Google English voice
  const googleVoice = voices.find(v =>
    v.lang.startsWith('en') && v.name.toLowerCase().includes('google')
  );
  if (googleVoice) return googleVoice;

  // 4. Default to en-US or any English voice
  const enUs = voices.find(v => v.lang === 'en-US') || voices.find(v => v.lang.startsWith('en'));
  return enUs || voices[0];
}

function loadVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    selectedVoice = selectBestVoice(voices);
    voicesLoaded = true;
  }
}

// Preload voices immediately and listen for changes
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

export const voiceService = {
  /**
   * Get the active curated voice model
   */
  getVoice() {
    if (!selectedVoice && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      loadVoices();
    }
    return selectedVoice;
  },

  /**
   * Speak a text phrase with consistent executive audio characteristics
   */
  speak(text, { onStart, onEnd, onError, rate = 0.98, pitch = 1.0 } = {}) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      // Cancel any ongoing speech to avoid overlapping
      window.speechSynthesis.cancel();

      // Clean up text formatting for natural speech synthesis
      const cleaned = text
        .replace(/₹/g, '')
        .replace(/\bCr\b/g, 'crore')
        .replace(/[-–—]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleaned);
      const voice = this.getVoice();
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || 'en-US';
      }

      utterance.rate = rate;     // Natural, composed cadence
      utterance.pitch = pitch;   // Natural vocal resonance
      utterance.volume = 1.0;

      if (onStart) utterance.onstart = onStart;
      if (onEnd) utterance.onend = onEnd;
      if (onError) utterance.onerror = onError;

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[voiceService] Speech synthesis error:', err);
      if (onError) onError(err);
    }
  },

  /**
   * Stop any current speech playback
   */
  stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },

  /**
   * Standardized Fracture Mode speech announcement
   */
  announceFracture(nodeName, riskAmountCr, callbacks = {}) {
    const cleanName = (nodeName || 'Target Node').split('(')[0].trim();
    const cleanRisk = typeof riskAmountCr === 'number' ? riskAmountCr.toFixed(1) : riskAmountCr;
    const text = `Fracture simulation initiated at ${cleanName}, estimated revenue risk - ${cleanRisk} crore`;
    this.speak(text, callbacks);
  },

  /**
   * Standardized Simulation Reset speech announcement
   */
  announceReset(callbacks = {}) {
    this.speak('Simulation reset.', callbacks);
  }
};
