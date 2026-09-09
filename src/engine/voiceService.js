/**
 * Centralized Voice Service for Nexus Resilience Platform
 * Provides consistent, natural, executive AI narration across all modules,
 * with system-wide enable/mute control.
 */

let selectedVoice = null;
let voicesLoaded = false;

// Global Voice State with localStorage persistence
let isVoiceEnabled = true;
try {
  const saved = localStorage.getItem('nexus_voice_enabled');
  if (saved !== null) isVoiceEnabled = JSON.parse(saved);
} catch {}

const listeners = new Set();

function notifyListeners() {
  listeners.forEach(cb => {
    try { cb(isVoiceEnabled); } catch {}
  });
}

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
   * Check if system-wide voice mode is enabled
   */
  isEnabled() {
    return isVoiceEnabled;
  },

  /**
   * Set system-wide voice state
   */
  setEnabled(enabled) {
    isVoiceEnabled = Boolean(enabled);
    try {
      localStorage.setItem('nexus_voice_enabled', JSON.stringify(isVoiceEnabled));
    } catch {}
    if (!isVoiceEnabled) {
      this.stop();
    }
    notifyListeners();
    return isVoiceEnabled;
  },

  /**
   * Toggle system-wide voice state
   */
  toggle() {
    return this.setEnabled(!isVoiceEnabled);
  },

  /**
   * Subscribe to global voice state changes
   */
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

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
    // If voice mode is globally disabled, silently ignore
    if (!isVoiceEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      // Cancel any ongoing speech to avoid overlapping
      window.speechSynthesis.cancel();

      // Clean up text formatting and normalize phonetics for natural speech synthesis
      const cleaned = text
        .replace(/₹/g, '')
        .replace(/\bCr\b/g, 'crore')
        .replace(/\boptimised\b/gi, 'optimized')
        .replace(/\bEDI\b/g, 'E D I')
        .replace(/[-–—]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleaned);
      const voice = this.getVoice();
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || 'en-US';
      } else {
        utterance.lang = 'en-US';
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
    if (!isVoiceEnabled) return;
    const cleanName = (nodeName || 'Target Corridor').split('(')[0].trim();
    const cleanRisk = typeof riskAmountCr === 'number' ? riskAmountCr.toFixed(1) : riskAmountCr;
    const text = `Corridor disruption alert at ${cleanName}. Estimated regional value at risk: ${cleanRisk} crore. Simulating multi-modal failover.`;
    this.speak(text, callbacks);
  },

  /**
   * Standardized Simulation Reset speech announcement
   */
  announceReset(callbacks = {}) {
    if (!isVoiceEnabled) return;
    this.speak('Regional lifeline network restored to nominal baseline.', callbacks);
  }
};
