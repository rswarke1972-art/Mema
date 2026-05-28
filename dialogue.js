// dialogue.js – Handles displaying dialogue lines with typewriter animation and speaker info
import { playSound } from './utils.js';

// Configuration
const TYPE_SPEED = 30; // ms per character, can be overridden via settings

/**
 * Render a single dialogue line.
 * @param {Object} params
 * @param {string} params.speaker – character key (e.g., 'Mema', 'Theodore')
 * @param {string} params.text – raw dialogue text (may contain {{memory}} tokens)
 * @param {HTMLElement} params.container – DOM element where the line will be appended
 * @param {Function} params.onComplete – callback when typing finishes (used to show choices)
 */
export function renderDialogue({ speaker, text, container, onComplete }) {
  // Resolve memory tokens like {{memory:trust:Theodore}}
  const resolvedText = resolveMemoryTokens(text);

  const lineElem = document.createElement('div');
  lineElem.className = 'dialogue-line';
  lineElem.innerHTML = `<span class="speaker-name">${speaker}</span>: <span class="dialogue-text"></span>`;
  container.appendChild(lineElem);
  const textElem = lineElem.querySelector('.dialogue-text');

  let i = 0;
  function type() {
    if (i < resolvedText.length) {
      textElem.textContent += resolvedText.charAt(i);
      i++;
      setTimeout(type, TYPE_SPEED);
    } else {
      // small pause then callback
      setTimeout(() => onComplete && onComplete(lineElem), 200);
    }
  }
  // optional sound per character
  playSound('typewriter');
  type();
}

/**
 * Replace {{memory:key:character}} tokens with appropriate phrasing based on stored memory.
 * Example token: {{memory:trust:Theodore}}
 */
function resolveMemoryTokens(text) {
  return text.replace(/{{memory:([^:}]+):([^}]+)}}/g, (match, type, character) => {
    const mem = window.gameMemory?.[character] || {};
    switch (type) {
      case 'trust':
        return mem.trust >= 70 ? 'trusts you implicitly' : mem.trust >= 40 ? 'seems cautious' : 'distrusts you';
      case 'kind':
        return mem.kind ? 'remembers your kindness' : 'has yet to see your gentle side';
      default:
        return '';
    }
  });
}

// Export for testing
export { resolveMemoryTokens };
