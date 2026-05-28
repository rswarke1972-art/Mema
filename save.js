// save.js – Handles persistence, autosave, slots, restart, replay

const SAVE_PREFIX = 'mema_save_';
const ACTIVE_SLOT_KEY = 'mema_active_slot';

/** Create a new empty slot */
export function createNewSlot(name) {
  const slotId = Date.now();
  const slotKey = SAVE_PREFIX + slotId;
  const emptyState = {
    name,
    timestamp: new Date().toISOString(),
    data: getDefaultGameState(),
  };
  localStorage.setItem(slotKey, JSON.stringify(emptyState));
  localStorage.setItem(ACTIVE_SLOT_KEY, slotKey);
  return slotKey;
}

/** Get currently active slot key */
export function getActiveSlot() {
  return localStorage.getItem(ACTIVE_SLOT_KEY);
}

/** Load state from a slot */
export function loadGameState(slotKey) {
  const raw = localStorage.getItem(slotKey);
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  if (parsed && parsed.data) {
    // replace global gameState
    window.gameState = parsed.data;
    return parsed.data;
  }
  return null;
}

/** Save current gameState to active slot */
export function saveGameState() {
  const slotKey = getActiveSlot();
  if (!slotKey) return;
  const payload = {
    name: 'Autosave',
    timestamp: new Date().toISOString(),
    data: window.gameState,
  };
  localStorage.setItem(slotKey, JSON.stringify(payload));
}

/** Autosave every 30 seconds */
function startAutoSave() {
  setInterval(saveGameState, 30000);
}

/** Restart the story – clears state but keeps slot */
export function restartStory() {
  window.gameState = getDefaultGameState();
  saveGameState();
  // reload page to start fresh UI
  location.reload();
}

/** Replay a specific chapter (by id) */
function replayChapter(chapterId) {
  // remove visited flag for that chapter and set as current
  const idx = window.gameState.visitedChapters.indexOf(chapterId);
  if (idx !== -1) window.gameState.visitedChapters.splice(idx, 1);
  window.gameState.currentChapterId = chapterId;
  saveGameState();
  // trigger chapter loader (app will listen to state change)
  const event = new CustomEvent('chapter-replay', { detail: { chapterId } });
  window.dispatchEvent(event);
}

/** Default initial state – mirrors what app.js uses initially */
function getDefaultGameState() {
  return {
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
    memory: {},
    unlockedLocations: [],
    visitedChapters: [],
    currentChapterId: null,
    currentSceneId: null,
    flags: {},
  };
}

// Initialise autosave when module loads
startAutoSave();


