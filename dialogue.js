// dialogue.js – Handles displaying dialogue lines with typewriter animation and speaker info
import { playSound } from './utils.js';

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

  // Clear previous dialogue inside container
  container.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'dialogue-card';
  card.innerHTML = `
    <span class="speaker-name">${speaker}</span>
    <p class="dialogue-text"></p>
  `;
  container.appendChild(card);

  const textElem = card.querySelector('.dialogue-text');
  
  // Use text speed setting from configuration, default to 30ms per char
  const textSpeedSetting = window.MEMA?.TEXT_SPEED;
  const typeSpeed = (textSpeedSetting !== undefined) ? textSpeedSetting : 30;

  let i = 0;
  let sfxCounter = 0;

  function type() {
    if (i < resolvedText.length) {
      textElem.textContent += resolvedText.charAt(i);
      i++;
      
      // Play mechanical typewriter sound every 2 characters to sound natural
      if (sfxCounter % 2 === 0) {
        playSound('typewriter');
      }
      sfxCounter++;
      
      setTimeout(type, typeSpeed);
    } else {
      // Small pause after typing finishes, then trigger completion callback
      setTimeout(() => onComplete && onComplete(), 150);
    }
  }

  type();
}

/**
 * Replace {{memory:key:character}} tokens with appropriate phrasing based on stored memory.
 * Example token: {{memory:trust:Theodore}}
 */
function resolveMemoryTokens(text) {
  if (!text) return '';
  return text.replace(/{{memory:([^:}]+):([^}]+)}}/g, (match, type, character) => {
    let key = character.toLowerCase().replace(/\s+/g, '');
    if (key === 'elleanor') key = 'eleanor';

    // Retrieve relationship object from state
    let rel = window.gameState?.relationships?.[key] || {};
    if (typeof rel === 'number') {
      rel = { affection: rel, trust: 0 };
    }

    switch (type) {
      case 'trust':
        const trustVal = rel.trust || 0;
        return trustVal >= 60 ? 'trusts you implicitly' : trustVal >= 30 ? 'seems cautious' : 'distrusts you';
      case 'affection':
        const affVal = rel.affection || 0;
        return affVal >= 60 ? 'looks at you warmly' : affVal >= 30 ? 'acknowledges you politely' : 'keeps their distance';
      case 'kind':
        // Check flags or general relationship
        return (window.gameState?.flags?.[`${key}_kindness`] || (rel.affection > 40)) 
          ? 'remembers your kindness' 
          : 'has yet to see your gentle side';
      default:
        return '';
    }
  });
}

// Export for testing
export { resolveMemoryTokens };
