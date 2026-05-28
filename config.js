// config.js – Global configuration and theme constants

window.MEMA = window.MEMA || {};

MEMA.CONFIG = {
  // Breakpoints (px)
  BREAKPOINTS: {
    SMALL: 360,
    MEDIUM: 768,
    LARGE: 1024,
  },
  // Text speed (ms per character)
  TEXT_SPEED: {
    SLOW: 80,
    MEDIUM: 50,
    FAST: 30,
  },
  // Theme palettes
  THEMES: {
    LIGHT: "light",
    DARK: "dark",
  },
  // Audio asset map (placeholder URLs – will be replaced with real files later)
  AUDIO: {
    PIANO: "assets/audio/piano.mp3",
    VIOLIN: "assets/audio/violin.mp3",
    BALLROOM: "assets/audio/ballroom.mp3",
    GARDEN: "assets/audio/garden.mp3",
    RAIN: "assets/audio/rain.mp3",
  },
};

// Helper to apply theme

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("mema_theme", theme);
}
MEMA.applyTheme = applyTheme;
export { applyTheme };

// Load saved theme on start
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("mema_theme") || MEMA.CONFIG.THEMES.LIGHT;
  MEMA.applyTheme(savedTheme);
});
