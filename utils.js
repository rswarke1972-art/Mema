// utils.js – shared helper utilities (extended with audio functions)

window.MEMA = window.MEMA || {};

MEMA.utils = {
  // Deep clone an object/array
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },
  // Simple debounce
  debounce(func, wait) {
    let timeout;
    return function (...args) {
      const later = () => {
        timeout = null;
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  // Random integer inclusive
  randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  // Helper to create an element with classes and attributes
  createEl(tag, { classes = [], attrs = {}, text = '' } = {}) {
    const el = document.createElement(tag);
    classes.forEach(c => el.classList.add(c));
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    if (text) el.textContent = text;
    return el;
  },
  // Typewriter effect (returns a Promise)
  typewriter(element, text, speed) {
    return new Promise(resolve => {
      let i = 0;
      const interval = setInterval(() => {
        element.textContent += text.charAt(i);
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          resolve();
        }
      }, speed);
    });
  },
  // Save to localStorage with JSON safety
  save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },
  load(key) {
    const str = localStorage.getItem(key);
    return str ? JSON.parse(str) : null;
  },
  // ------- Audio helpers -------
  /**
   * Play a short sound effect (e.g., typewriter click).
   */
  playSound(name) {
    if (name === 'typewriter') {
      // Synthesize a beautiful typewriter keystroke click using Web Audio API
      try {
        const audioCtx = window.MEMA?.AUDIO_CONTEXT || new (window.AudioContext || window.webkitAudioContext)();
        if (!window.MEMA.AUDIO_CONTEXT) {
          window.MEMA.AUDIO_CONTEXT = audioCtx;
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
        
        // Setup oscillator and envelope for a crisp keyboard mechanical click
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'triangle';
        // Randomize pitch slightly for organic typing sound
        const pitch = 250 + Math.random() * 80;
        osc.frequency.setValueAtTime(pitch, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.04);
        
        gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.04);
      } catch (err) {
        console.warn('Typewriter click synth failed:', err);
      }
      return;
    }

    const url = window.MEMA?.CONFIG?.AUDIO?.[name.toUpperCase()];
    if (!url) return;
    const audio = new Audio(url);
    audio.volume = 0.25;
    audio.play().catch(err => {
      // Autoplay blocked is handled silently
    });
  },
  /**
   * General purpose audio player (returns the Audio object for control).
   */
  playAudio(url, { loop = false, volume = 0.5 } = {}) {
    const audio = new Audio(url);
    audio.loop = loop;
    audio.volume = volume;
    audio.play().catch(err => {
      // Autoplay blocked is handled silently
    });
    return audio;
  },
  stopAudio(audio) {
    if (audio && typeof audio.pause === 'function') {
      audio.pause();
      audio.currentTime = 0;
    }
  },
};

// Export named functions for ES‑module imports
export const {
  deepClone,
  debounce,
  randInt,
  createEl,
  typewriter,
  save,
  load,
  playSound,
  playAudio,
  stopAudio,
} = MEMA.utils;
