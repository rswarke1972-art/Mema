// endings.js – placeholder for ending handling logic
// This module provides functions to display endings based on game state.

/**
 * Show the ending screen with a title and description.
 * @param {string} title - The name of the ending.
 * @param {string} description - Narrative description of the ending.
 */
export function showEnding(title, description) {
  const root = document.getElementById('game-root');
  if (!root) return;
  root.innerHTML = `
    <section class="ending-screen fade-in">
      <h2 class="ending-title">${title}</h2>
      <p class="ending-description">${description}</p>
      <button id="restart-btn" class="btn-primary">Restart Story</button>
    </section>`;
  document.getElementById('restart-btn').addEventListener('click', () => {
    // Simple restart – clear state and reload
    localStorage.clear();
    location.reload();
  });
}

/**
 * Determine which ending to show based on relationships.
 * This is a very simple heuristic and can be expanded.
 */
export function resolveEnding() {
  const rel = window.gameState.relationships;
  // Example: highest relationship determines ending
  const maxChar = Object.keys(rel).reduce((a, b) => (rel[a] > rel[b] ? a : b));
  const score = rel[maxChar];
  let title = 'A New Beginning';
  let description = 'Your choices forged a future yet untold.';
  if (score >= 70) {
    title = `${capitalize(maxChar)}'s Eternal Promise`;
    description = `Through love and perseverance, ${maxChar} walks beside you into a bright future.`;
  } else if (score >= 40) {
    title = `A Promise of Hope`;
    description = `Your bond with ${maxChar} deepens, though challenges remain.`;
  } else {
    title = 'Paths Diverge';
    description = `The roads separate, leaving memories of what might have been.`;
  }
  showEnding(title, description);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
