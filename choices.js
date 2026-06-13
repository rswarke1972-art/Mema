// choices.js – renders choice buttons and applies consequences
import { updateStats, updateRelationship } from './progress.js';
import { unlockAchievement } from './achievements.js';

/**
 * Display a set of choices for the current dialogue node.
 * @param {Array} options – each option: { text, effects, nextScene }
 * @param {HTMLElement} container – where to place the buttons (the main container)
 * @param {Function} onChoice – callback after a choice is processed (to load next node)
 * @param {string} speaker - the speaker character name of the current scene
 */
export function renderChoices(options, container, onChoice, speaker) {
  // Check if a choices sub-container already exists; if not, create it
  let choicesWrap = container.querySelector('.choices-container');
  if (choicesWrap) {
    choicesWrap.innerHTML = '';
  } else {
    choicesWrap = document.createElement('div');
    choicesWrap.className = 'choices-container';
    container.appendChild(choicesWrap);
  }

  options.forEach(opt => {
    // Dynamic Ending Branching Filters for Chapter 10 climax
    if (window.gameState?.currentSceneId === 'c10s1') {
      const stats = window.gameState.stats || {};
      const rels = window.gameState.relationships || {};
      
      if (opt.text.includes('Theodore')) {
        const theodoreAff = rels.theodore?.affection || 0;
        if (theodoreAff < 50) return;
      } else if (opt.text.includes('Lucien')) {
        const lucienAff = rels.lucien?.affection || 0;
        if (lucienAff < 50) return;
      } else if (opt.text.includes('independent')) {
        if ((stats.wisdom || 0) < 40) return;
      } else if (opt.text.includes('leader')) {
        if ((stats.reputation || 0) < 60) return;
      } else if (opt.text.includes('pride dominate')) {
        if ((stats.pride || 0) < 50) return;
      } else if (opt.text.includes('matchmaker')) {
        if ((stats.friendship || 0) < 50) return;
      } else if (opt.text.includes('scandal')) {
        if ((stats.reputation || 0) >= 40) return;
      } else if (opt.text.includes('Challenge Vivienne')) {
        const vivienneAff = rels.vivienne?.affection || 0;
        if (vivienneAff >= 40) return;
      }
    }

    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = opt.text;
    btn.addEventListener('click', () => {
      // 1️⃣ Record choice log in gameState for the Book of Choices
      if (!window.gameState.choiceLog) window.gameState.choiceLog = [];
      window.gameState.choiceLog.push({
        chapterId: window.gameState.currentChapterId,
        sceneId: window.gameState.currentSceneId,
        speaker: speaker || 'Narrator',
        choiceText: opt.text
      });

      // 2️⃣ Apply consequences
      if (opt.effects) {
        Object.entries(opt.effects).forEach(([key, val]) => {
          if (key === 'relationships') {
            // Apply relationship affection updates
            Object.entries(val).forEach(([char, delta]) => {
              updateRelationship(char, delta, 'affection');
            });
          } else if (key === 'trust') {
            // Apply relationship trust update to current speaker
            updateRelationship(speaker, val, 'trust');
          } else if (key === 'memoryTags') {
            // Apply story flag tags
            if (Array.isArray(val)) {
              val.forEach(tag => {
                window.gameState.flags[tag] = true;
                
                // Dynamic CG and Achievement unlocking logic based on tags
                if (tag === 'accepted_edwin_stroll') {
                  unlockCG('garden_walk');
                } else if (tag === 'danced_theodore' || tag === 'ballroom_theodore') {
                  unlockCG('first_dance');
                  unlockAchievement('first_dance');
                } else if (tag === 'danced_lucien' || tag === 'ballroom_lucien') {
                  unlockCG('first_dance');
                  unlockAchievement('first_dance');
                  // Lucien path unlocked ballroom track
                  unlockMusicTrack('ballroom');
                } else if (tag === 'forgave_lucien') {
                  unlockCG('confession');
                }
              });
            }
          } else if (key === 'ending') {
            // Register selected ending
            window.gameState.ending = val;
          } else {
            // Update numeric stats: reputation, pride, influence, wisdom
            updateStats(key, val);
          }
        });
      }

      // 3️⃣ Proceed to next scene via handler
      onChoice(opt.nextScene);
    });
    choicesWrap.appendChild(btn);
  });
}

/**
 * Unlock a CG illustration and show a toast.
 */
export function unlockCG(cgId) {
  if (!window.gameState) return;
  if (!window.gameState.unlockedCGs) window.gameState.unlockedCGs = [];
  if (!window.gameState.unlockedCGs.includes(cgId)) {
    window.gameState.unlockedCGs.push(cgId);
    showToast('CG Unlocked: ' + capitalize(cgId.replace('_', ' ')), '🖼️');
  }
}

/**
 * Unlock a music track and show a toast.
 */
export function unlockMusicTrack(trackId) {
  if (!window.gameState) return;
  if (!window.gameState.unlockedMusic) window.gameState.unlockedMusic = ['piano', 'violin']; // default
  if (!window.gameState.unlockedMusic.includes(trackId)) {
    window.gameState.unlockedMusic.push(trackId);
    showToast('Soundtrack Unlocked: ' + capitalize(trackId), '🎵');
  }
}

/**
 * Display a premium notification toast.
 */
function showToast(message, icon = '✨') {
  const toast = document.createElement("div");
  toast.className = "achievement-toast";
  toast.innerHTML = `
    <div style="font-size: 24px; padding: 2px;">${icon}</div>
    <div style="display:flex; flex-direction:column;">
      <span style="font-size: 0.65rem; text-transform: uppercase; font-weight:600; color:var(--text-secondary);">Unlock Reward</span>
      <span style="font-size: 0.95rem; font-weight:700; color:var(--color-gold-accent);">${message}</span>
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.4s ease forwards';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

function capitalize(str) {
  if (!str) return '';
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/**
 * Render the CG Gallery tab and bootstrap lightbox controls
 */
export function renderGalleryTab() {
  const container = document.getElementById('cg-gallery-grid');
  if (!container) return;
  container.innerHTML = '';
  
  const cgs = [
    { id: 'garden_walk', name: 'Garden Walk', desc: 'A stroll in Rosemere Gardens' },
    { id: 'first_dance', name: 'First Dance', desc: 'A romantic ball dance step' },
    { id: 'confession', name: 'Confession', desc: 'An emotional heartbeat moment' },
    { id: 'finale', name: 'Finale', desc: 'Emma\'s wedding celebration' }
  ];
  
  const unlocked = window.gameState?.unlockedCGs || [];
  
  cgs.forEach(cg => {
    const isUnlocked = unlocked.includes(cg.id);
    const card = document.createElement('div');
    card.className = `gallery-card ${isUnlocked ? '' : 'locked'}`;
    
    card.innerHTML = `
      <img src="assets/images/${cg.id}.png" class="gallery-img" alt="${cg.name}"/>
      <div class="gallery-overlay">
        <span class="cg-lock-icon">${isUnlocked ? '👁️' : '🔒'}</span>
        <span class="cg-title">${isUnlocked ? cg.name : 'Locked CG'}</span>
        <span style="font-size:0.6rem; color:#eee; text-align:center; padding: 0 4px;">${isUnlocked ? cg.desc : 'Unlocked via choices'}</span>
      </div>
    `;
    
    if (isUnlocked) {
      card.addEventListener('click', () => {
        openLightbox(`assets/images/${cg.id}.png`);
      });
    }
    container.appendChild(card);
  });
}

function openLightbox(src) {
  const lightbox = document.getElementById('lightbox-modal');
  const img = document.getElementById('lightbox-img');
  const close = document.getElementById('close-lightbox');
  
  if (!lightbox || !img) return;
  img.src = src;
  lightbox.classList.remove('hidden');
  
  const closeHandler = () => {
    lightbox.classList.add('hidden');
    close.removeEventListener('click', closeHandler);
    lightbox.removeEventListener('click', closeHandler);
  };
  
  close.addEventListener('click', closeHandler);
  lightbox.addEventListener('click', closeHandler);
}
