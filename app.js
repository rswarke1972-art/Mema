// app.js – main bootstrap and PWA installation controller
import { loadGameState, saveGameState, getActiveSlot, getDefaultGameState } from './save.js';
import { initUI } from './settings.js';
import { startChapter } from './chapters.js';
import { initMusic, playAmbient } from './music.js';
import { initMobile } from './mobile.js';
import { initStatsUI } from './progress.js';

// Import tab-rendering modules dynamically
import { renderRelationshipsTab } from './relationships.js';
import { renderSavesTab } from './save.js';
import { renderGalleryTab } from './choices.js';
import { renderMusicRoomTab } from './music.js';
import { renderFlowchartTab } from './chapters.js';

// Global game state object (persisted via save.js)
export let gameState = getDefaultGameState();
window.gameState = gameState;

/**
 * Initialize the application.
 */
export async function initApp() {
  // 1️⃣ Load or create a save slot (Autosave slot 0 used by default)
  const slotKey = getActiveSlot();
  let loaded = false;
  if (slotKey) {
    const data = loadGameState(0); // always load from autosave first to resume
    if (data) {
      Object.assign(gameState, data);
      loaded = true;
    }
  }
  
  if (!loaded) {
    // first time user – initialize default state and save to slot 0
    Object.assign(gameState, getDefaultGameState());
    saveGameState(0);
  }

  // 2️⃣ Initialize UI settings, dynamic stats bars and mobile support
  initUI();
  initStatsUI();
  initMobile();

  // 3️⃣ Initialize music system and play default ambient if not muted
  initMusic();
  if (window.gameState.currentChapterId) {
    // Play appropriate location ambient
    if (window.gameState.currentChapterId === 'chapter4' || window.gameState.currentChapterId === 'chapter6') {
      playAmbient('ballroom');
    } else if (window.gameState.currentChapterId === 'chapter1' || window.gameState.currentChapterId === 'chapter2') {
      playAmbient('garden');
    } else {
      playAmbient('piano');
    }
  }

  // 4️⃣ Bootstrap PWA Service Worker
  registerServiceWorker();

  // 5️⃣ Bootstrap Journal Modal and tabs
  initJournal();

  // 6️⃣ Begin the story – if no chapter is active, start Chapter 1
  if (!gameState.currentChapterId) {
    startChapter('chapter1');
  } else {
    startChapter(gameState.currentChapterId);
  }
}

/**
 * Register Service Worker for offline play capability
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => {
          console.log('MEMA Service Worker registered successfully.');
        })
        .catch(err => {
          console.warn('MEMA Service Worker registration failed:', err);
        });
    });
  }

  // Handle PWA installation banner
  let deferredPrompt = null;
  const installBtn = document.getElementById('pwa-install-btn');

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) {
      installBtn.classList.remove('hidden');
    }
  });

  if (installBtn) {
    installBtn.addEventListener('click', () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(choiceResult => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Player installed MEMA PWA.');
        }
        deferredPrompt = null;
        installBtn.classList.add('hidden');
      });
    });
  }
}

/**
 * Setup Journal Modal, tabs navigation, and tab loaders
 */
function initJournal() {
  const modal = document.getElementById('journal-modal');
  const btn = document.getElementById('journal-btn');
  const closeBtn = document.getElementById('close-journal');
  
  if (!modal || !btn || !closeBtn) return;

  // Open modal
  btn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    // Default load active tab
    const activeTab = modal.querySelector('.tab-btn.active').getAttribute('data-tab');
    loadTabContent(activeTab);
  });

  // Close modal
  closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  // Tab switching
  modal.querySelectorAll('.tab-btn').forEach(tabBtn => {
    tabBtn.addEventListener('click', (e) => {
      modal.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      modal.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

      tabBtn.classList.add('active');
      const tabId = tabBtn.getAttribute('data-tab');
      const panel = document.getElementById(`tab-${tabId}`);
      if (panel) panel.classList.add('active');

      loadTabContent(tabId);
    });
  });
}

/**
 * Load tab content dynamically depending on which tab is open
 */
export function loadTabContent(tabId) {
  switch (tabId) {
    case 'log':
      renderChoicesLog();
      break;
    case 'saves':
      renderSavesTab();
      break;
    case 'relationships':
      renderRelationshipsTab();
      break;
    case 'gallery':
      renderGalleryTab();
      break;
    case 'music':
      renderMusicRoomTab();
      break;
    case 'flowchart':
      renderFlowchartTab();
      break;
  }
}

/**
 * Render the playthrough choices log (Book of Choices timeline)
 */
function renderChoicesLog() {
  const container = document.getElementById('choices-timeline');
  if (!container) return;

  const logs = window.gameState?.choiceLog || [];
  if (logs.length === 0) {
    container.innerHTML = '<p class="empty-msg" style="text-align:center; padding:2rem; color:var(--text-secondary);">No choices recorded yet. Make some decisions to fill your journal!</p>';
    return;
  }

  container.innerHTML = '';
  logs.forEach(log => {
    const node = document.createElement('div');
    node.className = 'timeline-node';
    node.innerHTML = `
      <div class="node-header">
        <span>Chapter ID: ${log.chapterId.toUpperCase()}</span>
      </div>
      <div class="node-context">speaker: ${log.speaker}</div>
      <div class="node-choice">
        <span>"${log.choiceText}"</span>
      </div>
    `;
    container.appendChild(node);
  });
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
