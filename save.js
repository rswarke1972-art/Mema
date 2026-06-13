// save.js – Handles persistence, autosave, slots, restart, replay
import { storyData } from './chapters.js';

const SAVE_PREFIX = 'mema_save_slot_';
const ACTIVE_SLOT_KEY = 'mema_active_slot';

/** Expose default initial state */
export function getDefaultGameState() {
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
      theodore: { affection: 0, trust: 0 },
      lucien: { affection: 0, trust: 0 },
      eleanor: { affection: 0, trust: 0 },
      clara: { affection: 0, trust: 0 },
      vivienne: { affection: 0, trust: 0 },
      siredwin: { affection: 0, trust: 0 },
    },
    memory: {},
    unlockedLocations: [],
    visitedChapters: [],
    currentChapterId: null,
    currentSceneId: null,
    flags: {},
    choiceLog: [],       // timeline record
    unlockedCGs: [],     // gallery record
    unlockedMusic: ['piano', 'violin'], // default ambient tracks
    ending: null         // chosen ending key
  };
}

/** Save current gameState to a specific slot (default to 0 for Autosave) */
export function saveGameState(slotId = 0) {
  if (!window.gameState) return;
  
  const slotKey = SAVE_PREFIX + slotId;
  const chapterId = window.gameState.currentChapterId;
  const chapterTitle = storyData?.chapterMap?.[chapterId]?.title || 'Prologue';
  
  const payload = {
    slotId,
    timestamp: new Date().toISOString(),
    chapterTitle: chapterTitle,
    chapterId: chapterId,
    sceneId: window.gameState.currentSceneId,
    data: window.gameState,
  };
  
  localStorage.setItem(slotKey, JSON.stringify(payload));
  if (slotId !== 0) {
    localStorage.setItem(ACTIVE_SLOT_KEY, slotKey);
  }
}

/** Load state from a slot and trigger a chapter reload */
export function loadGameState(slotId) {
  const slotKey = SAVE_PREFIX + slotId;
  const raw = localStorage.getItem(slotKey);
  if (!raw) return null;
  
  const parsed = JSON.parse(raw);
  if (parsed && parsed.data) {
    // Merge loaded data with default structure to prevent compatibility errors
    const defaultState = getDefaultGameState();
    
    // Perform migrations if old save formats are loaded
    if (parsed.data.relationships) {
      Object.entries(parsed.data.relationships).forEach(([k, v]) => {
        if (typeof v === 'number') {
          parsed.data.relationships[k] = { affection: v, trust: 0 };
        }
      });
    }

    window.gameState = Object.assign(defaultState, parsed.data);
    
    if (slotId !== 0) {
      localStorage.setItem(ACTIVE_SLOT_KEY, slotKey);
      // Also update Autosave (slot 0) to align with loaded slot
      saveGameState(0);
    }
    
    // Trigger chapter-replay event in chapters.js to reload the scene
    const event = new CustomEvent('chapter-replay', { 
      detail: { chapterId: window.gameState.currentChapterId } 
    });
    window.dispatchEvent(event);
    
    return window.gameState;
  }
  return null;
}

/** Retrieve metadata about a save slot (for UI rendering) */
export function getSlotMetadata(slotId) {
  const slotKey = SAVE_PREFIX + slotId;
  const raw = localStorage.getItem(slotKey);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return {
      timestamp: parsed.timestamp,
      chapterTitle: parsed.chapterTitle || 'Unknown',
      sceneId: parsed.sceneId || ''
    };
  } catch (e) {
    return null;
  }
}

/** Get currently active slot key */
export function getActiveSlot() {
  return localStorage.getItem(ACTIVE_SLOT_KEY) || (SAVE_PREFIX + '0');
}

/** Autosave every 30 seconds to slot 0 */
function startAutoSave() {
  setInterval(() => {
    if (window.gameState && window.gameState.currentChapterId) {
      saveGameState(0);
    }
  }, 30000);
}

/** Restart the story – clears state and slot 0 */
export function restartStory() {
  window.gameState = getDefaultGameState();
  saveGameState(0);
  location.reload();
}

/** Replay a specific chapter (by id) */
export function replayChapter(chapterId) {
  if (!window.gameState) return;
  // Remove visited flag for that chapter and any chapters after it
  const idx = window.gameState.visitedChapters.indexOf(chapterId);
  if (idx !== -1) {
    window.gameState.visitedChapters = window.gameState.visitedChapters.slice(0, idx + 1);
  }
  
  window.gameState.currentChapterId = chapterId;
  window.gameState.currentSceneId = null; // Let chapter start fresh
  
  // Wipe choice log items belonging to this chapter or later
  if (window.gameState.choiceLog) {
    window.gameState.choiceLog = window.gameState.choiceLog.filter(log => {
      // Keep only logs that are not in the replayed chapter
      return log.chapterId !== chapterId;
    });
  }

  saveGameState(0);
  
  const event = new CustomEvent('chapter-replay', { detail: { chapterId } });
  window.dispatchEvent(event);
}

// Initialize autosave when module loads
startAutoSave();

/**
 * Render the Saves UI tab, populating slot cards and binding save/load actions
 */
export function renderSavesTab() {
  const slots = [1, 2, 3, 0]; // 1, 2, 3 are manual, 0 is Autosave
  
  slots.forEach(slotId => {
    const card = document.querySelector(`.save-slot-card[data-slot="${slotId}"]`);
    if (!card) return;
    
    const meta = getSlotMetadata(slotId);
    const dateEl = card.querySelector('.slot-date');
    const infoEl = card.querySelector('.slot-meta');
    const loadBtn = card.querySelector('.btn-load');
    const saveBtn = card.querySelector('.btn-save');
    
    if (meta) {
      // Slot contains saved data
      const date = new Date(meta.timestamp);
      if (dateEl) dateEl.textContent = date.toLocaleString();
      if (infoEl) infoEl.textContent = `Scene: ${meta.sceneId.toUpperCase()} – "${meta.chapterTitle}"`;
      
      if (loadBtn) {
        loadBtn.classList.remove('disabled');
        loadBtn.removeAttribute('disabled');
        // Clear old listeners by cloning
        const newLoadBtn = loadBtn.cloneNode(true);
        loadBtn.parentNode.replaceChild(newLoadBtn, loadBtn);
        newLoadBtn.addEventListener('click', () => {
          loadGameState(slotId);
          // Hide modal
          document.getElementById('journal-modal').classList.add('hidden');
        });
      }
    } else {
      // Slot is empty
      if (dateEl) dateEl.textContent = slotId === 0 ? 'No Auto-Save' : 'Empty Slot';
      if (infoEl) infoEl.textContent = slotId === 0 ? 'System automatically saves your choices.' : 'No data recorded yet.';
      
      if (loadBtn) {
        loadBtn.classList.add('disabled');
        loadBtn.setAttribute('disabled', 'true');
      }
    }
    
    if (saveBtn) {
      // Bind save handler
      const newSaveBtn = saveBtn.cloneNode(true);
      saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
      newSaveBtn.addEventListener('click', () => {
        saveGameState(slotId);
        renderSavesTab(); // refresh UI
        
        // Show saved success toast
        const toast = document.createElement("div");
        toast.className = "achievement-toast";
        toast.innerHTML = `
          <div style="font-size: 24px; padding: 2px;">💾</div>
          <div style="display:flex; flex-direction:column;">
            <span style="font-size: 0.65rem; text-transform: uppercase; font-weight:600; color:var(--text-secondary);">System Save</span>
            <span style="font-size: 0.95rem; font-weight:700; color:var(--color-gold-accent);">State saved to Slot ${slotId}</span>
          </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
          toast.style.animation = 'fadeOut 0.4s ease forwards';
          setTimeout(() => toast.remove(), 400);
        }, 1500);
      });
    }
  });
}
