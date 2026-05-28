// progress.js – manages stats, relationships, and memory flags

// Global gameState defined in app.js (imported via window)

/** Update a stat by delta, clamped between 0 and 100 */
export function updateStats(statKey, delta) {
  if (!window.gameState.stats.hasOwnProperty(statKey)) return;
  const newVal = Math.min(100, Math.max(0, window.gameState.stats[statKey] + delta));
  window.gameState.stats[statKey] = newVal;
  // Update UI bar if exists
  const bar = document.querySelector(`.stat[data-stat="${statKey}"] .fill`);
  if (bar) bar.style.width = `${newVal}%`;
}

/** Update relationship affection */
export function updateRelationship(charKey, delta) {
  if (!window.gameState.relationships.hasOwnProperty(charKey)) return;
  const newVal = Math.min(100, Math.max(0, window.gameState.relationships[charKey] + delta));
  window.gameState.relationships[charKey] = newVal;
  // Optionally update UI
  const relBar = document.querySelector(`.relationship[data-char="${charKey}"] .fill`);
  if (relBar) relBar.style.width = `${newVal}%`;
}

/** Store memory flag for a character – e.g., { kind: true, trust: 45 } */
export function addMemoryFlag(charKey, memObj) {
  if (!window.gameState.memory[charKey]) {
    window.gameState.memory[charKey] = {};
  }
  Object.assign(window.gameState.memory[charKey], memObj);
}

/** Retrieve memory for token resolution */
export function getMemory(charKey) {
  return window.gameState.memory[charKey] || {};
}

// Export for testing

