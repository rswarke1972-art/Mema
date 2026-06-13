// endings.js – handles ending resolution and displaying final scorecard
import { unlockAchievement } from './achievements.js';
import { unlockCG, unlockMusicTrack } from './choices.js';
import { restartStory } from './save.js';

const ENDINGS_MAP = {
  true_love: {
    title: "The Master of Hartfield 💖",
    description: "You confess your feelings to Theodore (Mr. Knightley). He embraces you warmly, admitting he has loved you since you were a child. Together, you unite Hartfield and Donwell Abbey in a union of true respect and deep, lasting affection.",
    achievement: "true_love",
    music: "rain"
  },
  charming_mistake: {
    title: "A Flighty London Fancy 💔",
    description: "Emma decides to run away to London with Lucien (Frank Churchill). At first, the glittering parties and Lucien's sweet whispers thrill you, but soon his mounting debts and reckless heart leave you wishing you had listened to Theodore's warnings.",
    achievement: "broken_heart",
    music: "rain"
  },
  independent_woman: {
    title: "Mistress of Hartfield 🧠",
    description: "Emma politely declines all proposals, choosing to stay independent. You remain at Hartfield, guiding the local parish, studying literature, and governing your own life with unmatched pride, intellect, and grace.",
    achievement: "wise_lady",
    music: "rain"
  },
  queen_of_society: {
    title: "Sovereign of the Salon 👑",
    description: "Leveraging your massive influence and impeccable reputation, you establish yourself as the absolute ruler of high society. Not a single ball is thrown, nor marriage arranged, without the explicit approval of Miss Woodvale.",
    achievement: "reputation_queen",
    music: "ballroom"
  },
  lonely_pride: {
    title: "A Splendid Isolation 🦚",
    description: "Your pride and cold dismissals of others leave you isolated. The friends who once sought your counsel now pass by with polite nods. You sit alone in the grand halls of Hartfield, wondering if status was worth the silence.",
    achievement: "social_disaster",
    music: "rain"
  },
  matchmaker: {
    title: "The Benevolent Cupid 🏹",
    description: "Placing your own desires aside, you help Clara and Sir Edwin wed and reconcile. Seeing them walk hand-in-hand, you find a deep, quiet happiness in knowing that your wisdom brought joy to those you cherish most.",
    achievement: "matchmaker",
    music: "garden"
  },
  scandal: {
    title: "Exile from Rosemere 💥",
    description: "Your matchmaking interferences backfire and spark a major public scandal. High society shuts its doors to you, forcing you to pack your trunks and leave Rosemere in social exile under a cloud of whispers.",
    achievement: "social_disaster",
    music: "rain"
  },
  rival_queens: {
    title: "The Social Cold War ⚔️",
    description: "You challenge Mrs. Vivienne Elton directly for social supremacy. Rosemere splits into two warring factions, entering a lifelong battle of subtle snubs, rival garden parties, and elegant shade.",
    achievement: "reputation_queen",
    music: "ballroom"
  }
};

/**
 * Determine which ending to show and render the scorecard in the main container.
 */
export function resolveEnding() {
  const endingKey = window.gameState?.ending || 'independent_woman';
  const ending = ENDINGS_MAP[endingKey] || ENDINGS_MAP.independent_woman;
  
  // 1️⃣ Unlock final rewards
  if (ending.achievement) {
    unlockAchievement(ending.achievement);
  }
  unlockCG('finale');
  if (ending.music) {
    unlockMusicTrack(ending.music);
  }
  
  // 2️⃣ Render the ending view inside the main content container
  const container = document.getElementById('main');
  if (!container) return;
  
  // Build choice log summary HTML
  let logHtml = '';
  if (window.gameState?.choiceLog && window.gameState.choiceLog.length > 0) {
    logHtml = window.gameState.choiceLog.map((log, idx) => `
      <div style="border-left: 2px solid var(--color-rose); padding-left: 8px; margin-bottom: 8px; font-size: 0.85rem;">
        <span style="color:var(--text-secondary); font-size: 0.7rem; font-weight:700;">STEP ${idx+1}: ${log.speaker}</span>
        <div style="color:var(--text-primary); font-weight:600;">"${log.choiceText}"</div>
      </div>
    `).join('');
  } else {
    logHtml = '<p style="color:var(--text-secondary); font-size: 0.85rem;">No choice logs recorded.</p>';
  }

  container.innerHTML = `
    <section class="dialogue-card fade-in" style="width: 100%; max-width: 600px; text-align: center;">
      <span class="speaker-name" style="margin-bottom: 1rem;">EPILOGUE</span>
      <h2 class="ending-title" style="margin: 0.5rem 0 1rem 0; font-size: 1.8rem; color:var(--color-gold-accent);">${ending.title}</h2>
      <p class="ending-description" style="line-height: 1.6; text-align: left; margin-bottom: 1.5rem; font-size: 1rem; color:var(--text-primary);">${ending.description}</p>
      
      <!-- Summary section -->
      <div class="summary-section" style="border-top: 1px solid var(--glass-border); padding-top: 1.2rem; margin-top: 1.2rem; text-align: left;">
        <h3 style="font-size: 1.1rem; margin-bottom: 0.8rem; color:var(--color-gold-accent);">Your Book of Choices Summary</h3>
        <div class="choices-scroll" style="max-height: 150px; overflow-y: auto; background:rgba(0,0,0,0.02); padding: 0.8rem; border-radius: 8px; border: 1px solid var(--glass-border);">
          ${logHtml}
        </div>
      </div>

      <button id="ending-restart-btn" class="btn-primary" style="margin-top: 1.5rem; width: 100%; max-width: 250px;">Restart Adventure</button>
    </section>
  `;
  
  // Attach event listener
  document.getElementById('ending-restart-btn').addEventListener('click', () => {
    restartStory();
  });
}
