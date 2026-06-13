// relationships.js – tracks character affection, trust, and renders progress screens
import { ACHIEVEMENTS } from './achievements.js';

export const Relationship = {
  Theodore: { key: 'theodore', icon: '🎩' },
  Lucien: { key: 'lucien', icon: '🦊' },
  Eleanor: { key: 'eleanor', icon: '🌸' },
  Clara: { key: 'clara', icon: '🎀' },
  Vivienne: { key: 'vivienne', icon: '🦚' }
};

/**
 * Render the Relationships and Achievements UI in the Journal tab
 */
export function renderRelationshipsTab() {
  const container = document.getElementById('relationship-bars');
  if (!container) return;
  
  container.innerHTML = '';
  
  // 1️⃣ Render Character Affection & Trust dual-bars
  const title = document.createElement('h3');
  title.style.fontSize = '1.2rem';
  title.style.marginBottom = '1rem';
  title.textContent = 'Character Affection & Trust';
  container.appendChild(title);
  
  const barsContainer = document.createElement('div');
  barsContainer.className = 'relationship-bars-grid';
  barsContainer.style.display = 'flex';
  barsContainer.style.flexDirection = 'column';
  barsContainer.style.gap = '1rem';
  barsContainer.style.marginBottom = '2rem';
  
  Object.entries(Relationship).forEach(([name, charInfo]) => {
    const key = charInfo.key;
    
    // Fetch values from global state (handling normalization and migrations)
    let stats = window.gameState?.relationships?.[key] || { affection: 0, trust: 0 };
    if (typeof stats === 'number') {
      stats = { affection: stats, trust: 0 };
    }
    
    const card = document.createElement('div');
    card.className = 'rel-bar-card';
    card.innerHTML = `
      <div class="rel-name-header">
        <span>${charInfo.icon} ${name}</span>
      </div>
      <div class="dual-bars">
        <div class="sub-bar-container">
          <span class="sub-bar-label">Affection</span>
          <div class="sub-bar-progress">
            <div class="fill-affection" style="height:100%; width:${stats.affection || 0}%; transition:width 0.4s ease;"></div>
          </div>
          <span style="font-size:0.75rem; font-weight:600; width:24px; text-align:right;">${stats.affection || 0}%</span>
        </div>
        <div class="sub-bar-container">
          <span class="sub-bar-label">Trust</span>
          <div class="sub-bar-progress">
            <div class="fill-trust" style="height:100%; width:${stats.trust || 0}%; transition:width 0.4s ease;"></div>
          </div>
          <span style="font-size:0.75rem; font-weight:600; width:24px; text-align:right;">${stats.trust || 0}%</span>
        </div>
      </div>
    `;
    barsContainer.appendChild(card);
  });
  
  container.appendChild(barsContainer);
  
  // 2️⃣ Render achievements grid at the bottom
  const achievementsTitle = document.createElement('h3');
  achievementsTitle.style.fontSize = '1.2rem';
  achievementsTitle.style.marginBottom = '1rem';
  achievementsTitle.textContent = 'Unlocked Achievements';
  container.appendChild(achievementsTitle);
  
  const grid = document.createElement('div');
  grid.className = 'achievements-grid';
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(120px, 1fr))';
  grid.style.gap = '1rem';
  
  const unlockedIds = window.gameState?.unlockedAchievements || [];
  
  ACHIEVEMENTS.forEach(ach => {
    // Sync state from save files
    const isUnlocked = unlockedIds.includes(ach.id);
    ach.unlocked = isUnlocked;
    
    const card = document.createElement('div');
    card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.alignItems = 'center';
    card.style.padding = '0.8rem';
    card.style.background = 'var(--glass-bg)';
    card.style.border = '1px solid var(--glass-border)';
    card.style.borderRadius = '12px';
    card.style.textAlign = 'center';
    card.style.opacity = isUnlocked ? '1' : '0.45';
    
    card.innerHTML = `
      <img src="${ach.icon}" alt="${ach.name}" style="width:40px; height:40px; margin-bottom:0.5rem; filter: ${isUnlocked ? 'none' : 'grayscale(100%)'};"/>
      <div style="font-size:0.85rem; font-weight:700; color:var(--text-primary);">${ach.name}</div>
      <div style="font-size:0.65rem; color:var(--text-secondary); margin-top:0.25rem; line-height:1.2;">${isUnlocked ? ach.description : '🔒 Locked'}</div>
    `;
    grid.appendChild(card);
  });
  
  container.appendChild(grid);
}
