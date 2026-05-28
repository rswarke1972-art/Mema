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
   * @param {string} name - identifier from MEMA.CONFIG.AUDIO or custom.
   */
  playSound(name) {
    const url = MEMA.CONFIG.AUDIO[name];
    if (!url) return;
    const audio = new Audio(url);
    audio.volume = 0.3;
    startButton.addEventListener("click", () => {
   audio.play();
});
  },
  /**
   * General purpose audio player (returns the Audio object for control).
   */
  playAudio(url, { loop = false, volume = 0.5 } = {}) {
    const audio = new Audio(url);
    audio.loop = loop;
    audio.volume = volume;
    startButton.addEventListener("click", () => {
   audio.play();
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
