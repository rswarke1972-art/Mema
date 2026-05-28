// choices.js – renders choice buttons and applies consequences
import { updateStats, updateRelationship, addMemoryFlag } from './progress.js';

/**
 * Display a set of choices for the current dialogue node.
 * @param {Array} options – each option: { text, effects, nextId }
 *   effects: { stats?:{stat:delta}, relationships?:{char:delta}, memory?:{char:key:value} }
 * @param {HTMLElement} container – where to place the buttons
 * @param {Function} onChoice – callback after a choice is processed (to load next node)
 */
export function renderChoices(options, container, onChoice) {
  // clear previous choices
  container.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = opt.text;
    btn.addEventListener('click', () => {
      // Apply stat changes
      if (opt.effects?.stats) {
        Object.entries(opt.effects.stats).forEach(([k, v]) => updateStats(k, v));
      }
      // Apply relationship changes
      if (opt.effects?.relationships) {
        Object.entries(opt.effects.relationships).forEach(([char, delta]) => updateRelationship(char, delta));
      }
      // Record memory flags for later reference
      if (opt.effects?.memory) {
        Object.entries(opt.effects.memory).forEach(([char, memObj]) => {
          addMemoryFlag(char, memObj);
        });
      }
      // Proceed to next scene
onChoice(opt.nextScene);
    });
    container.appendChild(btn);
  });
}

// Export for testing

