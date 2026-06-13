// progress.js – manages stats, relationships, and memory flags

/**
 * Initialize stat bars dynamically in the footer stats-bar container.
 */
export function initStatsUI() {
  const container = document.getElementById('stats-bar');
  if (!container) return;
  container.innerHTML = '';

  const statsList = [
    { key: 'reputation', name: 'Reputation', icon: '👑' },
    { key: 'wisdom', name: 'Wisdom', icon: '🧠' },
    { key: 'pride', name: 'Pride', icon: '🦚' },
    { key: 'influence', name: 'Influence', icon: '✨' }
  ];

  statsList.forEach(s => {
    const el = document.createElement('div');
    el.className = 'stat';
    el.setAttribute('data-stat', s.key);
    
    const val = window.gameState?.stats?.[s.key] !== undefined ? window.gameState.stats[s.key] : 50;
    el.innerHTML = `
      <div class="stat-label">${s.icon} ${s.name}</div>
      <div class="stat-progress">
        <div class="fill" style="width: ${val}%"></div>
      </div>
    `;
    container.appendChild(el);
  });
}

/** Update a stat by delta, clamped between 0 and 100 */
export function updateStats(statKey, delta) {
  if (!window.gameState) return;
  if (!window.gameState.stats) window.gameState.stats = {};
  if (!window.gameState.stats.hasOwnProperty(statKey)) {
    window.gameState.stats[statKey] = 50;
  }
  const newVal = Math.min(100, Math.max(0, window.gameState.stats[statKey] + delta));
  window.gameState.stats[statKey] = newVal;
  
  // Update UI bar if exists
  const bar = document.querySelector(`.stat[data-stat="${statKey}"] .fill`);
  if (bar) bar.style.width = `${newVal}%`;
}

/** 
 * Update relationship affection or trust.
 * Maps capitalized, spaced story keys to lowercase normalized keys.
 */
export function updateRelationship(charName, delta, type = 'affection') {
  if (!window.gameState || !charName) return;
  if (!window.gameState.relationships) window.gameState.relationships = {};

  // Normalize name key: "Sir Edwin" -> "siredwin", "Eleanor" -> "eleanor"
  let key = charName.toLowerCase().replace(/\s+/g, '');
  if (key === 'elleanor') key = 'eleanor'; // unify spelling issues
  if (key === 'narrator' || key === 'system') return; // ignore helper speakers

  // Initialize character state if not exists
  if (!window.gameState.relationships[key]) {
    window.gameState.relationships[key] = { affection: 0, trust: 0 };
  } else if (typeof window.gameState.relationships[key] === 'number') {
    // Migrate old flat relationship number to object structure
    window.gameState.relationships[key] = { 
      affection: window.gameState.relationships[key], 
      trust: 0 
    };
  }

  const currentVal = window.gameState.relationships[key][type] || 0;
  const newVal = Math.min(100, Math.max(0, currentVal + delta));
  window.gameState.relationships[key][type] = newVal;

  // Update UI bar if it exists in the active Journal tab
  const bar = document.querySelector(`.relationship-bars .save-slot-card[data-char="${key}"] .fill-${type}`);
  if (bar) bar.style.width = `${newVal}%`;
}

/** Store memory flag for a character – e.g., { kind: true, trust: 45 } */
export function addMemoryFlag(charKey, memObj) {
  if (!window.gameState) return;
  if (!window.gameState.memory) {
    window.gameState.memory = {};
  }
  let key = charKey.toLowerCase().replace(/\s+/g, '');
  if (key === 'elleanor') key = 'eleanor';
  
  if (!window.gameState.memory[key]) {
    window.gameState.memory[key] = {};
  }
  Object.assign(window.gameState.memory[key], memObj);
}

/** Retrieve memory for token resolution */
export function getMemory(charKey) {
  if (!window.gameState || !window.gameState.memory) return {};
  let key = charKey.toLowerCase().replace(/\s+/g, '');
  if (key === 'elleanor') key = 'eleanor';
  return window.gameState.memory[key] || {};
}
