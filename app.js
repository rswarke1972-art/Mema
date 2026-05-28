// app.js – main bootstrap
// This file initializes the game, loads saved state, and starts the first chapter.

import { loadGameState, saveGameState, getActiveSlot, createNewSlot } from './save.js';
import { initUI } from './settings.js';
import { applyTheme } from './config.js';
import { startChapter } from './chapters.js';
import { initMusic } from './music.js';
import { initMobile } from './mobile.js';

// Global game state object (will be persisted via save.js)
export let gameState = {
  stats: {
    romance: 50,
    reputation: 50,
    wisdom: 50,
    friendship: 50,
    influence: 50,
    pride: 30,
  },
  relationships: {
    theodore: 0,
    lucien: 0,
    elleanor: 0,
    clara: 0,
    vivienne: 0,
  },
  memory: {
    // e.g., { theodore: { trust: 0, lastLie: false } }
  },
  unlockedLocations: [],
  visitedChapters: [],
  currentChapterId: null,
  currentSceneId: null,
  flags: {}, // generic flags for story branching
};

/**
 * Initialize the application.
 */
export async function initApp() {
  // 1️⃣ Load or create a save slot (autosave slot 0 used by default)
  const slot = getActiveSlot();
  if (slot) {
    const loaded = loadGameState(slot);
    if (loaded) Object.assign(gameState, loaded);
  } else {
    // first time user – create default slot
    createNewSlot('Autosave');
  }

  // 2️⃣ Apply saved theme and UI settings
  initUI();


  // 3️⃣ Initialise music system (respect toggle)
  initMusic();

  // 4️⃣ Mobile helpers (orientation, viewport fixes)
  initMobile();

  // 5️⃣ Begin the story – if no chapter is active, start Chapter 1
  if (!gameState.currentChapterId) {
    startChapter('chapter1');
  } else {
    // resume where left off – handled inside startChapter internally
    startChapter(gameState.currentChapterId);
  }
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
