// relationships.js – tracks affection, trust, and dynamic memory flags
// Global gameState is defined in app.js
export const Relationship = {
  // initial values
  Theodore: { affection: 0, trust: 0 },
  Lucien: { affection: 0, trust: 0 },
  Eleanor: { affection: 0, trust: 0 },
  Clara: { affection: 0, trust: 0 },
  Vivienne: { affection: 0, trust: 0 },
};

/**
 * Adjust affection and trust for a character.
 * @param {string} name - character name
 * @param {number} affDelta - change in affection (±)
 * @param {number} trustDelta - change in trust (±)
 */
export function modifyRelationship(name, affDelta = 0, trustDelta = 0) {
  const rel = Relationship[name];
  if (!rel) return;
  rel.affection = Math.max(0, Math.min(100, rel.affection + affDelta));
  rel.trust = Math.max(0, Math.min(100, rel.trust + trustDelta));
  // store as memory flag for later dialogues
  if (!gameState.memory) gameState.memory = {};
  if (!gameState.memory.relationships) gameState.memory.relationships = {};
  gameState.memory.relationships[name] = {
    affection: rel.affection,
    trust: rel.trust,
  };
}

/**
 * Retrieve relationship data (affection, trust).
 */
export function getRelationship(name) {
  return Relationship[name] || null;
}

/**
 * Evaluate if a character trusts the player enough for a special scene.
 */
export function hasTrust(name, threshold = 50) {
  const rel = getRelationship(name);
  return rel && rel.trust >= threshold;
}

/**
 * UI helper – refresh displayed bars.
 */
export function renderRelationshipBars() {
  const container = document.getElementById('relationship-bars');
  if (!container) return;
  container.innerHTML = '';
  Object.entries(Relationship).forEach(([name, { affection, trust }]) => {
    const bar = document.createElement('div');
    bar.className = 'rel-bar';
    bar.innerHTML = `
      <span class="rel-name">${name}</span>
      <div class="affection-bar bar"><div style="width:${affection}%"></div></div>
      <div class="trust-bar bar"><div style="width:${trust}%"></div></div>
    `;
    container.appendChild(bar);
  });
}

// Export for external modules
export default Relationship;
